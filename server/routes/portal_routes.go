package routes

import (
	"github.com/gofiber/fiber/v2"

	"server/handlers"
	"server/middleware"
)

// setupPortalRoutes configures portal routes
func setupPortalRoutes(api fiber.Router) {
	portals := api.Group("/portals")

	// Protected routes (require authentication)
	portals.Use(middleware.Protected())

	// Get all portals owned by authenticated user
	portals.Get("/", handlers.GetPortals)

	// Get portal by ID
	portals.Get("/:id", handlers.GetPortalByID)

	// Create a new portal
	portals.Post("/", handlers.CreatePortal)
	
	// Update a portal
	portals.Put("/:id", handlers.UpdatePortal)

	// Get all conversations for a portal
	portals.Get("/:id/conversations", handlers.GetPortalConversations)

	// Get active conversations for a portal
	portals.Get("/:id/active-conversations", handlers.GetPortalActiveConversations)
	
	// Get all categories for a portal
	portals.Get("/:id/categories", handlers.GetPortalCategories)
	
	// Add a new category to a portal
	portals.Post("/:id/categories", handlers.AddCategory)
	
	// Delete a category
	portals.Delete("/:id/categories/:categorySlug", handlers.DeleteCategory)

	// Public routes (don't require authentication)
	portalPublic := api.Group("/portal")

	// Get public portal info by ID
	portalPublic.Get("/:id", handlers.GetPublicPortalByID)
	
	// Get public portal info by custom name
	portalPublic.Get("/by-name/:customName", handlers.GetPortalByCustomName)

	// Generate conversation link
	portals.Post("/:id/generate-link", handlers.GenerateConversationLink)
}