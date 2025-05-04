package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"server/config"
	"server/database"
	"server/database/models"
)

// SendMessageRequest represents the expected body for sending a message
type SendMessageRequest struct {
	Content        string `json:"content" validate:"required"`
	ConversationID string `json:"conversationId" validate:"required"`
	CustomerID     string `json:"customerId"`
	CustomerName   string `json:"customerName"`
}

// SendMessage sends a message in a conversation
func SendMessage(c *fiber.Ctx) error {
	// Parse request body
	var req SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if req.Content == "" || req.ConversationID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Content and conversationId are required",
		})
	}

	// Check if this is from the owner (authenticated user)
	isOwner := false
	senderID := req.CustomerID

	// Get JWT token if present
	authHeader := c.Get("Authorization")
	if authHeader != "" {
		// Extract userID from token
		userID := extractUserID(authHeader)
		if userID != "" {
			// Verify the user owns this conversation
			var conversation models.Conversation
			result := database.DB.Where("id = ?", req.ConversationID).First(&conversation)
			if result.Error == nil && conversation.OwnerID == userID {
				isOwner = true
				senderID = userID
			}
		}
	}

	// Create the message
	message := models.Message{
		Content:        req.Content,
		SenderID:       senderID,
		ConversationID: req.ConversationID,
		IsOwner:        isOwner,
		CreatedAt:      time.Now(),
	}

	result := database.DB.Create(&message)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create message",
		})
	}

	// Update conversation timestamp
	database.DB.Model(&models.Conversation{}).Where("id = ?", req.ConversationID).Update("updated_at", time.Now())

	// Get sender information
	var sender models.User
	if isOwner {
		database.DB.Select("id, name").Where("id = ?", senderID).First(&sender)
		message.Sender = sender
	} else {
		// For customers, create a temporary sender object
		message.Sender = models.User{
			ID:   senderID,
			Name: req.CustomerName,
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": message,
	})
}

// Helper function to extract user ID from JWT token
func extractUserID(authHeader string) string {
	// Extract token from Authorization header
	if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		return ""
	}
	tokenString := authHeader[7:]

	// Parse and validate the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the algorithm
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token signing method")
		}
		
		// Return the secret key
		cfg := config.LoadConfig()
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return ""
	}

	// Extract user ID from claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if userID, ok := claims["id"].(string); ok {
			return userID
		}
	}

	return ""
}