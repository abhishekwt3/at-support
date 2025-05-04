package routes

import (
	"github.com/gofiber/fiber/v2"
)

// SetupRoutes configures all application routes
func SetupRoutes(app *fiber.App) {
	// API routes group
	api := app.Group("/api")

	// Auth routes
	setupAuthRoutes(api)

	// Portal routes
	setupPortalRoutes(api)

	// Conversation routes
	setupConversationRoutes(api)

	// Message routes
	setupMessageRoutes(api)

	// Health check route
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status": "ok",
		})
	})
}