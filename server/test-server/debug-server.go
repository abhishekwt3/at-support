package main

import (
	"encoding/json"
	"log"
	//"net/http"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

// Client represents a websocket client
type Client struct {
	Conn     *websocket.Conn
	RoomsMtx sync.RWMutex
	Rooms    map[string]bool
}

// Message represents a chat message
type Message struct {
	Type           string                 `json:"type"`
	Content        string                 `json:"content,omitempty"`
	ConversationID string                 `json:"conversationId,omitempty"`
	SenderID       string                 `json:"senderId,omitempty"`
	SenderName     string                 `json:"senderName,omitempty"`
	IsOwner        bool                   `json:"isOwner,omitempty"`
	Data           map[string]interface{} `json:"data,omitempty"`
}

var (
	// Clients holds all connected clients
	clients = make(map[*Client]bool)
	// ClientsMutex protects the clients map
	clientsMutex sync.RWMutex
	// RoomClients maps room names to sets of clients
	roomClients = make(map[string]map[*Client]bool)
	// RoomMutex protects the roomClients map
	roomMutex sync.RWMutex
)

func main() {
	app := fiber.New()

	// Configure CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*", // Allow all origins for testing
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		AllowCredentials: false,
	}))

	// Setup Websocket route
	app.Use("/ws", func(c *fiber.Ctx) error {
		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// Handle WebSocket connections
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		// Create a new client
		client := &Client{
			Conn:  c,
			Rooms: make(map[string]bool),
		}

		// Register the client
		clientsMutex.Lock()
		clients[client] = true
		clientsMutex.Unlock()

		log.Println("Client connected")

		// Handle WebSocket messages
		defer func() {
			// Handle panics
			if r := recover(); r != nil {
				log.Printf("Recovered from panic: %v", r)
			}

			// Remove client from rooms
			client.RoomsMtx.RLock()
			rooms := make([]string, 0, len(client.Rooms))
			for room := range client.Rooms {
				rooms = append(rooms, room)
			}
			client.RoomsMtx.RUnlock()

			for _, room := range rooms {
				leaveRoom(client, room)
			}

			// Remove client from clients map
			clientsMutex.Lock()
			delete(clients, client)
			clientsMutex.Unlock()

			log.Println("Client disconnected")
		}()

		// Message handling loop
		for {
			_, rawMessage, err := c.ReadMessage()
			if err != nil {
				log.Printf("Read error: %v", err)
				break
			}

			var msg Message
			if err := json.Unmarshal(rawMessage, &msg); err != nil {
				log.Printf("JSON parse error: %v", err)
				continue
			}

			log.Printf("Received message: %+v", msg)

			// Handle different message types
			switch msg.Type {
			case "join":
				if msg.ConversationID != "" {
					joinRoom(client, msg.ConversationID)
					log.Printf("Client joined room: %s", msg.ConversationID)

					// Send acknowledgment
					ack := Message{
						Type: "join_ack",
						Data: map[string]interface{}{
							"conversationId": msg.ConversationID,
							"status":         "joined",
						},
					}
					sendToClient(client, ack)
				}

			case "leave":
				if msg.ConversationID != "" {
					leaveRoom(client, msg.ConversationID)
					log.Printf("Client left room: %s", msg.ConversationID)
				}

			case "message":
				if msg.ConversationID != "" && msg.Content != "" {
					// Create a new message to broadcast
					broadcastMsg := Message{
						Type:           "new_message",
						Content:        msg.Content,
						ConversationID: msg.ConversationID,
						SenderID:       msg.SenderID,
						SenderName:     msg.SenderName,
						IsOwner:        msg.IsOwner,
					}

					// Broadcast to the room
					broadcastToRoom(msg.ConversationID, broadcastMsg)
					log.Printf("Broadcasted message to room %s", msg.ConversationID)
				}
			}
		}
	}))

	// Serve static files
	app.Static("/", "./public")

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	// Start the server
	log.Println("Starting WebSocket server on http://localhost:3001")
	log.Fatal(app.Listen(":3001"))
}

// joinRoom adds a client to a room
func joinRoom(client *Client, room string) {
	// Add room to client's rooms
	client.RoomsMtx.Lock()
	client.Rooms[room] = true
	client.RoomsMtx.Unlock()

	// Add client to room
	roomMutex.Lock()
	if _, exists := roomClients[room]; !exists {
		roomClients[room] = make(map[*Client]bool)
	}
	roomClients[room][client] = true
	roomMutex.Unlock()
}

// leaveRoom removes a client from a room
func leaveRoom(client *Client, room string) {
	// Remove room from client's rooms
	client.RoomsMtx.Lock()
	delete(client.Rooms, room)
	client.RoomsMtx.Unlock()

	// Remove client from room
	roomMutex.Lock()
	if clients, exists := roomClients[room]; exists {
		delete(clients, client)
		if len(clients) == 0 {
			delete(roomClients, room)
		}
	}
	roomMutex.Unlock()
}

// broadcastToRoom sends a message to all clients in a room
func broadcastToRoom(room string, msg Message) {
	// Get all clients in the room
	roomMutex.RLock()
	clients, exists := roomClients[room]
	if !exists {
		roomMutex.RUnlock()
		return
	}

	// Make a copy of clients to avoid holding the lock while sending
	clientList := make([]*Client, 0, len(clients))
	for client := range clients {
		clientList = append(clientList, client)
	}
	roomMutex.RUnlock()

	// Broadcast the message to all clients in the room
	for _, client := range clientList {
		sendToClient(client, msg)
	}
}

// sendToClient sends a message to a specific client
func sendToClient(client *Client, msg Message) {
	jsonData, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	if err := client.Conn.WriteMessage(websocket.TextMessage, jsonData); err != nil {
		log.Printf("Error writing message: %v", err)
	}
}