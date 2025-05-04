package handlers

import (
	"github.com/gofiber/fiber/v2"
	"fmt"
	"server/database"
	"server/database/models"
	"server/utils"
)

// CreatePortalRequest represents the expected body for portal creation
type CreatePortalRequest struct {
	Name string `json:"name" validate:"required"`
}

// GenerateLinkRequest represents the expected body for generating a conversation link
type GenerateLinkRequest struct {
	Category string `json:"category" validate:"required"`
}

// LinkResponse represents the response for a generated conversation link
type LinkResponse struct {
	Conversation    models.Conversation `json:"conversation"`
	ConversationLink string             `json:"conversationLink"`
}

// GetPortals returns all portals owned by the authenticated user
func GetPortals(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Find all portals owned by the user
	var portals []models.Portal
	result := database.DB.Where("owner_id = ?", userID).Find(&portals)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch portals",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"portals": portals,
	})
}

// GetPortalByID returns a specific portal by ID
func GetPortalByID(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)
	portalId := c.Params("id")
	fmt.Printf("Looking up portal with ID: %s\n", portalId)
	// Get portal ID from URL
	portalID := c.Params("id")

	// Find the portal
	var portal models.Portal
	result := database.DB.Where("id = ? AND owner_id = ?", portalID, userID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"portal": portal,
	})
}

// GetPublicPortalByID returns public portal info
func GetPublicPortalByID(c *fiber.Ctx) error {
	// Get portal ID from URL
	portalID := c.Params("id")

	// Find the portal
	var portal models.Portal
	result := database.DB.Where("id = ?", portalID).Select("id, name").First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"portal": portal,
	})
}

// CreatePortal creates a new portal
func CreatePortal(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Parse request body
	var req CreatePortalRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name is required",
		})
	}

	// Check if user already has a portal
	var existingPortals []models.Portal
	database.DB.Where("owner_id = ?", userID).Find(&existingPortals)
	if len(existingPortals) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "You already have a portal created",
		})
	}

	// Check if portal name is already taken
	var existingPortal models.Portal
	result := database.DB.Where("name = ?", req.Name).First(&existingPortal)
	if result.RowsAffected > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "This portal name is already taken",
		})
	}

	// Create the portal
	portal := models.Portal{
		Name:    req.Name,
		OwnerID: userID,
	}

	result = database.DB.Create(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create portal",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"portal": portal,
	})
}

// GetPortalConversations returns all conversations for a portal
func GetPortalConversations(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get portal ID from URL
	portalID := c.Params("id")

	// Verify portal ownership
	var portal models.Portal
	result := database.DB.Where("id = ? AND owner_id = ?", portalID, userID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found or unauthorized",
		})
	}

	// Get all conversations for the portal
	var conversations []models.Conversation
	database.DB.Where("portal_id = ?", portalID).Order("updated_at DESC").Find(&conversations)

	// Count messages for each conversation
	for i := range conversations {
		var count int64
		database.DB.Model(&models.Message{}).Where("conversation_id = ?", conversations[i].ID).Count(&count)
		conversations[i].MessageCount = count
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversations": conversations,
	})
}

// GetPortalActiveConversations returns active conversations for a portal
func GetPortalActiveConversations(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get portal ID from URL
	portalID := c.Params("id")

	// Verify portal ownership
	var portal models.Portal
	result := database.DB.Where("id = ? AND owner_id = ?", portalID, userID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found or unauthorized",
		})
	}

	// Get active conversations (those with customer and messages)
	var conversations []models.Conversation
	database.DB.Where("portal_id = ? AND customer_name != ?", portalID, "Unassigned").Order("updated_at DESC").Find(&conversations)

	// Filter conversations with messages and count them
	var activeConversations []models.Conversation
	for _, conv := range conversations {
		var count int64
		database.DB.Model(&models.Message{}).Where("conversation_id = ?", conv.ID).Count(&count)
		
		if count > 0 {
			conv.MessageCount = count
			activeConversations = append(activeConversations, conv)
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"conversations": activeConversations,
	})
}

// GenerateConversationLink generates a unique conversation link
func GenerateConversationLink(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get portal ID from URL
	portalID := c.Params("id")

	// Parse request body
	var req GenerateLinkRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if req.Category == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Category is required",
		})
	}

	// Verify portal ownership
	var portal models.Portal
	result := database.DB.Where("id = ? AND owner_id = ?", portalID, userID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found or unauthorized",
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

	// Create a placeholder conversation
	conversation := models.Conversation{
		UniqueCode:   uniqueCode,
		Category:     req.Category,
		CustomerID:   "placeholder", // Will be updated when a customer connects
		CustomerName: "Unassigned",  // Will be updated when a customer connects
		OwnerID:      userID,
		PortalID:     portalID,
	}

	result = database.DB.Create(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create conversation",
		})
	}

	// Generate the conversation link
	conversationLink := "/portal/" + portalID + "/" + uniqueCode

	return c.Status(fiber.StatusCreated).JSON(LinkResponse{
		Conversation:    conversation,
		ConversationLink: conversationLink,
	})
}