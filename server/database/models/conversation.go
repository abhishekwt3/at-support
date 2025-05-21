package models

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Conversation represents a support conversation
type Conversation struct {
	ID            string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UniqueCode    string    `gorm:"uniqueIndex;type:varchar(10)" json:"uniqueCode"`
	Category      string    `gorm:"type:varchar(255)" json:"category"`
	CategorySlug  string    `gorm:"type:varchar(255)" json:"categorySlug"` // URL-friendly version of category
	CustomerID    string    `gorm:"type:varchar(255)" json:"customerId"`
	CustomerName  string    `gorm:"type:varchar(255)" json:"customerName"`
	OwnerID       string    `gorm:"type:varchar(36)" json:"ownerId"`
	Owner         User      `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	PortalID      string    `gorm:"type:varchar(36)" json:"portalId"`
	Portal        Portal    `gorm:"foreignKey:PortalID" json:"portal,omitempty"`
	Messages      []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
	MessageCount  int64     `gorm:"-" json:"messageCount,omitempty"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// BeforeCreate is a GORM hook that generates a UUID before creating a conversation
func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	
	// Generate URL-friendly category slug if not provided
	if c.CategorySlug == "" {
		c.CategorySlug = slugifyInternal(c.Category)
	}
	
	return nil
}

// slugifyInternal converts a string to a URL-friendly slug (internal function)
func slugifyInternal(input string) string {
	// Convert to lowercase
	result := strings.ToLower(input)
	
	// Replace spaces with hyphens
	result = strings.ReplaceAll(result, " ", "-")
	
	// Remove special characters
	var sb strings.Builder
	for _, r := range result {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			sb.WriteRune(r)
		}
	}
	result = sb.String()
	
	// Remove consecutive hyphens
	for strings.Contains(result, "--") {
		result = strings.ReplaceAll(result, "--", "-")
	}
	
	// Trim hyphens from start and end
	result = strings.Trim(result, "-")
	
	// If the result is empty, use a fallback
	if result == "" {
		result = "untitled"
	}
	
	return result
}