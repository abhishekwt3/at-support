package routes

import (
	"github.com/gofiber/fiber/v2"

	"server/handlers"
)

// setupMessageRoutes configures message routes
func setupMessageRoutes(api fiber.Router) {
	// Send a message (can be from customer or owner)
	api.Post("/messages", handlers.SendMessage)
}