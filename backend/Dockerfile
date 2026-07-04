# ============================================
# Multi-stage Dockerfile for Go API
# ============================================

# --- Build Stage ---
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

# --- Runtime Stage ---
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS calls
RUN apk add --no-cache ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /bin/api /app/api

# Expose port
EXPOSE 8080

# Run the API server
CMD ["/app/api"]
