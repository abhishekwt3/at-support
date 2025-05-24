// server/cmd/debug/main.go
package main

import (
	"log"
	"time"

	"github.com/joho/godotenv"

	"server/database"
	"server/database/models"
	"server/utils"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully!")

	// Test creating a user
	testUser := models.User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "hashedpassword",
	}

	if err := database.DB.Create(&testUser).Error; err != nil {
		log.Printf("Error creating test user: %v", err)
	} else {
		log.Printf("Created test user: %s", testUser.ID)
	}

	// Test creating a portal
	testPortal := models.Portal{
		Name:       "Test Portal",
		CustomName: "test-portal",
		OwnerID:    testUser.ID,
	}

	if err := database.DB.Create(&testPortal).Error; err != nil {
		log.Printf("Error creating test portal: %v", err)
	} else {
		log.Printf("Created test portal: %s", testPortal.ID)
	}

	// Test creating a conversation
	testConversation := models.Conversation{
		UniqueCode:   utils.GenerateRandomCode(),
		Category:     "Test Category",
		CategorySlug: "test-category",
		CustomerID:   "test-customer",
		CustomerName: "Test Customer",
		OwnerID:      testUser.ID,
		PortalID:     testPortal.ID,
	}

	if err := database.DB.Create(&testConversation).Error; err != nil {
		log.Printf("Error creating test conversation: %v", err)
	} else {
		log.Printf("Created test conversation: %s", testConversation.ID)
	}

	// Test creating a message
	testMessage := models.Message{
		Content:        "Test message content",
		SenderID:       testUser.ID,
		ConversationID: testConversation.ID,
		IsOwner:        true,
		CreatedAt:      time.Now(),
	}

	if err := database.DB.Create(&testMessage).Error; err != nil {
		log.Printf("Error creating test message: %v", err)
	} else {
		log.Printf("Created test message: %s", testMessage.ID)
	}

	// Test fetching messages
	var messages []models.Message
	if err := database.DB.Where("conversation_id = ?", testConversation.ID).Find(&messages).Error; err != nil {
		log.Printf("Error fetching messages: %v", err)
	} else {
		log.Printf("Found %d messages for conversation", len(messages))
		for _, msg := range messages {
			log.Printf("Message: %s - %s", msg.ID, msg.Content)
		}
	}

	// Clean up test data
	database.DB.Delete(&testMessage)
	database.DB.Delete(&testConversation)
	database.DB.Delete(&testPortal)
	database.DB.Delete(&testUser)

	log.Println("Database test completed successfully!")
}