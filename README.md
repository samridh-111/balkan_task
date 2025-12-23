Secure file vault system with advanced search and controlled sharing with strong deduplication.

## Tech Stack

- **Backend**: Go (Golang)
- **Database**: PostgreSQL
- **API**: REST
- **Frontend**: React.js + TypeScript 
- **Containerization**: Docker, Docker Compose

## Features

- File deduplication using content hashing (SHA-256)
- Advanced search and filtering
- Public/private file sharing
- Rate limiting and storage quotas
- Admin panel with analytics
- Download tracking

## Setup Instructions

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 15 or higher
- Docker & Docker Compose (optional)

### Local Development
```bash
# Clone the repository
git clone https://github.com/BALKAN_TASK/balkan-task.git
cd balkan-task

# Navigate to backend
cd backend

# Install dependencies
go mod download

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
make migrate-up

# Start the server
go run cmd/api/main.go
```

## Project Structure
```
balkan-task/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── core/
│   │   ├── db/
│   │   └── http/
│   ├── pkg/
│   └── go.mod
├── docker-compose.yml
└── README.md
```

## Project Status
- [x] Backend architecture design
- [x] PostgreSQL schema design
- [x] Project structure setup
- [x] Database migrations
- [x] Core data models

### In Progress
- [ ] API implementation
- [ ] File upload with deduplication
- [ ] Search and filtering
- [ ] Frontend development
- [ ] Docker setup
- [ ] Testing

## Database Schema

### Core Tables
- `users` - User accounts with roles and quotas
- `file_contents` - Deduplicated file storage (by SHA-256 hash)
- `files` - User file metadata and references
- `file_shares` - File sharing permissions
- `download_logs` - Download tracking and analytics

## API Endpoints (Planned)

### Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Files
- `POST /api/v1/files/upload`
- `GET /api/v1/files`
- `GET /api/v1/files/:id`
- `DELETE /api/v1/files/:id`
- `GET /api/v1/files/:id/download`

### Sharing
- `POST /api/v1/files/:id/share`
- `GET /api/v1/shares/:token`

### Admin
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/files`
- `GET /api/v1/admin/users`

## License

MIT

## Author

Samridh Suresh