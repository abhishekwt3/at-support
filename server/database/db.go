package database

import (
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"server/config"
	"server/database/models"
)

var DB *gorm.DB

// Connect establishes a connection to the database
func Connect() error {
	cfg := config.LoadConfig()

	// Create database file path
	dbPath := getEnv("DB_PATH", "customer_support.db")

	// Configure logger
	gormConfig := &gorm.Config{}
	if cfg.IsDevelopment() {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	}

	// Connect to database
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), gormConfig)
	if err != nil {
		return err
	}

	// Auto migrate schemas
	err = DB.AutoMigrate(
		&models.User{},
		&models.Portal{},
		&models.Conversation{},
		&models.Message{},
	)
	if err != nil {
		return err
	}

	log.Println("Connected to SQLite database and migrated models")
	return nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}