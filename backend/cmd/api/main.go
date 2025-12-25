package main

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/samridh-111/balkan_task/internal/config"
	"github.com/samridh-111/balkan_task/internal/core/auth"
	"github.com/samridh-111/balkan_task/internal/core/files"
	"github.com/samridh-111/balkan_task/internal/core/users"
	"github.com/samridh-111/balkan_task/internal/db/postgres"
	"github.com/samridh-111/balkan_task/internal/http/handlers"
	"github.com/samridh-111/balkan_task/internal/http/middleware"
	"github.com/samridh-111/balkan_task/internal/pkg/logger"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	log := logger.New()

	db, err := postgres.NewDB(cfg, log)
	if err != nil {
		log.Error("Failed to connect to database: %v", err)
		os.Exit(1)
	}
	defer db.Close()

	if err := runMigrations(db, log); err != nil {
		log.Error("Failed to run migrations: %v", err)
		os.Exit(1)
	}

	userRepo := users.NewRepository(db)
	fileRepo := files.NewRepository(db)

	jwtService := auth.NewService(cfg)
	authService := auth.NewAuthService(userRepo, jwtService)

	authHandler := handlers.NewAuthHandler(authService)
	fileHandler := handlers.NewFileHandler(fileRepo, userRepo, cfg.Storage.Path)

	router := setupRouter(authHandler, fileHandler, jwtService)

	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler: router,
	}

	go func() {
		log.Info("Starting server on %s:%s", cfg.Server.Host, cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("Failed to start server: %v", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Error("Server forced to shutdown: %v", err)
	}

	log.Info("Server exited")
}

func setupRouter(authHandler *handlers.AuthHandler, fileHandler *handlers.FileHandler, jwtService *auth.Service) *gin.Engine {
	router := gin.Default()

	router.Use(middleware.ErrorHandler())
	router.Use(middleware.RateLimitMiddleware())

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	v1 := router.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		files := v1.Group("/files")
		files.Use(middleware.AuthMiddleware(jwtService))
		{
			files.POST("/upload", fileHandler.Upload)
			files.GET("", fileHandler.List)
			files.GET("/:id", fileHandler.Get)
			files.GET("/:id/download", fileHandler.Download)
			files.DELETE("/:id", fileHandler.Delete)
			files.POST("/:id/share", fileHandler.Share)
		}
	}

	return router
}

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

