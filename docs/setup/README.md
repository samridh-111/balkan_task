# Setup Guide

Comprehensive instructions for setting up the Balkan File Management System for development and production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Setup](#manual-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

Before setting up the application, ensure you have the following installed:

### Required Software
- **Go**: Version 1.22 or higher ([Download](https://golang.org/dl/))
- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: Version 15 or higher ([Download](https://postgresql.org/download/))
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

### Optional (Recommended)
- **Docker**: Version 20.10+ ([Download](https://docker.com/))
- **Docker Compose**: Version 2.0+ (comes with Docker Desktop)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for source code and dependencies
- **Network**: Internet connection for package downloads

## Quick Start with Docker 🐳

The fastest way to get started is using Docker Compose, which handles all dependencies automatically:

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+ (usually included with Docker Desktop)

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/samridh-111/balkan_task.git
cd balkan_task

# Copy environment configuration
cp env.example .env

# Start all services (first time will take a few minutes to build)
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database Admin: http://localhost:8081
```

### What Happens
1. **PostgreSQL** database starts with automatic schema creation
2. **Go backend** builds and starts with all dependencies
3. **React frontend** builds and serves via Nginx
4. **Adminer** provides web-based database management

### First-Time User Registration
1. Open http://localhost:3000
2. Click "Sign Up"
3. Register your account (first user becomes admin)
4. Login and start exploring!

### Docker Management Commands
```bash
# View running services
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart after code changes
docker-compose restart backend frontend

# Clean rebuild (after Dockerfile changes)
docker-compose up --build --force-recreate

# Remove everything (including volumes/data)
docker-compose down -v --rmi all
```

### Troubleshooting Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# View detailed logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Access container shell
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d balkan_task

# Check resource usage
docker stats
```

### Development with Docker
```bash
# For hot-reloading during development, mount source code
docker-compose -f docker-compose.dev.yml up

# Or modify docker-compose.yml to mount volumes:
# backend:
#   volumes:
#     - ./backend:/app
#   command: ["air", "-c", ".air.toml"]  # If using Air
```

That's it! Docker handles all the complexity of setting up PostgreSQL, Go dependencies, Node modules, and networking between services.

## Manual Setup

For development or when you prefer manual control, follow these detailed setup instructions.

### Backend Setup

#### 1. Install Go Dependencies
```bash
cd backend

# Download all dependencies
go mod download

# Verify installation
go mod verify
```

#### 2. Database Setup

##### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL in Docker
docker run --name balkan-postgres \
  -e POSTGRES_DB=balkan_task \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine

# Wait for database to be ready
sleep 10
```

##### Option B: Local PostgreSQL Installation
```bash
# Create database
createdb balkan_task

# Or using psql
psql -c "CREATE DATABASE balkan_task;"

# Create user (optional)
psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE balkan_task TO postgres;"
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=balkan_task
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSLMODE=disable

# Server Configuration
SERVER_HOST=localhost
SERVER_PORT=8080

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

#### 4. Run Database Migrations
```bash
# The application automatically runs migrations on startup
# No manual migration step required
```

#### 5. Start Backend Server
```bash
# From backend directory
go run cmd/api/main.go

# Server will start on http://localhost:8080
# You should see: "[INFO] Starting server on localhost:8080"
```

### Frontend Setup

#### 1. Install Node.js Dependencies
```bash
cd frontend

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

#### 2. Environment Configuration
```bash
# Copy environment template (if exists)
cp .env.example .env.local

# The frontend uses VITE_API_URL environment variable
# Default: http://localhost:8080 (backend URL)
```

#### 3. Start Development Server
```bash
# Start the development server
npm run dev

# Server will start on http://localhost:5173
# You should see: "VITE v7.3.0 ready in XXX ms"
```

#### 4. Build for Production (Optional)
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | Yes |
| `DB_NAME` | Database name | `balkan_task` | Yes |
| `DB_USER` | Database user | `postgres` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_SSLMODE` | SSL mode | `disable` | No |
| `SERVER_HOST` | Server bind address | `localhost` | No |
| `SERVER_PORT` | Server port | `8080` | No |
| `JWT_SECRET` | JWT signing key | - | Yes |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` | No |

## Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):
```bash
cd backend && go run cmd/api/main.go
```

2. **Start Frontend** (Terminal 2):
```bash
cd frontend && npm run dev
```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Health Check: http://localhost:8080/health

### Using Make Commands (if available)

```bash
# Start both services
make dev

# Start only backend
make backend

# Start only frontend
make frontend

# Run tests
make test

# Clean build artifacts
make clean
```

## Database Management

### Using Adminer (Web Interface)
```bash
# Start Adminer with Docker
docker run --name adminer \
  -p 8081:8080 \
  -d adminer

# Access: http://localhost:8081
# System: PostgreSQL
# Server: host.docker.internal (if using Docker)
# Username: postgres
# Password: postgres
# Database: balkan_task
```

### Using psql (Command Line)
```bash
# Connect to database
psql -h localhost -U postgres -d balkan_task

# List tables
\d

# View users
SELECT * FROM users;

# View files
SELECT * FROM files;

# Exit
\q
```

## Testing the Application

### Health Checks
```bash
# Backend health
curl http://localhost:8080/health

# API endpoints
curl http://localhost:8080/api/v1/files -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### User Registration
1. Open http://localhost:5173
2. Click "Sign Up"
3. Create an admin account (first user becomes admin)
4. Login and explore features

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Go version
go version

# Check if port 8080 is available
lsof -i :8080

# Kill process using port 8080
kill -9 $(lsof -t -i :8080)

# Check database connection
psql -h localhost -U postgres -d balkan_task -c "SELECT 1;"
```

#### Frontend Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Check Node.js version
node --version
npm --version
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgres

# Start PostgreSQL
brew services start postgresql

# Or with Docker
docker ps | grep postgres
```

#### Port Conflicts
```bash
# Find processes using specific ports
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # Database

# Kill conflicting processes
kill -9 <PID>
```

### Debug Mode

#### Backend Debug Logging
```bash
# Set Gin to debug mode
export GIN_MODE=debug

# Run with verbose logging
go run cmd/api/main.go
```

#### Frontend Debug Mode
```bash
# Start with debug logging
npm run dev -- --debug

# Check browser console for errors
# Open DevTools (F12) in browser
```

### Environment-Specific Issues

#### macOS Issues
```bash
# PostgreSQL permission issues
brew services restart postgresql

# Go build cache issues
go clean -cache
go clean -modcache
```

#### Windows Issues
```bash
# Check if ports are available
netstat -ano | findstr :8080

# Kill process
taskkill /PID <PID> /F
```

#### Linux Issues
```bash
# Check system resources
free -h
df -h

# Check systemd services
systemctl status postgresql
```

## Production Deployment

### Using Docker Compose (Recommended)

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: balkan_task
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - balkan-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - balkan-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    networks:
      - balkan-network
```

### Environment Variables for Production
```bash
# Database
DB_HOST=your-db-host
DB_PASSWORD=secure-password-here
DB_SSLMODE=require

# Security
JWT_SECRET=very-long-random-secret-key

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] Firewall rules configured
- [ ] Domain name configured
- [ ] HTTPS enabled
- [ ] CDN configured for static assets

## Support

If you encounter issues during setup:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [API documentation](../api/README.md)
3. Check GitHub issues for similar problems
4. Create a new issue with detailed error logs

## Next Steps

Once setup is complete:
- Read the [API documentation](../api/README.md)
- Explore the [database schema](../database/README.md)
- Review the [architecture overview](../architecture/README.md)
- Start developing features or customizing the application
