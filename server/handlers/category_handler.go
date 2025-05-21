package handlers

import (
	"github.com/gofiber/fiber/v2"

	"server/database"
	"server/database/models"
	"server/utils"
)

// HandleCategoryAccess generates a new conversation when a user accesses a category URL
func HandleCategoryAccess(c *fiber.Ctx) error {
	// Get parameters from URL
	portalName := c.Params("portalName")
	categorySlug := c.Params("categorySlug")
	
	if portalName == "" || categorySlug == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing required URL parameters",
		})
	}
	
	// First, find the portal by custom name
	var portal models.Portal
	portalResult := database.DB.Where("custom_name = ?", portalName).First(&portal)
	if portalResult.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found",
		})
	}
	
	// Find the original category name from the slug
	category := utils.Unslugify(categorySlug)
	
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
		Category:     category,
		CategorySlug: categorySlug,
		CustomerID:   "placeholder", // Will be updated when customer enters their name
		CustomerName: "Unassigned",  // Will be updated when customer enters their name
		OwnerID:      portal.OwnerID,
		PortalID:     portal.ID,
	}
	
	result := database.DB.Create(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create conversation",
		})
	}
	
	// Redirect to the full URL with the unique code
	redirectURL := "/portal/" + portalName + "/" + categorySlug + "/" + uniqueCode
	
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"conversation": conversation,
		"redirectURL": redirectURL,
	})
}