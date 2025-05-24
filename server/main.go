// server/main.go
package main

import (
    "encoding/json"
    "log"
    "os"
    "sync"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    recoverMiddleware "github.com/gofiber/fiber/v2/middleware/recover"
    "github.com/gofiber/websocket/v2"
    "github.com/joho/godotenv"

    "server/database"
    "server/database/models"
    "server/routes"
    "server/utils"
)

// WebSocket related types and variables
type WSClient struct {
    Conn     *websocket.Conn
    RoomsMtx sync.RWMutex
    Rooms    map[string]bool
}

type WSMessage struct {
    Type           string                 `json:"type"`
    Content        string                 `json:"content,omitempty"`
    ConversationID string                 `json:"conversationId,omitempty"`
    SenderID       string                 `json:"senderId,omitempty"`
    SenderName     string                 `json:"senderName,omitempty"`
    IsOwner        bool                   `json:"isOwner,omitempty"`
    Data           map[string]interface{} `json:"data,omitempty"`
}

var (
    // Clients holds all connected websocket clients
    wsClients = make(map[*WSClient]bool)
    // ClientsMutex protects the clients map
    wsClientsMutex sync.RWMutex
    // RoomClients maps room names to sets of clients
    wsRoomClients = make(map[string]map[*WSClient]bool)
    // RoomMutex protects the roomClients map
    wsRoomMutex sync.RWMutex
)

func main() {
    // Load environment variables from .env file
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Setup database connection
    if err := database.Connect(); err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    
    // Run data migration for new URL structure
    if shouldMigrate() {
        utils.MigrateData()
    }

    // Initialize Fiber app with custom settings
    app := fiber.New(fiber.Config{
        ErrorHandler: func(c *fiber.Ctx, err error) error {
            code := fiber.StatusInternalServerError

            // Check if it's a Fiber error
            if e, ok := err.(*fiber.Error); ok {
                code = e.Code
            }

            // Return JSON error
            return c.Status(code).JSON(fiber.Map{
                "error": err.Error(),
            })
        },
    })

    // Add middleware
    app.Use(recoverMiddleware.New())
    app.Use(logger.New())
    
    // CORS configuration
    app.Use(cors.New(cors.Config{
        AllowOrigins:     "*",
        AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
        AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Requested-With",
        AllowCredentials: false,
        ExposeHeaders:    "Content-Length",
        MaxAge:           86400, // 24 hours
    }))

    // WebSocket upgrade middleware
    app.Use("/ws", func(c *fiber.Ctx) error {
        // IsWebSocketUpgrade returns true if the client
        // requested upgrade to the WebSocket protocol.
        if websocket.IsWebSocketUpgrade(c) {
            c.Locals("allowed", true)
            return c.Next()
        }
        return fiber.ErrUpgradeRequired
    })

    // WebSocket route
    app.Get("/ws", websocket.New(func(c *websocket.Conn) {
        // Handle new WebSocket connection
        handleWebSocketConnection(c)
    }))

    // Setup regular API routes
    routes.SetupRoutes(app)

    // Add healthcheck endpoint
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.SendString("OK")
    })

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "3001"
    }

    log.Printf("Server starting on port %s...\n", port)
    if err := app.Listen(":" + port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}

// shouldMigrate checks if migration should be performed
func shouldMigrate() bool {
    // Default to true - always migrate by default
    migrate := true
    
    // Check for env variable to disable migration
    skipMigrate := os.Getenv("SKIP_MIGRATION")
    if skipMigrate == "true" || skipMigrate == "1" || skipMigrate == "yes" {
        migrate = false
    }
    
    return migrate
}

// handleWebSocketConnection handles a new WebSocket connection
func handleWebSocketConnection(c *websocket.Conn) {
    // Create a new client
    client := &WSClient{
        Conn:  c,
        Rooms: make(map[string]bool),
    }

    // Register the client
    wsClientsMutex.Lock()
    wsClients[client] = true
    wsClientsMutex.Unlock()

    log.Println("WebSocket client connected")

    // Handle WebSocket messages
    defer func() {
        // Handle panics
        if r := recover(); r != nil {
            log.Printf("Recovered from panic in WebSocket handler: %v", r)
        }

        // Remove client from rooms
        client.RoomsMtx.RLock()
        rooms := make([]string, 0, len(client.Rooms))
        for room := range client.Rooms {
            rooms = append(rooms, room)
        }
        client.RoomsMtx.RUnlock()

        for _, room := range rooms {
            wsLeaveRoom(client, room)
        }

        // Remove client from clients map
        wsClientsMutex.Lock()
        delete(wsClients, client)
        wsClientsMutex.Unlock()

        log.Println("WebSocket client disconnected")
    }()

    // Message handling loop
    for {
        _, rawMessage, err := c.ReadMessage()
        if err != nil {
            log.Printf("WebSocket read error: %v", err)
            break
        }

        var msg WSMessage
        if err := json.Unmarshal(rawMessage, &msg); err != nil {
            log.Printf("WebSocket JSON parse error: %v", err)
            continue
        }

        log.Printf("Received WebSocket message: %+v", msg)

        // Handle different message types
        switch msg.Type {
        case "join":
            if msg.ConversationID != "" {
                wsJoinRoom(client, msg.ConversationID)
                log.Printf("WebSocket client joined room: %s", msg.ConversationID)

                // Send acknowledgment
                ack := WSMessage{
                    Type: "join_ack",
                    Data: map[string]interface{}{
                        "conversationId": msg.ConversationID,
                        "status":         "joined",
                    },
                }
                wsSendToClient(client, ack)
            }

        case "leave":
            if msg.ConversationID != "" {
                wsLeaveRoom(client, msg.ConversationID)
                log.Printf("WebSocket client left room: %s", msg.ConversationID)
            }

        case "message":
            if msg.ConversationID != "" && msg.Content != "" {
                // Create and save the message to database
                message := models.Message{
                    Content:        msg.Content,
                    SenderID:       msg.SenderID,
                    ConversationID: msg.ConversationID,
                    IsOwner:        msg.IsOwner,
                    CreatedAt:      time.Now(),
                }

                result := database.DB.Create(&message)
                if result.Error != nil {
                    log.Printf("Error saving message to database: %v", result.Error)
                    continue
                }

                // Update conversation timestamp
                database.DB.Model(&models.Conversation{}).Where("id = ?", msg.ConversationID).Update("updated_at", message.CreatedAt)

                // Create a new message to broadcast
                broadcastMsg := WSMessage{
                    Type:           "new_message",
                    Content:        message.Content,
                    ConversationID: message.ConversationID,
                    SenderID:       message.SenderID,
                    SenderName:     msg.SenderName,
                    IsOwner:        message.IsOwner,
                    Data: map[string]interface{}{
                        "id":          message.ID,
                        "createdAt":   message.CreatedAt,
                        "sender": map[string]interface{}{
                            "id":   msg.SenderID,
                            "name": msg.SenderName,
                        },
                    },
                }

                // Broadcast to the room
                wsBroadcastToRoom(msg.ConversationID, broadcastMsg)
                log.Printf("Broadcasted message to room %s", msg.ConversationID)
            }
        }
    }
}

// wsJoinRoom adds a client to a room
func wsJoinRoom(client *WSClient, room string) {
    // Add room to client's rooms
    client.RoomsMtx.Lock()
    client.Rooms[room] = true
    client.RoomsMtx.Unlock()

    // Add client to room
    wsRoomMutex.Lock()
    if _, exists := wsRoomClients[room]; !exists {
        wsRoomClients[room] = make(map[*WSClient]bool)
    }
    wsRoomClients[room][client] = true
    wsRoomMutex.Unlock()
}

// wsLeaveRoom removes a client from a room
func wsLeaveRoom(client *WSClient, room string) {
    // Remove room from client's rooms
    client.RoomsMtx.Lock()
    delete(client.Rooms, room)
    client.RoomsMtx.Unlock()

    // Remove client from room
    wsRoomMutex.Lock()
    if clients, exists := wsRoomClients[room]; exists {
        delete(clients, client)
        if len(clients) == 0 {
            delete(wsRoomClients, room)
        }
    }
    wsRoomMutex.Unlock()
}

// wsBroadcastToRoom sends a message to all clients in a room
func wsBroadcastToRoom(room string, msg WSMessage) {
    // Get all clients in the room
    wsRoomMutex.RLock()
    clients, exists := wsRoomClients[room]
    if !exists {
        wsRoomMutex.RUnlock()
        return
    }

    // Make a copy of clients to avoid holding the lock while sending
    clientList := make([]*WSClient, 0, len(clients))
    for client := range clients {
        clientList = append(clientList, client)
    }
    wsRoomMutex.RUnlock()

    // Broadcast the message to all clients in the room
    for _, client := range clientList {
        wsSendToClient(client, msg)
    }
}

// wsSendToClient sends a message to a specific client
func wsSendToClient(client *WSClient, msg WSMessage) {
    jsonData, err := json.Marshal(msg)
    if err != nil {
        log.Printf("Error marshaling message: %v", err)
        return
    }

    if err := client.Conn.WriteMessage(websocket.TextMessage, jsonData); err != nil {
        log.Printf("Error writing message: %v", err)
    }
}
