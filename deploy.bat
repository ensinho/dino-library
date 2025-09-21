@echo off
REM Deploy Script for DinoLibrary - Windows Version
REM This script deploys the application to Vercel with proper configuration

echo 🦕 Starting DinoLibrary deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Vercel:
    vercel login
)

REM Build the project locally first
echo 🔨 Building project locally...
npm run build

if errorlevel 1 (
    echo ❌ Build failed. Please fix errors before deploying.
    exit /b 1
)

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...

if "%1"=="prod" (
    echo 📦 Deploying to PRODUCTION...
    vercel --prod
) else (
    echo 🧪 Deploying to PREVIEW...
    vercel
)

if errorlevel 0 (
    echo ✅ Deployment successful!
    echo 🔗 Check your deployment at: https://your-app.vercel.app
    echo.
    echo 📋 Post-deployment checklist:
    echo 1. ✅ Configure environment variables in Vercel dashboard
    echo 2. ✅ Test API endpoints
    echo 3. ✅ Verify database connections
    echo 4. ✅ Check analytics functionality
    echo 5. ✅ Test internationalization
) else (
    echo ❌ Deployment failed. Check the logs above.
    exit /b 1
)