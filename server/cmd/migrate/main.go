package main

import (
	"log"
	
	"github.com/joho/godotenv"
	
	"server/database"
	"server/utils"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	
	// Setup database connection
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	// Run data migration
	utils.MigrateData()
	
	log.Println("Migration completed successfully")
}