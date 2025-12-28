package files

import (
	"database/sql"
	"fmt"
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

func (r *Repository) CreateFileContent(fc *FileContent) error {
	query := `
		INSERT INTO file_contents (id, sha256_hash, size, storage_path, created_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (sha256_hash) DO NOTHING
	`
	_, err := r.db.Exec(query, fc.ID, fc.SHA256Hash, fc.Size, fc.StoragePath, fc.CreatedAt)
	if err != nil {
		return errors.Wrap(500, "failed to create file content", err)
	}
	return nil
}

func (r *Repository) GetFileContentByHash(hash string) (*FileContent, error) {
	query := `
		SELECT id, sha256_hash, size, storage_path, created_at
		FROM file_contents
		WHERE sha256_hash = $1
	`
	fc := &FileContent{}
	err := r.db.QueryRow(query, hash).Scan(
		&fc.ID, &fc.SHA256Hash, &fc.Size, &fc.StoragePath, &fc.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(500, "failed to get file content", err)
	}
	return fc, nil
}

func (r *Repository) GetFileContentByID(id uuid.UUID) (*FileContent, error) {
	query := `
		SELECT id, sha256_hash, size, storage_path, created_at
		FROM file_contents
		WHERE id = $1
	`
	fc := &FileContent{}
	err := r.db.QueryRow(query, id).Scan(
		&fc.ID, &fc.SHA256Hash, &fc.Size, &fc.StoragePath, &fc.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(500, "failed to get file content", err)
	}
	return fc, nil
}

func (r *Repository) CreateFile(file *File) error {
	query := `
		INSERT INTO files (id, user_id, file_content_id, name, mime_type, is_public, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(query, file.ID, file.UserID, file.FileContentID, file.Name,
		file.MimeType, file.IsPublic, file.CreatedAt, file.UpdatedAt)
	if err != nil {
		return errors.Wrap(500, "failed to create file", err)
	}
	return nil
}

func (r *Repository) GetFileByID(id uuid.UUID) (*File, error) {
	query := `
		SELECT f.id, f.user_id, f.file_content_id, f.name, f.mime_type, f.is_public, 
		       fc.size, f.created_at, f.updated_at
		FROM files f
		JOIN file_contents fc ON f.file_content_id = fc.id
		WHERE f.id = $1
	`
	file := &File{}
	err := r.db.QueryRow(query, id).Scan(
		&file.ID, &file.UserID, &file.FileContentID, &file.Name,
		&file.MimeType, &file.IsPublic, &file.Size, &file.CreatedAt, &file.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(500, "failed to get file", err)
	}
	return file, nil
}

func (r *Repository) ListFiles(userID uuid.UUID, query FileListQuery) ([]*File, int, error) {
	where := "WHERE f.user_id = $1"
	args := []interface{}{userID}
	argIndex := 2

	if query.Search != "" {
		where += fmt.Sprintf(" AND f.name ILIKE $%d", argIndex)
		args = append(args, "%"+query.Search+"%")
		argIndex++
	}

	if query.MimeType != "" {
		where += fmt.Sprintf(" AND f.mime_type = $%d", argIndex)
		args = append(args, query.MimeType)
		argIndex++
	}

	if query.IsPublic != nil {
		where += fmt.Sprintf(" AND f.is_public = $%d", argIndex)
		args = append(args, *query.IsPublic)
		argIndex++
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM files f
		%s
	`, where)
	var total int
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, errors.Wrap(500, "failed to count files", err)
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 20
	}
	offset := (query.Page - 1) * query.PageSize

	listQuery := fmt.Sprintf(`
		SELECT f.id, f.user_id, f.file_content_id, f.name, f.mime_type, f.is_public,
		       fc.size, f.created_at, f.updated_at
		FROM files f
		JOIN file_contents fc ON f.file_content_id = fc.id
		%s
		ORDER BY f.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argIndex, argIndex+1)
	args = append(args, query.PageSize, offset)

	rows, err := r.db.Query(listQuery, args...)
	if err != nil {
		return nil, 0, errors.Wrap(500, "failed to list files", err)
	}
	defer rows.Close()

	var files []*File
	for rows.Next() {
		file := &File{}
		err := rows.Scan(
			&file.ID, &file.UserID, &file.FileContentID, &file.Name,
			&file.MimeType, &file.IsPublic, &file.Size, &file.CreatedAt, &file.UpdatedAt,
		)
		if err != nil {
			return nil, 0, errors.Wrap(500, "failed to scan file", err)
		}
		files = append(files, file)
	}

	return files, total, nil
}

func (r *Repository) DeleteFile(id uuid.UUID) error {
	query := `DELETE FROM files WHERE id = $1`
	result, err := r.db.Exec(query, id)
	if err != nil {
		return errors.Wrap(500, "failed to delete file", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(500, "failed to get rows affected", err)
	}
	if rowsAffected == 0 {
		return errors.ErrNotFound
	}
	return nil
}

func (r *Repository) CreateShare(share *FileShare) error {
	query := `
		INSERT INTO file_shares (id, file_id, share_token, is_public, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.Exec(query, share.ID, share.FileID, share.ShareToken, share.IsPublic,
		share.ExpiresAt, share.CreatedAt)
	if err != nil {
		return errors.Wrap(500, "failed to create share", err)
	}
	return nil
}

func (r *Repository) GetShareByToken(token string) (*FileShare, error) {
	query := `
		SELECT id, file_id, share_token, is_public, expires_at, created_at
		FROM file_shares
		WHERE share_token = $1
	`
	share := &FileShare{}
	var expiresAt sql.NullTime
	err := r.db.QueryRow(query, token).Scan(
		&share.ID, &share.FileID, &share.ShareToken, &share.IsPublic,
		&expiresAt, &share.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(500, "failed to get share", err)
	}
	if expiresAt.Valid {
		share.ExpiresAt = &expiresAt.Time
	}
	return share, nil
}

func (r *Repository) GetFileCountByContentID(contentID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM files WHERE file_content_id = $1`
	var count int
	err := r.db.QueryRow(query, contentID).Scan(&count)
	if err != nil {
		return 0, errors.Wrap(500, "failed to count files by content ID", err)
	}
	return count, nil
}

func (r *Repository) LogDownload(fileID, userID uuid.UUID, ipAddress, userAgent string) error {
	query := `
		INSERT INTO download_logs (id, file_id, user_id, ip_address, user_agent, downloaded_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(query, fileID, userID, ipAddress, userAgent, time.Now())
	if err != nil {
		return errors.Wrap(500, "failed to log download", err)
	}
	return nil
}

