package config

import (
	"fmt"
	"os"
	"strings"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	JWTSecret      string
	JWTExpiration  time.Duration
	AllowOrigins   string
	Environment    string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	config := &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "3306"),
		DBUser:         getEnv("DB_USER", "root"),
		DBPassword:     getEnv("DB_PASSWORD", ""),
		DBName:         getEnv("DB_NAME", "customer_support"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiration:  time.Duration(getEnvAsInt("JWT_EXPIRATION", 24)) * time.Hour,
		AllowOrigins:   getEnv("ALLOW_ORIGINS", "http://localhost:3000"),
		Environment:    getEnv("ENVIRONMENT", "development"),
	}

	return config
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvAsInt gets an environment variable as an integer or returns a default value
func getEnvAsInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	// Convert to int
	intValue := defaultValue
	_, err := fmt.Sscanf(value, "%d", &intValue)
	if err != nil {
		return defaultValue
	}

	return intValue
}

// IsDevelopment checks if the environment is development
func (c *Config) IsDevelopment() bool {
	return strings.ToLower(c.Environment) == "development"
}