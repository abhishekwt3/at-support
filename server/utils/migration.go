package utils

import (
	"fmt"
	"log"
	//"strings"
	"time"

	"server/database"
)

// MigrateData updates existing data to support the new URL structure
func MigrateData() {
	log.Println("Starting data migration for new URL structure...")
	startTime := time.Now()
	
	// Migrate portals - add custom_name to portals without it
	migratePortals()
	
	// Migrate conversations - add category_slug to conversations without it
	migrateConversations()
	
	log.Printf("Migration completed in %v\n", time.Since(startTime))
}

// migratePortals adds custom_name to portals that don't have one
func migratePortals() {
	type Portal struct {
		ID         string
		Name       string
		CustomName string
	}
	
	var portals []Portal
	result := database.DB.Table("portals").Where("custom_name = '' OR custom_name IS NULL").Find(&portals)
	
	if result.Error != nil {
		log.Printf("Error fetching portals for migration: %v\n", result.Error)
		return
	}
	
	log.Printf("Found %d portals that need custom name migration\n", len(portals))
	
	for i, portal := range portals {
		customName := Slugify(portal.Name)
		
		// Check if this custom name already exists
		var count int64
		checkResult := database.DB.Table("portals").Where("custom_name = ?", customName).Count(&count)
		if checkResult.Error != nil {
			log.Printf("Error checking existing custom name: %v\n", checkResult.Error)
			continue
		}
		
		// If the custom name already exists, append a random code to make it unique
		if count > 0 {
			customName = fmt.Sprintf("%s-%s", customName, GenerateRandomCode())
		}
		
		// Update the portal with the new custom name
		updateResult := database.DB.Table("portals").Where("id = ?", portal.ID).Update("custom_name", customName)
		if updateResult.Error != nil {
			log.Printf("Error updating portal %s: %v\n", portal.ID, updateResult.Error)
		} else {
			log.Printf("Updated portal %d/%d: %s -> %s\n", i+1, len(portals), portal.Name, customName)
		}
	}
}

// migrateConversations adds category_slug to conversations that don't have one
func migrateConversations() {
	type Conversation struct {
		ID           string
		Category     string
		CategorySlug string
	}
	
	var conversations []Conversation
	result := database.DB.Table("conversations").Where("category_slug = '' OR category_slug IS NULL").Find(&conversations)
	
	if result.Error != nil {
		log.Printf("Error fetching conversations for migration: %v\n", result.Error)
		return
	}
	
	log.Printf("Found %d conversations that need category slug migration\n", len(conversations))
	
	for i, conversation := range conversations {
		categorySlug := Slugify(conversation.Category)
		
		// Update the conversation with the new category slug
		updateResult := database.DB.Table("conversations").Where("id = ?", conversation.ID).Update("category_slug", categorySlug)
		if updateResult.Error != nil {
			log.Printf("Error updating conversation %s: %v\n", conversation.ID, updateResult.Error)
		} else {
			log.Printf("Updated conversation %d/%d: %s -> %s\n", i+1, len(conversations), conversation.Category, categorySlug)
		}
	}
}