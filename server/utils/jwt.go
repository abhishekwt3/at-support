package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"server/config"
	"server/database/models"
)

// GenerateToken creates a new JWT token for the given user
func GenerateToken(user *models.User) (string, error) {
	// Load configuration
	cfg := config.LoadConfig()

	// Set token expiration time
	expirationTime := time.Now().Add(cfg.JWTExpiration)

	// Create the claims
	claims := jwt.MapClaims{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
		"exp":   expirationTime.Unix(),
	}

	// Create the token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}