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

	// Get all conversations for a portal
	portals.Get("/:id/conversations", handlers.GetPortalConversations)

	// Get active conversations for a portal
	portals.Get("/:id/active-conversations", handlers.GetPortalActiveConversations)

	// Public routes (don't require authentication)
	portalPublic := api.Group("/portal")

	// Get public portal info
	portalPublic.Get("/:id", handlers.GetPublicPortalByID)

	// Generate conversation link
	portals.Post("/:id/generate-link", handlers.GenerateConversationLink)
}