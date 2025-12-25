package files

import (
	"time"

	"github.com/google/uuid"
)

type File struct {
	ID            uuid.UUID `json:"id"`
	UserID        uuid.UUID `json:"user_id"`
	FileContentID uuid.UUID `json:"file_content_id"`
	Name          string    `json:"name"`
	MimeType      string    `json:"mime_type"`
	IsPublic      bool      `json:"is_public"`
	Size          int64     `json:"size"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type FileContent struct {
	ID          uuid.UUID `json:"id"`
	SHA256Hash  string    `json:"sha256_hash"`
	Size        int64     `json:"size"`
	StoragePath string    `json:"-"`
	CreatedAt   time.Time `json:"created_at"`
}

type FileShare struct {
	ID         uuid.UUID  `json:"id"`
	FileID     uuid.UUID  `json:"file_id"`
	ShareToken string     `json:"share_token"`
	IsPublic   bool       `json:"is_public"`
	ExpiresAt  *time.Time `json:"expires_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

type UploadRequest struct {
	Name     string `form:"name" binding:"required"`
	IsPublic bool   `form:"is_public"`
}

type FileListQuery struct {
	Search   string
	MimeType string
	IsPublic *bool
	Page     int
	PageSize int
}

