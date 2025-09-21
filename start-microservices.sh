#!/bin/bash

echo ""
echo "====================================="
echo "🚀 STARTING DINOLIBRARY MICROSERVICES"
echo "====================================="
echo ""

# Check if microservices exist
if [ ! -f "microservices/dinosaur-service/package.json" ]; then
    echo "❌ Dinosaur service not found!"
    exit 1
fi

if [ ! -f "microservices/analytics-service/package.json" ]; then
    echo "❌ Analytics service not found!"
    exit 1
fi

echo "✅ All microservices found!"
echo ""

# Function to start service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "🔄 Starting $service_name on port $port..."
    cd "$service_path"
    npm run dev &
    echo "✅ $service_name started with PID $!"
    cd - > /dev/null
}

# Start services
start_service "Dinosaur Service" "microservices/dinosaur-service" "3001"
start_service "Analytics Service" "microservices/analytics-service" "3004"

echo ""
echo "====================================="
echo "✅ ALL MICROSERVICES STARTED!"
echo "====================================="
echo ""
echo "🦕 Dinosaur Service:  http://localhost:3001"
echo "   Health Check:      http://localhost:3001/health"
echo "   API Docs:          http://localhost:3001/api/dinosaurs"
echo ""
echo "📊 Analytics Service: http://localhost:3004"
echo "   Health Check:      http://localhost:3004/health"
echo "   Statistics:        http://localhost:3004/api/stats"
echo ""
echo "🌐 Main Application:  http://localhost:8081"
echo ""
echo "⚠️  Wait 10-15 seconds for services to fully start"
echo "💡 Check logs above for any startup errors"
echo "🔄 To stop services, press Ctrl+C"
echo ""

# Wait for user input to stop services
read -p "Press Enter to stop all services..."

# Kill background processes
jobs -p | xargs kill

echo "🛑 All microservices stopped!"