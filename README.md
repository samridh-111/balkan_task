# Balkan File Management System

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat&logo=postgresql)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, enterprise-grade file management system with advanced deduplication, analytics, and admin controls.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication with role-based access control
- **📁 Smart File Management**: Upload, download, and organize files with intelligent deduplication
- **🛡️ Duplicate Prevention**: SHA-256 hashing with pre-upload duplicate detection and warnings
- **👑 Admin Dashboard**: Comprehensive analytics, user management, and system monitoring
- **📊 Real-time Analytics**: Usage statistics, sharing insights, and performance metrics
- **🎨 Modern UI**: Responsive React interface with shadcn/ui components
- **⚡ High Performance**: Optimized backend with rate limiting and quota management
- **🐳 Docker Ready**: Complete containerization setup for easy deployment

## 🚀 Quick Start

### Prerequisites
- Go 1.22+
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Quick Start with Docker 🐳
```bash
# Clone the repository
git clone https://github.com/samridh-111/balkan_task.git
cd balkan_task

# Copy environment configuration
cp env.example .env

# Start all services
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database Admin**: http://localhost:8081

### Manual Setup
For development without Docker, see the [detailed setup guide](./docs/setup/README.md).

## 🚂 Railway Deployment (Cloud)

For quick cloud deployment, use Railway:

### One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/samridh-111/balkan_task)

### Manual Railway Setup
1. **Connect Repository**: Link your GitHub repo to Railway
2. **Add Database**: Railway provides managed PostgreSQL
3. **Deploy Services**: Backend and frontend deploy automatically
4. **Configure Environment**: Set JWT secret and API URLs

See the [complete Railway deployment guide](./docs/deployment/railway.md) for detailed instructions.

## 🐳 Docker Deployment

The application includes a complete Docker setup for easy deployment:

### Services
- **postgres**: PostgreSQL 15 database with persistent storage
- **backend**: Go API server with health checks
- **frontend**: React SPA served by Nginx
- **adminer**: Web-based database administration (optional)

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build

# Clean up (remove volumes)
docker-compose down -v
```

### Environment Configuration
Copy and configure environment variables:
```bash
cp env.example .env
# Edit .env with your settings
```

### Production Considerations
- Change `JWT_SECRET` to a secure random string
- Use strong database passwords
- Configure SSL/TLS certificates
- Set up proper logging and monitoring
- Use Docker secrets for sensitive data

## 📁 Project Structure

```
balkan_task/
├── backend/                 # Go backend API
│   ├── cmd/api/            # Application entry point
│   ├── internal/
│   │   ├── config/         # Configuration management
│   │   ├── core/           # Business logic (auth, files, users)
│   │   ├── db/             # Database migrations and setup
│   │   ├── http/           # HTTP handlers and middleware
│   │   └── pkg/            # Shared packages
│   └── go.mod
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── lib/            # Utilities and helpers
│   └── package.json
├── docs/                    # Documentation
│   ├── api/                # API documentation
│   ├── architecture/       # System architecture
│   ├── database/           # Database schema
│   └── setup/              # Setup guides
└── docker-compose.yml       # Docker orchestration
```

## 📚 Documentation

- **[Setup Guide](./docs/setup/README.md)** - Complete installation and configuration
- **[API Documentation](./docs/api/README.md)** - REST API reference with examples
- **[Database Schema](./docs/database/README.md)** - Data models and relationships
- **[Architecture](./docs/architecture/README.md)** - System design and decisions
- **[Postman Collection](https://samridh-suresh-2005-9533610.postman.co/workspace/Samridh-Suresh's-Workspace~48625f1c-0f6a-4059-889a-5bdd0084cb61/collection/50759397-69341512-82c7-415b-a63b-19482a5f49df?action=share&source=copy-link&creator=50759397)** - API testing collection

## 🔧 Tech Stack

### Backend
- **Framework**: Gin (Go web framework)
- **Database**: PostgreSQL with pgx driver
- **Authentication**: JWT tokens
- **Validation**: Go validator
- **Documentation**: GoDoc comments

### Frontend
- **Framework**: React 19 with Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios with interceptors

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with migrations
- **Linting**: ESLint (frontend), Go vet (backend)
- **Build**: Vite (frontend), Go build (backend)

## 🎯 Key Features

### File Management
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **Smart Deduplication**: SHA-256 content hashing saves storage space
- **Duplicate Warnings**: Pre-upload detection prevents accidental duplicates
- **Download Tracking**: Monitor file access and sharing activity
- **Quota Management**: Storage limits per user with enforcement

### Admin Controls
- **System Analytics**: Real-time metrics and usage statistics
- **User Management**: Admin interface for user oversight
- **File Oversight**: Complete file management across all users
- **Storage Monitoring**: Usage trends and capacity planning
- **Sharing Analytics**: Track file sharing and collaboration

### Security & Performance
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive data sanitization
- **Error Handling**: Graceful failure management
- **Audit Logging**: Complete activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Samridh Suresh**
- Email: samridh.suresh.2005@gmail.com
- GitHub: [@samridh-111](https://github.com/samridh-111)

## 🙏 Acknowledgments

- [Gin Web Framework](https://gin-gonic.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL](https://postgresql.org/)

---

**⭐ Star this repository if you find it useful!**