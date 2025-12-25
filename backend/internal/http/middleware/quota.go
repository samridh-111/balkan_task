package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/samridh-111/balkan_task/internal/core/users"
)

func QuotaMiddleware(userRepo *users.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		userUUID := userID.(uuid.UUID)
		user, err := userRepo.GetByID(userUUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
			c.Abort()
			return
		}

		if user.StorageUsed >= user.StorageQuota {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "storage quota exceeded",
				"quota": user.StorageQuota,
				"used":  user.StorageUsed,
			})
			c.Abort()
			return
		}

		c.Set("user_storage_quota", user.StorageQuota)
		c.Set("user_storage_used", user.StorageUsed)
		c.Next()
	}
}

