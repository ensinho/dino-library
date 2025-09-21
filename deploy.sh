#!/bin/bash

# Deploy Script for DinoLibrary
# This script deploys the application to Vercel with proper configuration

echo "🦕 Starting DinoLibrary deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Build the project locally first
echo "🔨 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

if [ "$1" = "prod" ]; then
    echo "📦 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🧪 Deploying to PREVIEW..."
    vercel
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Check your deployment at: https://your-app.vercel.app"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "1. ✅ Configure environment variables in Vercel dashboard"
    echo "2. ✅ Test API endpoints"
    echo "3. ✅ Verify database connections"
    echo "4. ✅ Check analytics functionality"
    echo "5. ✅ Test internationalization"
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi