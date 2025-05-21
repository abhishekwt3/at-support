package handlers

import (
	"github.com/gofiber/fiber/v2"
	"server/database"
	"server/database/models"
	"server/utils"
)

// UpdatePortalRequest represents the expected body for portal update
type UpdatePortalRequest struct {
	Name string `json:"name" validate:"required"`
}

// UpdatePortal updates a portal name if there are no existing conversations
func UpdatePortal(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get portal ID from URL
	portalID := c.Params("id")

	// Parse request body
	var req UpdatePortalRequest
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

	// Verify portal ownership
	var portal models.Portal
	result := database.DB.Where("id = ? AND owner_id = ?", portalID, userID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found or unauthorized",
		})
	}

	// Check if name is already taken
	var existingPortal models.Portal
	result = database.DB.Where("name = ? AND id != ?", req.Name, portalID).First(&existingPortal)
	if result.RowsAffected > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "This portal name is already taken",
		})
	}

	// Check if there are any conversations
	var count int64
	result = database.DB.Model(&models.Conversation{}).Where("portal_id = ?", portalID).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot update portal name when conversations exist. Please delete all conversations first.",
		})
	}

	// Generate custom name based on new name
	customName := utils.Slugify(req.Name)
	
	// Check if custom name is already taken
	result = database.DB.Where("custom_name = ? AND id != ?", customName, portalID).First(&existingPortal)
	if result.RowsAffected > 0 {
		// Append a random string to make it unique
		customName = customName + "-" + utils.GenerateRandomCode()
	}

	// Update the portal
	portal.Name = req.Name
	portal.CustomName = customName
	result = database.DB.Save(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update portal",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"portal": portal,
	})
}