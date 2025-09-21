@echo off
echo.
echo =====================================
echo 🚀 STARTING DINOLIBRARY MICROSERVICES
echo =====================================
echo.

echo 📋 Checking microservices...
if not exist "microservices\dinosaur-service\package.json" (
    echo ❌ Dinosaur service not found!
    pause
    exit /b 1
)

if not exist "microservices\analytics-service\package.json" (
    echo ❌ Analytics service not found!
    pause
    exit /b 1
)

echo ✅ All microservices found!
echo.

echo 🦕 Starting Dinosaur Service on port 3001...
cd microservices\dinosaur-service
start "🦕 Dinosaur Service" cmd /k "echo 🦕 DINOSAUR SERVICE STARTING... && npm run dev"

echo.
echo 📊 Starting Analytics Service on port 3004...
cd ..\analytics-service
start "📊 Analytics Service" cmd /k "echo 📊 ANALYTICS SERVICE STARTING... && npm run dev"

cd ..\..

echo.
echo =====================================
echo ✅ ALL MICROSERVICES STARTED!
echo =====================================
echo.
echo 🦕 Dinosaur Service:  http://localhost:3001
echo    Health Check:      http://localhost:3001/health
echo    API Docs:          http://localhost:3001/api/dinosaurs
echo.
echo 📊 Analytics Service: http://localhost:3004  
echo    Health Check:      http://localhost:3004/health
echo    Statistics:        http://localhost:3004/api/stats
echo.
echo 🌐 Main Application:  http://localhost:8081
echo.
echo ⚠️  Wait 10-15 seconds for services to fully start
echo 💡 Check the service windows for startup logs
echo 🔄 To stop services, close their respective windows
echo.
pause