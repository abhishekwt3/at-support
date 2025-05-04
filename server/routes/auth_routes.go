package routes

import (
	"github.com/gofiber/fiber/v2"

	"server/handlers"
)

// setupAuthRoutes configures authentication routes
func setupAuthRoutes(api fiber.Router) {
	auth := api.Group("/auth")

	// Register a new user
	auth.Post("/register", handlers.Register)

	// Login
	auth.Post("/login", handlers.Login)
}