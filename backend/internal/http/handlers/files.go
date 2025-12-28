package handlers

import (
	"crypto/sha256"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/samridh-111/balkan_task/internal/core/files"
	"github.com/samridh-111/balkan_task/internal/core/users"
	"github.com/samridh-111/balkan_task/internal/pkg/errors"
)

type FileHandler struct {
	fileRepo  *files.Repository
	userRepo  *users.Repository
	storagePath string
}

func NewFileHandler(fileRepo *files.Repository, userRepo *users.Repository, storagePath string) *FileHandler {
	// Ensure storage directory exists
	os.MkdirAll(storagePath, 0755)
	return &FileHandler{
		fileRepo:  fileRepo,
		userRepo:  userRepo,
		storagePath: storagePath,
	}
}

func (h *FileHandler) Upload(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userUUID := userID.(uuid.UUID)

	user, err := h.userRepo.GetByID(userUUID)
	if err != nil {
		c.Error(err)
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	var req files.UploadRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.Error(errors.Wrap(500, "failed to open file", err))
		return
	}
	defer src.Close()

	fileData, err := io.ReadAll(src)
	if err != nil {
		c.Error(errors.Wrap(500, "failed to read file", err))
		return
	}

	hash := sha256.New()
	hash.Write(fileData)
	sha256Hash := fmt.Sprintf("%x", hash.Sum(nil))

	fileContent, err := h.fileRepo.GetFileContentByHash(sha256Hash)
	if err != nil && err != errors.ErrNotFound {
		c.Error(err)
		return
	}

	fileSize := int64(len(fileData))

	if fileContent == nil {
		if user.StorageUsed+fileSize > user.StorageQuota {
			c.JSON(http.StatusForbidden, gin.H{"error": "storage quota exceeded"})
			return
		}
	}

	if fileContent == nil {
		storageDir := filepath.Join(h.storagePath, sha256Hash[:2])
		os.MkdirAll(storageDir, 0755)
		storagePath := filepath.Join(storageDir, sha256Hash)

		if err := os.WriteFile(storagePath, fileData, 0644); err != nil {
			c.Error(errors.Wrap(500, "failed to save file", err))
			return
		}

		fileContent = &files.FileContent{
			ID:          uuid.New(),
			SHA256Hash:  sha256Hash,
			Size:        fileSize,
			StoragePath: storagePath,
			CreatedAt:   time.Now(),
		}

		if err := h.fileRepo.CreateFileContent(fileContent); err != nil {
			c.Error(err)
			return
		}


		newStorageUsed := user.StorageUsed + fileSize
		if err := h.userRepo.UpdateStorageUsed(userUUID, newStorageUsed); err != nil {
			c.Error(err)
			return
		}
	} else {

		fileContent, err = h.fileRepo.GetFileContentByHash(sha256Hash)
		if err != nil {
			c.Error(err)
			return
		}
	}


	fileRecord := &files.File{
		ID:            uuid.New(),
		UserID:        userUUID,
		FileContentID: fileContent.ID,
		Name:          req.Name,
		MimeType:      file.Header.Get("Content-Type"),
		IsPublic:      req.IsPublic,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := h.fileRepo.CreateFile(fileRecord); err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusCreated, fileRecord)
}

func (h *FileHandler) CheckDuplicate(c *gin.Context) {
	var req struct {
		SHA256Hash string `json:"sha256_hash" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "sha256_hash is required"})
		return
	}

	// Check if file content with this hash already exists
	fileContent, err := h.fileRepo.GetFileContentByHash(req.SHA256Hash)
	if err != nil && err != errors.ErrNotFound {
		c.Error(err)
		return
	}

	isDuplicate := fileContent != nil

	response := gin.H{
		"is_duplicate": isDuplicate,
	}

	if isDuplicate {
		// Get file information for the duplicate
		fileCount, err := h.fileRepo.GetFileCountByContentID(fileContent.ID)
		if err != nil {
			c.Error(err)
			return
		}

		response["duplicate_info"] = gin.H{
			"file_size":     fileContent.Size,
			"uploaded_at":   fileContent.CreatedAt,
			"reference_count": fileCount,
		}
	}

	c.JSON(http.StatusOK, response)
}

func (h *FileHandler) List(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userUUID := userID.(uuid.UUID)

	query := files.FileListQuery{
		Search:   c.Query("search"),
		MimeType: c.Query("mime_type"),
		Page:     1,
		PageSize: 20,
	}

	if page := c.Query("page"); page != "" {
		fmt.Sscanf(page, "%d", &query.Page)
	}
	if pageSize := c.Query("page_size"); pageSize != "" {
		fmt.Sscanf(pageSize, "%d", &query.PageSize)
	}
	if isPublic := c.Query("is_public"); isPublic != "" {
		public := isPublic == "true"
		query.IsPublic = &public
	}

	fileList, total, err := h.fileRepo.ListFiles(userUUID, query)
	if err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"files": fileList,
		"total": total,
		"page":  query.Page,
		"page_size": query.PageSize,
	})
}

func (h *FileHandler) Get(c *gin.Context) {
	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}

	file, err := h.fileRepo.GetFileByID(fileID)
	if err != nil {
		c.Error(err)
		return
	}


	userID, exists := c.Get("user_id")
	var userUUID uuid.UUID
	if exists {
		userUUID = userID.(uuid.UUID)
	}
	if !exists || (file.UserID != userUUID && !file.IsPublic) {
		c.Error(errors.ErrForbidden)
		return
	}

	c.JSON(http.StatusOK, file)
}

func (h *FileHandler) Download(c *gin.Context) {
	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}

	file, err := h.fileRepo.GetFileByID(fileID)
	if err != nil {
		c.Error(err)
		return
	}

	userID, exists := c.Get("user_id")
	var userUUID uuid.UUID
	if exists {
		userUUID = userID.(uuid.UUID)
	}
	if !exists || (file.UserID != userUUID && !file.IsPublic) {
		c.Error(errors.ErrForbidden)
		return
	}

	fileContent, err := h.fileRepo.GetFileContentByID(file.FileContentID)
	if err != nil {
		c.Error(err)
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	h.fileRepo.LogDownload(fileID, userUUID, ipAddress, userAgent)

	c.File(fileContent.StoragePath)
}

func (h *FileHandler) Delete(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userUUID := userID.(uuid.UUID)

	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}

	file, err := h.fileRepo.GetFileByID(fileID)
	if err != nil {
		c.Error(err)
		return
	}

	if file.UserID != userUUID {
		c.Error(errors.ErrForbidden)
		return
	}

	if err := h.fileRepo.DeleteFile(fileID); err != nil {
		c.Error(err)
		return
	}


	c.JSON(http.StatusOK, gin.H{"message": "file deleted"})
}

func (h *FileHandler) Share(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userUUID := userID.(uuid.UUID)

	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}

	file, err := h.fileRepo.GetFileByID(fileID)
	if err != nil {
		c.Error(err)
		return
	}

	if file.UserID != userUUID {
		c.Error(errors.ErrForbidden)
		return
	}

	var req struct {
		IsPublic  bool       `json:"is_public"`
		ExpiresAt *time.Time `json:"expires_at,omitempty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	shareToken := fmt.Sprintf("%s-%s", fileID.String()[:8], uuid.New().String()[:8])

	share := &files.FileShare{
		ID:         uuid.New(),
		FileID:     fileID,
		ShareToken: shareToken,
		IsPublic:   req.IsPublic,
		ExpiresAt:  req.ExpiresAt,
		CreatedAt:  time.Now(),
	}

	if err := h.fileRepo.CreateShare(share); err != nil {
		c.Error(err)
		return
	}

	c.JSON(http.StatusCreated, share)
}

