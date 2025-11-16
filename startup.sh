#!/bin/bash

echo "🚀 Starting SSMAGT Backend on Azure App Service..."

# Set default port if not provided
export PORT=${PORT:-8000}

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔨 Building application..."
npm run build

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌟 Starting application on port $PORT..."
npm start