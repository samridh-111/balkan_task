# API Documentation

Comprehensive API documentation for the Balkan File Management System, including OpenAPI specifications, endpoint details, and usage examples.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [File Upload](#file-upload)
- [Deduplication](#deduplication)
- [OpenAPI Specification](#openapi-specification)
- [Postman Collection](#postman-collection)
- [Testing](#testing)

## Overview

The Balkan File Management API is a RESTful service built with Go and Gin, providing comprehensive file management capabilities with advanced deduplication.

### Base URL
```
http://localhost:8080/api/v1
```

### Content Types
- **Request**: `application/json` (except file uploads)
- **File Upload**: `multipart/form-data`
- **Response**: `application/json`

### Authentication
All endpoints except authentication require JWT tokens in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

## Authentication

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "user",
    "storage_quota": 1073741824,
    "storage_used": 0,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `409 Conflict`: User already exists
- `400 Bad Request`: Invalid input data

### POST /auth/login

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "user",
    "storage_quota": 1073741824,
    "storage_used": 0,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

## API Endpoints

### Files

#### POST /files/check-duplicate

Check if a file with the given SHA-256 hash already exists in the system.

**Request Body:**
```json
{
  "sha256_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
}
```

**Response (200) - No Duplicate:**
```json
{
  "is_duplicate": false
}
```

**Response (200) - Duplicate Found:**
```json
{
  "is_duplicate": true,
  "duplicate_info": {
    "file_size": 1048576,
    "uploaded_at": "2024-01-15T10:30:00Z",
    "reference_count": 3
  }
}
```

**Purpose:** Pre-upload duplicate detection to warn users before uploading duplicate content.

#### POST /files/upload

Upload a file with deduplication support.

**Request (multipart/form-data):**
```
Content-Type: multipart/form-data

file: <binary file data>
name: "document.pdf"
is_public: "false"
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_content_id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "document.pdf",
  "mime_type": "application/pdf",
  "is_public": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: No file provided
- `403 Forbidden`: Storage quota exceeded
- `413 Payload Too Large`: File too large
- `422 Unprocessable Entity`: Invalid file type

#### GET /files

List user's files with filtering and pagination.

**Query Parameters:**
- `search` (string): Search in filename
- `mime_type` (string): Filter by MIME type
- `is_public` (boolean): Filter by public/private status
- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 20)

**Response (200):**
```json
{
  "files": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "file_content_id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "document.pdf",
      "mime_type": "application/pdf",
      "is_public": false,
      "size": 1048576,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

#### GET /files/{id}

Get detailed information about a specific file.

**Path Parameters:**
- `id` (UUID): File ID

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_content_id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "document.pdf",
  "mime_type": "application/pdf",
  "is_public": false,
  "size": 1048576,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "downloads": 15,
  "sha256_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
}
```

#### GET /files/{id}/download

Download a file.

**Path Parameters:**
- `id` (UUID): File ID

**Response (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"

<binary file data>
```

**Error Responses:**
- `404 Not Found`: File not found
- `403 Forbidden`: Access denied (private file)

#### DELETE /files/{id}

Delete a file.

**Path Parameters:**
- `id` (UUID): File ID

**Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: File not found
- `403 Forbidden`: Access denied (not owner)

#### POST /files/{id}/share

Create a share link for a file.

**Path Parameters:**
- `id` (UUID): File ID

**Request Body:**
```json
{
  "is_public": true,
  "expires_at": "2024-02-15T10:30:00Z" // optional
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "file_id": "550e8400-e29b-41d4-a716-446655440001",
  "share_token": "abc123def456",
  "is_public": true,
  "expires_at": "2024-02-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Admin Endpoints (Admin Role Required)

#### GET /admin/stats

Get system-wide statistics.

**Response (200):**
```json
{
  "totalUsers": 156,
  "totalFiles": 2847,
  "totalStorage": 21474836480,
  "activeUsers": 89,
  "storageUsed": 8589934592,
  "downloadsToday": 234,
  "uploadsToday": 45,
  "storageQuota": 107374182400,
  "avgFileSize": 7340032,
  "recentUploads": [...]
}
```

#### GET /admin/files

List all files across all users (admin only).

**Response (200):**
```json
{
  "files": [...],
  "total": 2847,
  "page": 1,
  "page_size": 20,
  "total_pages": 143
}
```

#### GET /admin/users

List all users (admin only).

**Response (200):**
```json
{
  "users": [...],
  "total": 156,
  "page": 1,
  "page_size": 20,
  "total_pages": 8
}
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- **200 OK**: Success
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions or quota exceeded
- **404 Not Found**: Resource not found
- **413 Payload Too Large**: File too large
- **422 Unprocessable Entity**: Validation error
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Common Error Messages

- `"storage quota exceeded"`: User has reached their storage limit
- `"rate limit exceeded"`: Too many requests in time window
- `"admin access required"`: Endpoint requires admin role
- `"file not found"`: Requested file doesn't exist
- `"unauthorized"`: Invalid or missing JWT token

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Global Limit**: 10 requests per second
- **Burst Capacity**: 20 requests
- **Per IP Address**: Individual IP tracking

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

## File Upload

### Upload Process

1. **Client**: Generate SHA-256 hash of file
2. **Client**: Call `/files/check-duplicate` to detect duplicates
3. **Client**: Show warning if duplicate found
4. **Client**: Upload file with metadata
5. **Server**: Store content only if new (deduplication)
6. **Server**: Create file reference for user

### File Constraints

- **Maximum Size**: 100MB per file
- **Allowed Types**: All file types supported
- **Storage Quota**: Per-user limits enforced
- **Deduplication**: Automatic content deduplication

### Upload Response

```json
{
  "id": "file-uuid",
  "user_id": "user-uuid",
  "file_content_id": "content-uuid",
  "name": "uploaded-file.pdf",
  "mime_type": "application/pdf",
  "is_public": false,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

## Deduplication

### How It Works

1. **Content Hashing**: Files are identified by SHA-256 hash
2. **Storage Efficiency**: Identical content stored once
3. **Reference Counting**: Multiple files can reference same content
4. **Space Savings**: Significant storage reduction for duplicate files

### API Integration

```javascript
// Generate hash before upload
const hash = await generateSHA256(file);

// Check for duplicates
const checkResponse = await api.post('/files/check-duplicate', {
  sha256_hash: hash
});

if (checkResponse.data.is_duplicate) {
  // Show warning to user
  const proceed = confirm('This file already exists. Upload anyway?');
  if (!proceed) return;
}

// Proceed with upload
const formData = new FormData();
formData.append('file', file);
formData.append('name', file.name);
formData.append('is_public', 'false');

await api.post('/files/upload', formData);
```

### Benefits

- **Storage Savings**: Up to 90% reduction for duplicate files
- **Upload Speed**: Instant uploads for duplicate content
- **User Awareness**: Pre-upload warnings prevent confusion
- **Audit Trail**: Complete reference tracking

## OpenAPI Specification

The API is fully documented with OpenAPI 3.0 specification:

```yaml
openapi: 3.0.3
info:
  title: Balkan File Management API
  version: 1.0.0
  description: REST API for file management with deduplication
servers:
  - url: http://localhost:8080/api/v1
    description: Development server
```

[View complete OpenAPI spec](./openapi.yaml)

### Generate Documentation

```bash
# Install swagger tools
go install github.com/swaggo/swag/cmd/swag@latest

# Generate OpenAPI spec
swag init -g cmd/api/main.go -o docs/api/

# View documentation
open docs/api/index.html
```

## Postman Collection

Import the provided Postman collection for easy API testing:

[Download Postman Collection](./postman_collection.json)

### Collection Structure

```
Balkan File Management API
├── Authentication
│   ├── Register User
│   └── Login User
├── Files
│   ├── Check Duplicate
│   ├── Upload File
│   ├── List Files
│   ├── Get File Details
│   ├── Download File
│   ├── Delete File
│   └── Share File
└── Admin (Admin Role Required)
    ├── Get System Stats
    ├── List All Files
    └── List All Users
```

### Environment Variables

Set up these variables in Postman:

```
base_url: http://localhost:8080/api/v1
jwt_token: <paste_token_here>
user_id: <current_user_id>
```

## Testing

### Unit Tests

```bash
# Run Go tests
cd backend
go test ./...

# Run with coverage
go test -cover ./...
```

### Integration Tests

```bash
# Test with real database
go test -tags=integration ./...

# Run API tests
go test ./internal/http/handlers/...
```

### API Testing

```bash
# Health check
curl http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Upload file
curl -X POST http://localhost:8080/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "name=document.pdf" \
  -F "is_public=false"
```

### Load Testing

```bash
# Install hey (HTTP load testing)
brew install hey

# Test file upload endpoint
hey -n 100 -c 10 -m POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test.pdf" \
  http://localhost:8080/api/v1/files/upload
```

## Client SDKs

### JavaScript/TypeScript

```javascript
import { BalkanAPI } from '@balkan/api-client';

const client = new BalkanAPI({
  baseURL: 'http://localhost:8080/api/v1',
  token: 'your-jwt-token'
});

// Upload file with deduplication
const result = await client.files.upload(file, {
  onDuplicate: (info) => {
    return confirm(`File already exists (${info.file_size} bytes). Upload anyway?`);
  }
});
```

### Go Client

```go
package main

import (
    "github.com/balkan/api-client-go"
)

func main() {
    client := balkan.NewClient("http://localhost:8080/api/v1", "your-jwt-token")

    // Upload with duplicate checking
    file, err := client.Files.Upload("document.pdf", &balkan.UploadOptions{
        CheckDuplicates: true,
        OnDuplicate: func(info *balkan.DuplicateInfo) bool {
            fmt.Printf("Duplicate found: %d bytes\n", info.FileSize)
            return true // proceed with upload
        },
    })
}
```

This API provides a complete foundation for building file management applications with enterprise-grade features and excellent developer experience.
