# Database Schema Documentation

This document provides a comprehensive overview of the Balkan File Management System database schema, including table structures, relationships, indexes, and design decisions.

## Table of Contents
- [Overview](#overview)
- [Core Tables](#core-tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Migration Strategy](#migration-strategy)
- [Performance Considerations](#performance-considerations)
- [Backup and Recovery](#backup-and-recovery)

## Overview

The database schema is designed for a file management system with advanced deduplication capabilities, user management, and comprehensive audit logging.

### Design Principles
- **Deduplication**: File contents are stored once and referenced multiple times
- **ACID Compliance**: All operations maintain data integrity
- **Scalability**: Efficient indexing and query optimization
- **Auditability**: Complete tracking of all operations
- **Security**: Role-based access control at database level

### Database Version
- **PostgreSQL**: 15+
- **Schema Version**: 001
- **Migration Tool**: Built-in Go migration system

## Core Tables

### users

Stores user account information and authentication data.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    storage_quota BIGINT DEFAULT 1073741824,  -- 1 GB in bytes
    storage_used BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, UUID for global uniqueness
- `email`: Unique user identifier and login credential
- `password_hash`: Bcrypt hash of user password
- `role`: User role ('user' or 'admin') with CHECK constraint
- `storage_quota`: Maximum storage allowed (bytes)
- `storage_used`: Current storage consumption (bytes)
- `created_at/updated_at`: Audit timestamps

### file_contents

Stores deduplicated file content using SHA-256 hashing.

```sql
CREATE TABLE file_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sha256_hash VARCHAR(64) UNIQUE NOT NULL,
    size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, UUID for internal references
- `sha256_hash`: Unique SHA-256 hash of file content
- `size`: File size in bytes
- `storage_path`: Path to stored file on disk
- `created_at`: When content was first stored

**Design Notes:**
- SHA-256 hash ensures content uniqueness
- UNIQUE constraint on `sha256_hash` prevents duplicates
- Content is never deleted (references remain valid)

### files

Links users to file contents with metadata.

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_content_id UUID NOT NULL REFERENCES file_contents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, UUID for file identification
- `user_id`: Reference to owning user (CASCADE delete)
- `file_content_id`: Reference to actual content (CASCADE delete)
- `name`: Original filename as uploaded
- `mime_type`: MIME type for content handling
- `is_public`: Whether file can be accessed without authentication
- `created_at/updated_at`: Audit timestamps

### file_shares

Manages file sharing permissions and public links.

```sql
CREATE TABLE file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    share_token VARCHAR(64) UNIQUE NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, UUID for share identification
- `file_id`: Reference to shared file (CASCADE delete)
- `share_token`: Unique token for share URL generation
- `is_public`: Whether share is publicly accessible
- `expires_at`: Optional expiration timestamp
- `created_at`: When share was created

### download_logs

Audit log for all file download activities.

```sql
CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Primary key, UUID for log entry identification
- `file_id`: Reference to downloaded file (CASCADE delete)
- `user_id`: Reference to downloading user (SET NULL on delete)
- `ip_address`: IPv4/IPv6 address of downloader
- `user_agent`: Browser/client user agent string
- `downloaded_at`: Download timestamp

## Relationships

### Entity Relationship Diagram

```
users (1) ──── (many) files (many) ──── (1) file_contents
  │                                        │
  │                                        │
  └── (many) download_logs                 └── (many) download_logs
                                               │
                                               │
                                               └── (many) file_shares
```

### Foreign Key Relationships

1. **files → users**: Many files belong to one user
   - `files.user_id → users.id`
   - CASCADE on delete (delete user → delete all files)

2. **files → file_contents**: Many files reference one content
   - `files.file_content_id → file_contents.id`
   - CASCADE on delete (delete content → delete all file references)

3. **file_shares → files**: Many shares per file
   - `file_shares.file_id → files.id`
   - CASCADE on delete (delete file → delete all shares)

4. **download_logs → files**: Many downloads per file
   - `download_logs.file_id → files.id`
   - CASCADE on delete (delete file → delete all logs)

5. **download_logs → users**: Optional user reference
   - `download_logs.user_id → users.id`
   - SET NULL on delete (keep logs but anonymize)

## Indexes

### Performance Indexes

```sql
-- File content lookup by hash (most critical for deduplication)
CREATE INDEX idx_file_contents_sha256 ON file_contents(sha256_hash);

-- File listing by user (most common query)
CREATE INDEX idx_files_user_id ON files(user_id);

-- File content reference counting
CREATE INDEX idx_files_file_content_id ON files(file_content_id);

-- File listing by creation time (for sorting)
CREATE INDEX idx_files_created_at ON files(created_at);

-- Share token lookup (for public access)
CREATE INDEX idx_file_shares_share_token ON file_shares(share_token);

-- Share lookup by file
CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);

-- Download analytics by file
CREATE INDEX idx_download_logs_file_id ON download_logs(file_id);

-- Download analytics by user
CREATE INDEX idx_download_logs_user_id ON download_logs(user_id);

-- Download analytics by time
CREATE INDEX idx_download_logs_downloaded_at ON download_logs(downloaded_at);
```

### Index Strategy

- **Composite Indexes**: Where multiple columns are queried together
- **Partial Indexes**: For common filtered queries
- **B-tree Indexes**: Default for range queries and sorting
- **Hash Indexes**: Considered for equality-only lookups (SHA-256)

## Constraints

### Check Constraints

```sql
-- User roles must be valid
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('user', 'admin'));

-- Storage quotas must be positive
ALTER TABLE users ADD CONSTRAINT users_storage_quota_check
    CHECK (storage_quota > 0);

-- Storage used cannot exceed quota
ALTER TABLE users ADD CONSTRAINT users_storage_used_check
    CHECK (storage_used >= 0);

-- File sizes must be positive
ALTER TABLE file_contents ADD CONSTRAINT file_contents_size_check
    CHECK (size > 0);

-- SHA-256 hash must be valid length
ALTER TABLE file_contents ADD CONSTRAINT file_contents_sha256_length_check
    CHECK (LENGTH(sha256_hash) = 64);
```

### Unique Constraints

```sql
-- Email uniqueness
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Content hash uniqueness (deduplication core)
ALTER TABLE file_contents ADD CONSTRAINT file_contents_sha256_unique UNIQUE (sha256_hash);

-- Share token uniqueness
ALTER TABLE file_shares ADD CONSTRAINT file_shares_token_unique UNIQUE (share_token);
```

### Foreign Key Constraints

```sql
-- Files must reference valid users
ALTER TABLE files ADD CONSTRAINT files_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Files must reference valid content
ALTER TABLE files ADD CONSTRAINT files_file_content_id_fkey
    FOREIGN KEY (file_content_id) REFERENCES file_contents(id) ON DELETE CASCADE;

-- Shares must reference valid files
ALTER TABLE file_shares ADD CONSTRAINT file_shares_file_id_fkey
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE;

-- Download logs reference valid files
ALTER TABLE download_logs ADD CONSTRAINT download_logs_file_id_fkey
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE;

-- Download logs optionally reference users
ALTER TABLE download_logs ADD CONSTRAINT download_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

## Migration Strategy

### Migration Files

Located in `backend/internal/db/migrations/`:

```
001_initial_schema.up.sql    # Create all tables and indexes
001_initial_schema.down.sql  # Drop all tables (rollback)
```

### Migration Process

```go
// Automatic migration on startup
func runMigrations(db *sql.DB, log *logger.Logger) error {
    migrationSQL, err := os.ReadFile("internal/db/migrations/001_initial_schema.up.sql")
    if err != nil {
        return fmt.Errorf("failed to read migration file: %w", err)
    }

    _, err = db.Exec(string(migrationSQL))
    if err != nil {
        return fmt.Errorf("failed to execute migration: %w", err)
    }

    log.Info("Migrations executed successfully")
    return nil
}
```

### Migration Safety

- **Idempotent**: Can be run multiple times safely
- **Transactional**: All changes in single transaction
- **Logged**: Migration success/failure logged
- **Versioned**: Migration files numbered sequentially

## Performance Considerations

### Query Optimization

#### Most Common Queries

1. **File listing by user**:
```sql
SELECT f.*, fc.size FROM files f
JOIN file_contents fc ON f.file_content_id = fc.id
WHERE f.user_id = $1
ORDER BY f.created_at DESC
LIMIT 20 OFFSET 0;
```
*Index used*: `idx_files_user_id`, `idx_files_created_at`

2. **Deduplication check**:
```sql
SELECT id FROM file_contents WHERE sha256_hash = $1;
```
*Index used*: `idx_file_contents_sha256`

3. **Storage calculation**:
```sql
SELECT COALESCE(SUM(fc.size), 0) FROM files f
JOIN file_contents fc ON f.file_content_id = fc.id
WHERE f.user_id = $1;
```
*Index used*: `idx_files_user_id`, `idx_files_file_content_id`

### Storage Efficiency

- **Deduplication Savings**: Identical files stored once
- **Reference Counting**: Track how many files reference each content
- **Lazy Deletion**: Content kept until all references deleted
- **Compression**: Consider PostgreSQL table compression for logs

### Monitoring Queries

```sql
-- Storage usage by user
SELECT u.email, u.storage_used, u.storage_quota,
       ROUND(u.storage_used::numeric / u.storage_quota * 100, 2) as usage_percent
FROM users u
ORDER BY u.storage_used DESC;

-- Most downloaded files
SELECT f.name, COUNT(dl.*) as downloads, fc.size
FROM files f
JOIN file_contents fc ON f.file_content_id = fc.id
LEFT JOIN download_logs dl ON f.id = dl.file_id
GROUP BY f.id, f.name, fc.size
ORDER BY downloads DESC;

-- Deduplication efficiency
SELECT COUNT(*) as total_files,
       COUNT(DISTINCT file_content_id) as unique_contents,
       ROUND(COUNT(*)::numeric / COUNT(DISTINCT file_content_id), 2) as avg_references
FROM files;
```

## Backup and Recovery

### Backup Strategy

```bash
# Full database backup
pg_dump -h localhost -U postgres balkan_task > backup.sql

# Schema-only backup
pg_dump -h localhost -U postgres --schema-only balkan_task > schema.sql

# Data-only backup
pg_dump -h localhost -U postgres --data-only balkan_task > data.sql
```

### File Storage Backup

```bash
# Backup uploaded files
tar -czf uploads_backup.tar.gz backend/uploads/

# Backup with timestamps
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
pg_dump balkan_task > "$BACKUP_DIR/database.sql"
tar -czf "$BACKUP_DIR/uploads.tar.gz" backend/uploads/
```

### Recovery Procedure

```bash
# Stop the application
docker-compose down

# Restore database
psql -h localhost -U postgres balkan_task < backup.sql

# Restore files
tar -xzf uploads_backup.tar.gz -C backend/

# Restart application
docker-compose up -d
```

### Point-in-Time Recovery

PostgreSQL supports PITR for granular recovery:

```sql
-- Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'

-- Restore to specific timestamp
pg_basebackup -h localhost -U postgres -D /tmp/restore
pg_ctl -D /tmp/restore start
psql -c "SELECT pg_stop_backup();"
```

## Schema Evolution

### Adding New Tables

1. Create new migration file: `002_add_new_table.up.sql`
2. Add table creation and indexes
3. Update Go models to match schema
4. Test migration and rollback

### Modifying Existing Tables

1. Create migration with `ALTER TABLE` statements
2. Update Go models and handlers
3. Ensure backward compatibility
4. Update API documentation

### Deprecation Strategy

1. Mark fields as deprecated in API responses
2. Add new fields alongside old ones
3. Update clients gradually
4. Remove deprecated fields in future version

## Security Considerations

### Data Protection

- **Password Hashing**: bcrypt with appropriate cost factor
- **JWT Tokens**: Short expiration with refresh mechanism
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries throughout

### Access Control

- **Role-Based Access**: Database-level user roles
- **Row-Level Security**: Consider RLS for multi-tenant isolation
- **Audit Logging**: All operations logged with timestamps
- **API Rate Limiting**: Prevent abuse and DoS attacks

### Privacy

- **Data Minimization**: Only collect necessary user data
- **Retention Policies**: Define data retention periods
- **Anonymization**: Remove personal data from logs when possible
- **GDPR Compliance**: Data export/deletion capabilities

This schema provides a solid foundation for a scalable, secure file management system with advanced deduplication capabilities.
