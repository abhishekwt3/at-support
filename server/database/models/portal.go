package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Portal represents a support portal
type Portal struct {
	ID            string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name          string         `gorm:"uniqueIndex;type:varchar(255)" json:"name"`
	CustomName    string         `gorm:"uniqueIndex;type:varchar(255)" json:"customName"` // URL-friendly unique name
	OwnerID       string         `gorm:"type:varchar(36)" json:"ownerId"`
	Owner         User           `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Conversations []Conversation `gorm:"foreignKey:PortalID" json:"conversations,omitempty"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
}

// BeforeCreate is a GORM hook that generates a UUID before creating a portal
func (p *Portal) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	
	// Generate URL-friendly custom name if not provided
	if p.CustomName == "" {
		p.CustomName = p.Name
	}
	
	return nil
}