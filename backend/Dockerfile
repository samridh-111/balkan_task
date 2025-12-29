# Use Go 1.22 Alpine as base image
FROM golang:1.22-alpine

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata wget

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Ensure go.sum exists and is up to date
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
