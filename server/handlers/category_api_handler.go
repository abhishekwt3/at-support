package handlers

import (
	"github.com/gofiber/fiber/v2"
	"server/database"
	"server/database/models"
	"server/utils"
	"time"
)

// Category represents a support category
type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	PortalID    string    `json:"portalId"`
	ActiveCount int       `json:"activeCount"`
	CreatedAt   time.Time `json:"createdAt"`
}

// AddCategoryRequest represents the expected body for adding a category
type AddCategoryRequest struct {
	Name string `json:"name" validate:"required"`
}

// GetPortalCategories returns all categories for a portal
func GetPortalCategories(c *fiber.Ctx) error {
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

	// Get all conversations for the portal to extract unique categories
	var conversations []models.Conversation
	database.DB.Where("portal_id = ?", portalID).Find(&conversations)

	// Create a map to keep track of unique categories
	categoryMap := make(map[string]*Category)

	// Extract unique categories from conversations
	for _, conv := range conversations {
		if conv.Category == "" {
			continue
		}

		slug := conv.CategorySlug
		if slug == "" {
			slug = utils.Slugify(conv.Category)
		}

		if _, exists := categoryMap[slug]; !exists {
			// Create a new category if it doesn't exist
			categoryMap[slug] = &Category{
				ID:          slug,
				Name:        conv.Category,
				Slug:        slug,
				PortalID:    portalID,
				ActiveCount: 0,
				CreatedAt:   conv.CreatedAt,
			}
		}

		// Count active conversations (with customer and messages)
		if conv.CustomerName != "Unassigned" {
			var messageCount int64
			database.DB.Model(&models.Message{}).Where("conversation_id = ?", conv.ID).Count(&messageCount)
			
			if messageCount > 0 {
				categoryMap[slug].ActiveCount++
			}
		}
	}

	// Convert map to slice
	categories := make([]*Category, 0, len(categoryMap))
	for _, category := range categoryMap {
		categories = append(categories, category)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"categories": categories,
	})
}

// AddCategory adds a new category for a portal
func AddCategory(c *fiber.Ctx) error {
	// Get user ID from context
	userID := c.Locals("userID").(string)

	// Get portal ID from URL
	portalID := c.Params("id")

	// Parse request body
	var req AddCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Category name is required",
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

	// Generate slug from category name
	slug := utils.Slugify(req.Name)

	// Check if category already exists
	var existingConversation models.Conversation
	result = database.DB.Where("portal_id = ? AND category_slug = ?", portalID, slug).First(&existingConversation)
	
	// If category already exists, just return it
	if result.RowsAffected > 0 {
		category := Category{
			ID:          slug,
			Name:        req.Name,
			Slug:        slug,
			PortalID:    portalID,
			ActiveCount: 0,
			CreatedAt:   time.Now(),
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"category": category,
		})
	}

	// Create a placeholder conversation for this category
	conversation := models.Conversation{
		UniqueCode:   "placeholder", // Not used for this purpose
		Category:     req.Name,
		CategorySlug: slug,
		CustomerID:   "placeholder",
		CustomerName: "Unassigned",
		OwnerID:      userID,
		PortalID:     portalID,
	}

	result = database.DB.Create(&conversation)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create category",
		})
	}

	// Create category response
	category := Category{
		ID:          slug,
		Name:        req.Name,
		Slug:        slug,
		PortalID:    portalID,
		ActiveCount: 0,
		CreatedAt:   conversation.CreatedAt,
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"category": category,
	})
}