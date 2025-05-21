package handlers

import (
	"github.com/gofiber/fiber/v2"
	"server/database"
	"server/database/models"
)

// DeleteCategory deletes a category and all associated conversations
func DeleteCategory(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get portal ID and category slug from URL
	portalID := c.Params("id")
	categorySlug := c.Params("categorySlug")

	// Verify portal ownership
	var portal models.Portal
	result := database.DB.Where("id = ? AND owner_id = ?", portalID, userID).First(&portal)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Portal not found or unauthorized",
		})
	}

	// Start a transaction
	tx := database.DB.Begin()

	// Find all conversations with this category
	var conversations []models.Conversation
	tx.Where("portal_id = ? AND category_slug = ?", portalID, categorySlug).Find(&conversations)

	// Delete all messages for these conversations
	for _, conv := range conversations {
		tx.Where("conversation_id = ?", conv.ID).Delete(&models.Message{})
	}

	// Delete all conversations with this category
	result = tx.Where("portal_id = ? AND category_slug = ?", portalID, categorySlug).Delete(&models.Conversation{})
	
	// If no conversations were found, check if the category exists
	if result.RowsAffected == 0 {
		// Find at least one placeholder conversation with this category slug
		var placeholderConversation models.Conversation
		tx.Where("portal_id = ? AND category_slug = ? AND customer_name = ?", 
			portalID, categorySlug, "Unassigned").First(&placeholderConversation)
		
		if tx.Error != nil {
			tx.Rollback()
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Category not found",
			})
		}
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete category and associated conversations",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Category and associated conversations deleted successfully",
	})
}