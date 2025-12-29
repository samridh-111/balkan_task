# Use Go 1.22 Alpine as base image
FROM golang:1.22-alpine

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata wget

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Create go.mod if missing (fallback for build context issues)
RUN if [ ! -f go.mod ]; then \
      echo 'module github.com/samridh-111/balkan_task' > go.mod && \
      echo '' >> go.mod && \
      echo 'go 1.22.12' >> go.mod && \
      echo '' >> go.mod && \
      echo 'require (' >> go.mod && \
      echo '	github.com/gin-contrib/cors v1.4.0' >> go.mod && \
      echo '	github.com/gin-gonic/gin v1.10.0' >> go.mod && \
      echo '	github.com/golang-jwt/jwt/v5 v5.2.1' >> go.mod && \
      echo '	github.com/google/uuid v1.6.0' >> go.mod && \
      echo '	github.com/joho/godotenv v1.5.1' >> go.mod && \
      echo '	github.com/lib/pq v1.10.9' >> go.mod && \
      echo '	golang.org/x/crypto v0.23.0' >> go.mod && \
      echo '	golang.org/x/time v0.5.0' >> go.mod && \
      echo ')' >> go.mod; \
    fi

# Generate go.sum if missing or empty
RUN if [ ! -f go.sum ] || [ ! -s go.sum ]; then \
      echo "Generating go.sum"; \
      go mod tidy; \
    fi

# Download dependencies
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./main"]
