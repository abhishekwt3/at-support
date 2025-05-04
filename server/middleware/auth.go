package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"server/config"
	"server/database"
	"server/database/models"
)

// Protected is a middleware that checks if the request has a valid JWT token
func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get authorization header
		authHeader := c.Get("Authorization")
		
		// Check if authorization header exists
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized - No token provided",
			})
		}
		
		// Check if the authorization header has the correct format
		headerParts := strings.Split(authHeader, " ")
		if len(headerParts) != 2 || headerParts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized - Invalid token format",
			})
		}
		
		// Extract the token
		tokenString := headerParts[1]
		
		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the algorithm
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid token signing method")
			}
			
			// Return the secret key
			cfg := config.LoadConfig()
			return []byte(cfg.JWTSecret), nil
		})
		
		// Handle parsing errors
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized - " + err.Error(),
			})
		}
		
		// Validate the token claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Get user ID from claims
			userID, ok := claims["id"].(string)
			if !ok {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Unauthorized - Invalid user ID in token",
				})
			}
			
			// Verify that the user exists
			var user models.User
			result := database.DB.First(&user, "id = ?", userID)
			if result.Error != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error": "Unauthorized - User not found",
				})
			}
			
			// Set user ID in the context for later use
			c.Locals("userID", userID)
			
			// Continue with the request
			return c.Next()
		}
		
		// If token is invalid
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized - Invalid token",
		})
	}
}