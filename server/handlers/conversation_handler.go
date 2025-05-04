package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"server/database"
	"server/database/models"
	"server/utils"
)

// CreateConversationRequest represents the expected body for conversation creation
type CreateConversationRequest struct {
	PortalID      string `json:"portalId" validate:"required"`
	CustomerName  string `json:"customerName" validate:"required"`
	Category      string `json:"category" validate:"required"`
}

// UpdateCustomerRequest represents the expected body for updating customer info
type UpdateCustomerRequest struct {
	CustomerName string `json:"customerName" validate:"required"`
	CustomerID   string `json:"customerId" validate:"required"`
}

// GetConversation returns a specific conversation by ID
func GetConversation(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get conversation ID from URL
	conversationID := c.Params("id")

	// Find the conversation with messages
	var conversation models.Conversation
	result := database.DB.Preload("Messages", func(db *gorm.DB) *gorm.DB {
		return db.Order("messages.created_at ASC")
	}).Where("id = ? AND owner_id = ?", conversationID, userID).First(&conversation)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Conversation not found or unauthorized",
		})
	}

	// Get sender information for each message
	for i := range conversation.Messages {
		var sender models.User
		database.DB.Select("id, name").Where("id = ?", conversation.Messages[i].SenderID).First(&sender)
		conversation.Messages[i].Sender = sender
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversation": conversation,
	})
}

// DeleteConversation deletes a conversation and all its messages
func DeleteConversation(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get conversation ID from URL
	conversationID := c.Params("id")

	// Verify conversation ownership
	var conversation models.Conversation
	result := database.DB.Where("id = ? AND owner_id = ?", conversationID, userID).First(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Conversation not found or unauthorized",
		})
	}

	// Delete all messages in the conversation
	database.DB.Where("conversation_id = ?", conversationID).Delete(&models.Message{})

	// Delete the conversation
	database.DB.Delete(&conversation)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
	})
}

// GetConversationMessages returns all messages for a conversation
func GetConversationMessages(c *fiber.Ctx) error {
	// Get conversation ID from URL
	conversationID := c.Params("id")

	// Find all messages for the conversation
	var messages []models.Message
	database.DB.Where("conversation_id = ?", conversationID).Order("created_at ASC").Find(&messages)

	// Get sender information for each message
	for i := range messages {
		var sender models.User
		database.DB.Select("id, name").Where("id = ?", messages[i].SenderID).First(&sender)
		messages[i].Sender = sender
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"messages": messages,
	})
}

// GetConversationByCode returns a conversation by its unique code
func GetConversationByCode(c *fiber.Ctx) error {
	// Get unique code from URL
	uniqueCode := c.Params("uniqueCode")

	// Find the conversation
	var conversation models.Conversation
	result := database.DB.Preload("Portal", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name")
	}).Where("unique_code = ?", uniqueCode).First(&conversation)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Conversation not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversation": conversation,
	})
}

// UpdateCustomerInfo updates customer information for a conversation
func UpdateCustomerInfo(c *fiber.Ctx) error {
	// Get conversation ID from URL
	conversationID := c.Params("id")

	// Parse request body
	var req UpdateCustomerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if req.CustomerName == "" || req.CustomerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Customer name and ID are required",
		})
	}

	// Find the conversation
	var conversation models.Conversation
	result := database.DB.Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Conversation not found",
		})
	}

	// Update customer information
	conversation.CustomerName = req.CustomerName
	conversation.CustomerID = req.CustomerID
	database.DB.Save(&conversation)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversation": conversation,
	})
}

// CreateConversation creates a new conversation
func CreateConversation(c *fiber.Ctx) error {
	// Parse request body
	var req CreateConversationRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if req.PortalID == "" || req.CustomerName == "" || req.Category == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Portal ID, customer name, and category are required",
		})
	}

	// Find the portal to get the owner ID
	var portal models.Portal
	result := database.DB.Where("id = ?", req.PortalID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found",
		})
	}

	// Generate a unique code
	uniqueCode := utils.GenerateRandomCode()

	// Ensure the code is unique
	for {
		var existingConversation models.Conversation
		result := database.DB.Where("unique_code = ?", uniqueCode).First(&existingConversation)
		if result.Error != nil {
			// No conversation found with this code, it's unique
			break
		}
		// If code already exists, generate a new one
		uniqueCode = utils.GenerateRandomCode()
	}

	// Create a new conversation
	conversation := models.Conversation{
		UniqueCode:   uniqueCode,
		Category:     req.Category,
		CustomerID:   "customer-" + utils.GenerateRandomCode(), // Generate a unique customer ID
		CustomerName: req.CustomerName,
		OwnerID:      portal.OwnerID,
		PortalID:     req.PortalID,
	}

	result = database.DB.Create(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create conversation",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"conversation": conversation,
	})
}

// GetPublicConversation returns basic public information about a conversation
func GetPublicConversation(c *fiber.Ctx) error {
	// Get conversation ID from URL
	conversationID := c.Params("id")

	// Find the conversation
	var conversation models.Conversation
	result := database.DB.Select("id, customer_name, category, portal_id").Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Conversation not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversation": conversation,
	})
}