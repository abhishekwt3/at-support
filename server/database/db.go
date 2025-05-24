package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"server/config"
	"server/database/models"
)

var DB *gorm.DB

// Connect establishes a connection to the PostgreSQL database
func Connect() error {
	cfg := config.LoadConfig()

	// Build PostgreSQL DSN (Data Source Name)
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=require TimeZone=Asia/Kolkata",
		cfg.DBHost,
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBName,
		cfg.DBPort,
	)

	// Configure logger
	gormConfig := &gorm.Config{}
	if cfg.IsDevelopment() {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	}

	// Connect to database
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto migrate schemas
	err = DB.AutoMigrate(
		&models.User{},
		&models.Portal{},
		&models.Conversation{},
		&models.Message{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Connected to PostgreSQL database and migrated models")
	return nil
}