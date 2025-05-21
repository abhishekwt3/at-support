package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	"server/config"
)

// UserClaims represents the claims in a JWT token
type UserClaims struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

// GenerateToken creates a new JWT token for the given user
func GenerateToken(userID, userEmail, userName string) (string, error) {
	// Load configuration
	cfg := config.LoadConfig()

	// Set token expiration time
	expirationTime := time.Now().Add(cfg.JWTExpiration)

	// Create the claims
	claims := jwt.MapClaims{
		"id":    userID,
		"email": userEmail,
		"name":  userName,
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