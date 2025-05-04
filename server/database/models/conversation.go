package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Conversation represents a support conversation
type Conversation struct {
	ID            string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	UniqueCode    string    `gorm:"uniqueIndex;type:varchar(10)" json:"uniqueCode"`
	Category      string    `gorm:"type:varchar(255)" json:"category"`
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
	return nil
}