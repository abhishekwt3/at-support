// server/socket/socket.go
package socket

import (
    "log"
    "time"
    
    "server/database"
    "server/database/models"

    socketio "github.com/googollee/go-socket.io"
)

var Server *socketio.Server

// InitSocketServer initializes the Socket.IO server
func InitSocketServer() {
    // Create a new server
    Server = socketio.NewServer(nil)

    // Handle new connections
    Server.OnConnect("/", func(s socketio.Conn) error {
        log.Println("Client connected:", s.ID())
        return nil
    })

    // Handle disconnections
    Server.OnDisconnect("/", func(s socketio.Conn, reason string) {
        log.Println("Client disconnected:", s.ID(), reason)
    })

    // Handle joining a conversation room
    Server.OnEvent("/", "join", func(s socketio.Conn, conversationId string) {
        log.Println("Client", s.ID(), "joined conversation:", conversationId)
        s.Join(conversationId)
    })

    // Handle leaving a conversation room
    Server.OnEvent("/", "leave", func(s socketio.Conn, conversationId string) {
        log.Println("Client", s.ID(), "left conversation:", conversationId)
        s.Leave(conversationId)
    })

    // Handle sending a message
    Server.OnEvent("/", "send_message", func(s socketio.Conn, msg map[string]interface{}) {
        conversationId := msg["conversationId"].(string)
        content := msg["content"].(string)
        senderId := msg["senderId"].(string)
        senderName := msg["senderName"].(string)
        isOwner := msg["isOwner"].(bool)

        // Create and save the message to database
        message := models.Message{
            Content:        content,
            SenderID:       senderId,
            ConversationID: conversationId,
            IsOwner:        isOwner,
            CreatedAt:      time.Now(),
        }

        database.DB.Create(&message)

        // Update conversation timestamp
        database.DB.Model(&models.Conversation{}).Where("id = ?", conversationId).Update("updated_at", message.CreatedAt)

        // Broadcast the message to everyone in the conversation room
        Server.BroadcastToRoom("/", conversationId, "new_message", map[string]interface{}{
            "id":             message.ID,
            "content":        message.Content,
            "senderId":       message.SenderID,
            "conversationId": message.ConversationID,
            "isOwner":        message.IsOwner,
            "createdAt":      message.CreatedAt,
            "sender": map[string]interface{}{
                "id":   senderId,
                "name": senderName,
            },
        })
    })

    // Start the server
    go Server.Serve()
    
    // Handle any server errors
    go func() {
        if err := Server.Serve(); err != nil {
            log.Fatalf("Socket.IO server error: %v", err)
        }
    }()
    
    log.Println("Socket.IO server initialized")
}

// CloseSocketServer closes the Socket.IO server
func CloseSocketServer() {
    if Server != nil {
        Server.Close()
    }
}