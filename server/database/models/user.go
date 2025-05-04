// database/models/user.go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a support provider
type User struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Email     string    `gorm:"uniqueIndex;type:varchar(255)" json:"email"`
	Password  string    `gorm:"type:varchar(255)" json:"-"`
	Name      string    `gorm:"type:varchar(255)" json:"name"`
	Portals   []Portal  `gorm:"foreignKey:OwnerID" json:"portals,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BeforeCreate is a GORM hook that generates a UUID before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}