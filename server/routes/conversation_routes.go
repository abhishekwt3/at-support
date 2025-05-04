package routes

import (
	"github.com/gofiber/fiber/v2"

	"server/handlers"
	"server/middleware"
)

// setupConversationRoutes configures conversation routes
func setupConversationRoutes(api fiber.Router) {
	conversations := api.Group("/conversations")

	// Protected routes (require authentication)
	conversations.Use(middleware.Protected())

	// Get conversation by ID
	conversations.Get("/:id", handlers.GetConversation)

	// Delete conversation
	conversations.Delete("/:id", handlers.DeleteConversation)

	// Get messages for a conversation
	conversations.Get("/:id/messages", handlers.GetConversationMessages)

	// Public routes (don't require authentication)
	api.Get("/conversation/code/:uniqueCode", handlers.GetConversationByCode)
	api.Put("/conversation/:id/update-customer", handlers.UpdateCustomerInfo)
	api.Post("/conversation/create", handlers.CreateConversation)
	api.Get("/conversation/public/:id", handlers.GetPublicConversation)
}