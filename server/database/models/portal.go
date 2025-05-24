package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Portal represents a support portal
type Portal struct {
	ID            string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name          string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"name"`
	CustomName    string         `gorm:"type:varchar(255);uniqueIndex" json:"customName"`
	OwnerID       string         `gorm:"type:uuid;not null;index" json:"ownerId"`
	Owner         User           `gorm:"foreignKey:OwnerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"owner,omitempty"`
	Conversations []Conversation `gorm:"foreignKey:PortalID" json:"conversations,omitempty"`
	CreatedAt     time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"createdAt"`
	UpdatedAt     time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updatedAt"`
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