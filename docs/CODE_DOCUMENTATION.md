# Code Documentation Standards

This document outlines the coding standards and documentation practices used in the Balkan File Management System project.

## Table of Contents
- [Overview](#overview)
- [Go Documentation (GoDoc)](#go-documentation-godoc)
- [JavaScript Documentation (JSDoc)](#javascript-documentation-jsdoc)
- [General Documentation Principles](#general-documentation-principles)
- [Documentation Tools](#documentation-tools)
- [Examples](#examples)

## Overview

Consistent and comprehensive code documentation is essential for:
- **Maintainability**: New developers can understand code quickly
- **API Usage**: Clear contracts for function/method usage
- **Debugging**: Understanding what code is supposed to do
- **Testing**: Documentation helps write better tests
- **Code Reviews**: Self-documenting code improves review quality

## Go Documentation (GoDoc)

Go uses GoDoc comments that appear immediately before the item being documented. GoDoc generates HTML documentation from these comments.

### Package Documentation

Every package must have a package comment:

```go
// Package auth provides authentication and authorization services.
//
// This package implements JWT-based authentication with role-based access control.
// It handles user registration, login, token generation, and middleware for
// protecting routes.
//
// Architecture:
//   - Service: Business logic for auth operations
//   - Repository: Data access layer for user storage
//   - Handler: HTTP request handlers
//   - Middleware: Gin middleware for authentication
//
// Example usage:
//   service := auth.NewService(userRepo, jwtService)
//   user, token, err := service.Login("user@example.com", "password")
package auth
```

### Function Documentation

Functions must document parameters, return values, and behavior:

```go
// AuthenticateUser validates user credentials and returns authentication data.
//
// This function performs the following steps:
// 1. Retrieves user by email from database
// 2. Verifies password using bcrypt
// 3. Generates JWT token with user claims
// 4. Returns user data and token
//
// Parameters:
//   - email: User's email address (must be valid email format)
//   - password: User's plaintext password (will be hashed for comparison)
//
// Returns:
//   - *User: User data if authentication successful
//   - string: JWT token for API access
//   - error: Authentication error or database error
//
// Errors:
//   - ErrInvalidCredentials: Email/password combination invalid
//   - ErrUserNotFound: User does not exist
//   - ErrDatabaseError: Database connectivity issues
//
// Example:
//   user, token, err := AuthenticateUser("user@example.com", "password123")
//   if err != nil {
//       return fmt.Errorf("authentication failed: %w", err)
//   }
//   // Use token for subsequent API calls
func AuthenticateUser(email, password string) (*User, string, error) {
    // Implementation...
}
```

### Type Documentation

Structs and interfaces must be documented:

```go
// User represents a system user with authentication and profile data.
//
// Users can have different roles (user/admin) and have storage quotas
// that limit their file upload capacity.
type User struct {
    ID           uuid.UUID `json:"id" db:"id"`                       // Unique user identifier
    Email        string    `json:"email" db:"email"`                 // User's email address
    PasswordHash string    `json:"-" db:"password_hash"`             // Bcrypt hash of password
    Role         string    `json:"role" db:"role"`                   // User role: "user" or "admin"
    StorageQuota int64     `json:"storage_quota" db:"storage_quota"` // Storage limit in bytes
    StorageUsed  int64     `json:"storage_used" db:"storage_used"`   // Current storage usage in bytes
    CreatedAt    time.Time `json:"created_at" db:"created_at"`       // Account creation timestamp
    UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`       // Last update timestamp
}

// AuthService defines the interface for authentication operations.
//
// Implementations should handle user registration, login, and token management
// while ensuring security best practices and proper error handling.
type AuthService interface {
    // Register creates a new user account
    Register(req *RegisterRequest) (*AuthResponse, error)

    // Login authenticates existing user and returns token
    Login(req *LoginRequest) (*AuthResponse, error)

    // ValidateToken verifies JWT token and returns claims
    ValidateToken(token string) (*Claims, error)
}
```

### Constants and Variables

```go
// Default storage quota for new users (1 GB)
const DefaultStorageQuota = 1 << 30 // 1073741824 bytes

// User roles define access levels in the system
const (
    RoleUser  = "user"  // Standard user with basic file operations
    RoleAdmin = "admin" // Administrator with system-wide access
)
```

## JavaScript Documentation (JSDoc)

JavaScript uses JSDoc comments with specific tags for comprehensive documentation.

### Module Documentation

```javascript
/**
 * Authentication service for managing user sessions and tokens.
 *
 * This service handles login, logout, token storage, and automatic
 * token refresh. It integrates with the Balkan API for authentication
 * and maintains session state throughout the application.
 *
 * @module authService
 * @requires api
 * @requires localStorage
 *
 * @example
 * import { authService } from './services/authService';
 *
 * // Login user
 * const result = await authService.login('user@example.com', 'password');
 * console.log('Logged in as:', result.user.email);
 */
export const authService = {
  // Service methods...
};
```

### Function Documentation

```javascript
/**
 * Authenticate user with email and password.
 *
 * Sends login credentials to the API and stores the returned JWT token
 * in localStorage for subsequent API calls. Updates the global auth state
 * and navigates to the dashboard on success.
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication result
 * @returns {boolean} return.success - Whether login succeeded
 * @returns {Object} [return.user] - User data if successful
 * @returns {string} [return.token] - JWT token if successful
 * @returns {string} [return.error] - Error message if failed
 *
 * @throws {NetworkError} When API is unreachable
 * @throws {ValidationError} When credentials are invalid
 *
 * @example
 * try {
 *   const result = await authService.login('user@example.com', 'password123');
 *   if (result.success) {
 *     console.log('Welcome,', result.user.email);
 *     navigate('/dashboard');
 *   } else {
 *     alert(result.error);
 *   }
 * } catch (error) {
 *   console.error('Login failed:', error);
 * }
 */
async function login(email, password) {
  // Implementation...
}
```

### Class Documentation

```javascript
/**
 * File upload manager with progress tracking and deduplication.
 *
 * Handles file uploads with automatic SHA-256 hashing for duplicate detection,
 * progress monitoring, and batch upload capabilities. Integrates with the
 * Balkan API for secure file storage.
 *
 * @class FileUploader
 * @param {Object} options - Configuration options
 * @param {string} options.apiUrl - Base API URL
 * @param {number} [options.chunkSize=1024*1024] - Upload chunk size in bytes
 * @param {boolean} [options.enableDeduplication=true] - Whether to check for duplicates
 *
 * @example
 * const uploader = new FileUploader({
 *   apiUrl: 'http://localhost:8080/api/v1',
 *   chunkSize: 2 * 1024 * 1024 // 2MB chunks
 * });
 *
 * uploader.onProgress((file, progress) => {
 *   console.log(`${file.name}: ${progress}%`);
 * });
 *
 * const result = await uploader.upload(file);
 */
class FileUploader {
  /**
   * Create a new file uploader instance.
   * @param {Object} options - Configuration options
   */
  constructor(options) {
    // Implementation...
  }

  /**
   * Upload a single file with progress tracking.
   * @param {File} file - The file to upload
   * @param {Object} [options] - Upload options
   * @param {boolean} [options.public=false] - Make file publicly accessible
   * @returns {Promise<Object>} Upload result
   */
  async upload(file, options = {}) {
    // Implementation...
  }
}
```

### Type Definitions

```javascript
/**
 * User authentication response from API.
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether authentication succeeded
 * @property {User} [user] - User data if successful
 * @property {string} [token] - JWT token if successful
 * @property {string} [error] - Error message if failed
 */

/**
 * User account information.
 * @typedef {Object} User
 * @property {string} id - Unique user identifier (UUID)
 * @property {string} email - User's email address
 * @property {string} role - User role ('user' or 'admin')
 * @property {number} storageQuota - Storage limit in bytes
 * @property {number} storageUsed - Current storage usage in bytes
 * @property {string} createdAt - Account creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 */
```

## General Documentation Principles

### 1. Completeness

- **Document all public APIs**: Every exported function, class, and type
- **Include examples**: Practical usage examples for complex functions
- **Cover edge cases**: Document error conditions and special behaviors
- **Update with changes**: Keep documentation current with code changes

### 2. Clarity

- **Use simple language**: Avoid jargon unless necessary
- **Be specific**: Clearly describe parameters, return values, and behavior
- **Provide context**: Explain why something works a certain way
- **Use consistent terminology**: Same terms for same concepts

### 3. Structure

- **Logical order**: Parameters, return values, examples, error conditions
- **Consistent formatting**: Same style across all documentation
- **Cross-references**: Link related functions and types
- **Table of contents**: For longer documentation files

### 4. Maintenance

- **Review in code reviews**: Documentation quality as review criteria
- **Automated checks**: Lint rules for documentation completeness
- **Version control**: Documentation updates with code changes
- **Regular audits**: Periodic review of documentation accuracy

## Documentation Tools

### Go Documentation Tools

```bash
# Generate HTML documentation
go doc -all -html ./...

# Serve documentation locally
godoc -http=:6060

# Generate documentation for specific package
go doc ./internal/core/auth

# Check documentation coverage
go run golang.org/x/tools/cmd/godoc@latest -analysis=type
```

### JavaScript Documentation Tools

```bash
# Generate HTML documentation from JSDoc
npm install -g jsdoc
jsdoc src/ -d docs/

# Generate documentation with TypeScript support
npm install -g typedoc
typedoc --out docs/ src/

# Lint JSDoc comments
npm install -g eslint-plugin-jsdoc
eslint --plugin jsdoc src/
```

### Documentation Linters

```bash
# Go documentation linter
go install golang.org/x/lint/golint@latest
golint ./...

# JSDoc validation
npm install -g documentation
documentation build src/ --format html --output docs/
```

## Examples

### Complete Function Documentation (Go)

```go
// CalculateStorageUsage computes the total storage used by a user.
//
// This function aggregates the file sizes of all files owned by the user.
// It includes both original files and deduplicated references. The calculation
// is performed efficiently using a single database query with proper indexing.
//
// The result is cached for 5 minutes to reduce database load for frequent calls.
// Cache invalidation occurs when files are uploaded, deleted, or when storage
// quotas are updated.
//
// Parameters:
//   - userID: UUID of the user whose storage to calculate
//   - includeShared: Whether to include files shared with the user (default: false)
//
// Returns:
//   - int64: Total storage used in bytes
//   - error: Database error or invalid user ID
//
// Errors:
//   - ErrUserNotFound: User does not exist
//   - ErrDatabaseError: Database connectivity issues
//
// Performance:
//   - Time complexity: O(1) with proper indexing
//   - Space complexity: O(1) constant space usage
//   - Database queries: 1 (optimized with composite index)
//
// Example:
//   usage, err := CalculateStorageUsage(userID, false)
//   if err != nil {
//       return fmt.Errorf("failed to calculate storage: %w", err)
//   }
//   percentage := float64(usage) / float64(user.Quota) * 100
//
// Thread Safety:
//   This function is safe for concurrent use and can be called from multiple goroutines.
func CalculateStorageUsage(userID uuid.UUID, includeShared bool) (int64, error) {
    // Implementation with proper error handling and logging...
}
```

### Complete Function Documentation (JavaScript)

```javascript
/**
 * Upload files with intelligent deduplication and progress tracking.
 *
 * This function handles batch file uploads with the following features:
 * - SHA-256 hash generation for duplicate detection
 * - Pre-upload duplicate checking to warn users
 * - Progress callbacks for upload monitoring
 * - Automatic retry logic for failed uploads
 * - Storage quota validation before upload
 *
 * The upload process follows these steps:
 * 1. Generate SHA-256 hash for each file
 * 2. Check server for existing duplicates
 * 3. Show warnings for duplicate files
 * 4. Upload files in parallel with progress tracking
 * 5. Update local state with results
 *
 * @param {FileList|Array<File>} files - Files to upload
 * @param {Object} [options] - Upload configuration options
 * @param {boolean} [options.public=false] - Make files publicly accessible
 * @param {Function} [options.onProgress] - Progress callback (file, percentage)
 * @param {Function} [options.onDuplicate] - Duplicate warning callback
 * @param {number} [options.maxRetries=3] - Maximum upload retry attempts
 * @param {boolean} [options.skipDuplicates=false] - Skip duplicate files automatically
 *
 * @returns {Promise<Array<Object>>} Upload results for each file
 * @returns {boolean} return[].success - Whether file uploaded successfully
 * @returns {Object} [return[].data] - File metadata if successful
 * @returns {string} [return[].error] - Error message if failed
 * @returns {File} return[].file - Original file object
 * @returns {boolean} [return[].wasDuplicate] - Whether file was a duplicate
 *
 * @throws {QuotaExceededError} When user storage quota would be exceeded
 * @throws {NetworkError} When API is unreachable during upload
 * @throws {AuthenticationError} When user session is invalid
 *
 * @example
 * // Basic usage
 * const results = await uploadFiles(fileInput.files);
 * console.log(`Uploaded ${results.filter(r => r.success).length} files`);
 *
 * @example
 * // Advanced usage with callbacks
 * const results = await uploadFiles(files, {
 *   public: true,
 *   onProgress: (file, progress) => {
 *     console.log(`${file.name}: ${progress}%`);
 *   },
 *   onDuplicate: (file, serverInfo) => {
 *     return confirm(`File already exists. Upload anyway?`);
 *   }
 * });
 *
 * @example
 * // Handle results
 * for (const result of results) {
 *   if (result.success) {
 *     console.log(`✓ ${result.data.name} uploaded`);
 *   } else if (result.wasDuplicate) {
 *     console.log(`⚠ ${result.file.name} was duplicate`);
 *   } else {
 *     console.error(`✗ ${result.file.name}: ${result.error}`);
 *   }
 * }
 *
 * @since 1.0.0
 * @see {@link checkDuplicate} for duplicate detection
 * @see {@link generateSHA256} for hash generation
 */
export async function uploadFiles(files, options = {}) {
  // Implementation...
}
```

These documentation standards ensure that the codebase remains maintainable, understandable, and properly documented for future development and maintenance.
