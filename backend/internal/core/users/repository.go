package users

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/samridh-111/balkan_task/internal/pkg/errors"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(user *User) error {
	query := `
		INSERT INTO users (id, email, password_hash, role, storage_quota, storage_used, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(query, user.ID, user.Email, user.PasswordHash, user.Role,
		user.StorageQuota, user.StorageUsed, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return errors.Wrap(500, "failed to create user", err)
	}
	return nil
}

func (r *Repository) GetByEmail(email string) (*User, error) {
	query := `
		SELECT id, email, password_hash, role, storage_quota, storage_used, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	user := &User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Role,
		&user.StorageQuota, &user.StorageUsed, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(500, "failed to get user", err)
	}
	return user, nil
}

func (r *Repository) GetByID(id uuid.UUID) (*User, error) {
	query := `
		SELECT id, email, password_hash, role, storage_quota, storage_used, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	user := &User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.Role,
		&user.StorageQuota, &user.StorageUsed, &user.CreatedAt, &user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(500, "failed to get user", err)
	}
	return user, nil
}

func (r *Repository) UpdateStorageUsed(userID uuid.UUID, storageUsed int64) error {
	query := `
		UPDATE users
		SET storage_used = $1, updated_at = $2
		WHERE id = $3
	`
	_, err := r.db.Exec(query, storageUsed, time.Now(), userID)
	if err != nil {
		return errors.Wrap(500, "failed to update storage used", err)
	}
	return nil
}

