package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Message represents a chat message
type Message struct {
	ID             string       `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Content        string       `gorm:"type:text" json:"content"`
	SenderID       string       `gorm:"type:varchar(255)" json:"senderId"`
	// Remove the foreign key constraint since customers are not in the users table
	// We don't use foreignKey here because not all senders are in the users table
	Sender         User         `gorm:"-" json:"sender,omitempty"` // Ignore this field in database
	ConversationID string       `gorm:"type:varchar(36)" json:"conversationId"`
	Conversation   Conversation `gorm:"foreignKey:ConversationID" json:"conversation,omitempty"`
	IsOwner        bool         `gorm:"default:false" json:"isOwner"`
	CreatedAt      time.Time    `json:"createdAt"`
}

// BeforeCreate is a GORM hook that generates a UUID before creating a message
func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}