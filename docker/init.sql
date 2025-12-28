-- Balkan File Management System Database Initialization
-- This script runs when the PostgreSQL container starts for the first time

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the database (if not already created by POSTGRES_DB env var)
-- Note: This is handled by the POSTGRES_DB environment variable in docker-compose.yml
-- SELECT 'Database balkan_task initialized successfully' AS status;

-- Optional: Create a default admin user (uncomment if needed)
-- Note: The application will create the first registered user as admin
/*
INSERT INTO users (id, email, password_hash, role, storage_quota, storage_used, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@balkan.dev',
    '$2a$10$example.hash.here', -- bcrypt hash for 'admin123'
    'admin',
    1073741824, -- 1 GB
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
*/

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Balkan File Management System database initialized successfully';
END
$$;
