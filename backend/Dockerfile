# Use Go 1.22 Alpine as base image
FROM golang:1.22-alpine

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files first (essential for module operations)
COPY go.mod* go.sum* ./

# Ensure go.mod exists and generate go.sum if needed
RUN if [ ! -f go.mod ]; then echo "go.mod not found!"; exit 1; fi && \
    if [ ! -f go.sum ] || [ ! -s go.sum ]; then go mod tidy; fi

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Create uploads directory
RUN mkdir -p /app/uploads

# Clean up source files (keep only binary and necessary files)
RUN rm -rf *.go internal/ pkg/ db/ http/ core/ cmd/ config/

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./main"]
