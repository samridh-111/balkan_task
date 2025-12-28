package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// AdminHandler handles admin-related HTTP requests
type AdminHandler struct{}

// NewAdminHandler creates a new admin handler
func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// GetStats returns system statistics
func (h *AdminHandler) GetStats(c *gin.Context) {
	// Check if user is admin
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
		return
	}

	// Mock data - in a real implementation, this would query the database
	stats := gin.H{
		"totalUsers":       156,
		"totalFiles":       2847,
		"totalStorage":     21474836480, // 20 GB in bytes
		"activeUsers":      89,
		"storageUsed":      8589934592,  // 8 GB in bytes
		"downloadsToday":   234,
		"uploadsToday":     45,
		"storageQuota":     107374182400, // 100 GB in bytes
		"avgFileSize":      7340032,      // ~7 MB
		"totalDownloads":   15432,
		"recentUploads": []gin.H{
			{
				"id":          "1",
				"name":        "annual-report.pdf",
				"user_email":  "john@example.com",
				"size":        2457600,
				"uploaded_at": "2024-01-15T10:30:00Z",
			},
			{
				"id":          "2",
				"name":        "presentation.pptx",
				"user_email":  "jane@example.com",
				"size":        5120000,
				"uploaded_at": "2024-01-15T09:15:00Z",
			},
		},
	}

	c.JSON(http.StatusOK, stats)
}

// GetAllFiles returns all files across all users (admin view)
func (h *AdminHandler) GetAllFiles(c *gin.Context) {
	// Check if user is admin
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	search := c.Query("search")

	// Mock data - in a real implementation, this would query the database
	files := []gin.H{
		{
			"id":         "1",
			"name":       "annual-report.pdf",
			"size":       2457600,
			"mime_type":  "application/pdf",
			"user_id":    "user1",
			"user_email": "john@example.com",
			"is_public":  true,
			"created_at": "2024-01-15T10:30:00Z",
			"downloads":  45,
		},
		{
			"id":         "2",
			"name":       "presentation.pptx",
			"size":       5120000,
			"mime_type":  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			"user_id":    "user2",
			"user_email": "jane@example.com",
			"is_public":  false,
			"created_at": "2024-01-15T09:15:00Z",
			"downloads":  23,
		},
		{
			"id":         "3",
			"name":       "screenshot.png",
			"size":       1024000,
			"mime_type":  "image/png",
			"user_id":    "user3",
			"user_email": "bob@example.com",
			"is_public":  true,
			"created_at": "2024-01-14T16:45:00Z",
			"downloads":  12,
		},
	}

	// Filter by search if provided
	if search != "" {
		filteredFiles := []gin.H{}
		for _, file := range files {
			if name, ok := file["name"].(string); ok && contains(name, search) {
				filteredFiles = append(filteredFiles, file)
			}
		}
		files = filteredFiles
	}

	// Pagination
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(files) {
		files = []gin.H{}
	} else if end > len(files) {
		files = files[start:]
	} else {
		files = files[start:end]
	}

	response := gin.H{
		"files":       files,
		"total":       len(files),
		"page":        page,
		"page_size":   pageSize,
		"total_pages": (len(files) + pageSize - 1) / pageSize,
	}

	c.JSON(http.StatusOK, response)
}

// GetAllUsers returns all users (admin view)
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	// Check if user is admin
	userRole, exists := c.Get("user_role")
	if !exists || userRole != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	search := c.Query("search")

	// Mock data - in a real implementation, this would query the database
	users := []gin.H{
		{
			"id":             "user1",
			"email":          "john@example.com",
			"role":           "user",
			"storage_quota":  1073741824, // 1 GB
			"storage_used":   524288000,  // 500 MB
			"created_at":     "2024-01-01T00:00:00Z",
			"last_login":     "2024-01-15T10:00:00Z",
			"files_count":    15,
			"downloads":      234,
		},
		{
			"id":             "user2",
			"email":          "jane@example.com",
			"role":           "user",
			"storage_quota":  2147483648, // 2 GB
			"storage_used":   1048576000, // 1 GB
			"created_at":     "2024-01-02T00:00:00Z",
			"last_login":     "2024-01-15T09:30:00Z",
			"files_count":    28,
			"downloads":      456,
		},
		{
			"id":             "user3",
			"email":          "bob@example.com",
			"role":           "admin",
			"storage_quota":  10737418240, // 10 GB
			"storage_used":   2147483648,  // 2 GB
			"created_at":     "2023-12-15T00:00:00Z",
			"last_login":     "2024-01-15T08:15:00Z",
			"files_count":    67,
			"downloads":      1234,
		},
	}

	// Filter by search if provided
	if search != "" {
		filteredUsers := []gin.H{}
		for _, user := range users {
			if email, ok := user["email"].(string); ok && contains(email, search) {
				filteredUsers = append(filteredUsers, user)
			}
		}
		users = filteredUsers
	}

	// Pagination
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(users) {
		users = []gin.H{}
	} else if end > len(users) {
		users = users[start:]
	} else {
		users = users[start:end]
	}

	response := gin.H{
		"users":       users,
		"total":       len(users),
		"page":        page,
		"page_size":   pageSize,
		"total_pages": (len(users) + pageSize - 1) / pageSize,
	}

	c.JSON(http.StatusOK, response)
}

// Helper function to check if string contains substring (case-insensitive)
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || containsIgnoreCase(s, substr))
}

func containsIgnoreCase(s, substr string) bool {
	s, substr = strings.ToLower(s), strings.ToLower(substr)
	return strings.Contains(s, substr)
}
