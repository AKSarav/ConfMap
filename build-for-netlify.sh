#!/bin/bash
set -e

echo "🚀 Starting Netlify build for ConfMap..."

# 1. Clean slate
echo "🧹 Cleaning previous build..."
npm run clean

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Build the project
echo "🛠️ Building the project for production..."
npm run build:prod

echo "✅ Build complete! The 'dist' folder is ready for deployment."
