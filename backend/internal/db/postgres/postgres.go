package postgres

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"github.com/samridh-111/balkan_task/internal/config"
	"github.com/samridh-111/balkan_task/internal/pkg/logger"
)

func NewDB(cfg *config.Config, log *logger.Logger) (*sql.DB, error) {
	dsn := cfg.Database.DSN()
	
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Info("Database connection established")
	return db, nil
}

