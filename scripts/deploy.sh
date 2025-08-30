#!/bin/bash

# Flash Wise Buddy Production Deployment Script
# This script automates the deployment process on the production server

set -e  # Exit on any error

echo "🚀 Starting Flash Wise Buddy deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Are you in the project directory?"
    exit 1
fi

# Pull latest code
print_status "Pulling latest code from repository..."
git fetch origin
git reset --hard origin/main

# Check if docker-compose.yml exists and is valid
if ! docker compose config > /dev/null 2>&1; then
    print_error "Invalid docker-compose.yml configuration"
    exit 1
fi

# Build and start services
print_status "Building and starting services..."
docker compose down && docker compose up --build -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health checks..."

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    print_error "Some containers failed to start"
    docker compose logs
    exit 1
fi

# Check if frontend is accessible
if ! curl -f http://localhost:80 > /dev/null 2>&1; then
    print_warning "Frontend health check failed - might still be starting"
fi

# Check if backend is accessible
if ! curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    print_warning "Backend health check failed - might still be starting"
fi

# Show final status
print_status "Deployment completed successfully!"
print_status "Frontend: http://localhost"
print_status "Backend API: http://localhost:8000"
print_status "API Docs: http://localhost:8000/docs"

# Show running containers
echo ""
print_status "Running containers:"
docker compose ps

echo ""
print_status "🎉 Flash Wise Buddy deployment complete!"