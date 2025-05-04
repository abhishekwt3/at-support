package utils

import (
	"fmt"
	"math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// Initialize the random source
var RandomSource = rand.New(rand.NewSource(time.Now().UnixNano()))

// HashPassword creates a bcrypt hash of the password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compares a bcrypt hashed password with its plaintext version
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateRandomCode generates a random code for conversations
func GenerateRandomCode() string {
	// Generate a 3-letter prefix using uppercase characters
	prefix := make([]byte, 3)
	for i := range prefix {
		prefix[i] = byte('A' + (RandomSource.Intn(26)))
	}

	// Generate a 4-digit number
	suffix := 1000 + RandomSource.Intn(9000)

	// Combine and return
	return string(prefix) + fmt.Sprintf("%d", suffix)
}