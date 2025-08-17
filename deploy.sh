#!/bin/bash

# ConfQL-Map Deployment Script for DigitalOcean
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying ConfMap to DigitalOcean..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start the application
echo "🔨 Building Docker image..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for the service to be ready
echo "⏳ Waiting for service to be ready..."
sleep 10

# Check if the service is running
if curl -f http://localhost/health &> /dev/null; then
    echo "✅ ConfMap is successfully deployed!"
    echo "🔗 Access it at http://<your-droplet-ip>"
    echo "📊 Health check: http://localhost/health"
else
    echo "❌ Service is not responding."
    echo "   Check the logs with 'docker-compose logs -f'"
    exit 1
fi

echo "🎉 Deployment finished!"

echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Update: git pull && ./deploy.sh"
echo ""
echo "🔒 Don't forget to:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up SSL certificate (Let's Encrypt recommended)"
echo "  3. Configure firewall rules"
echo "  4. Set up monitoring and backups"
