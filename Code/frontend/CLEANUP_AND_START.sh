#!/bin/bash

# Firebase Cleanup and Fresh Start Script
# Run this to clean up and start fresh

echo "🧹 Cleaning up old dependencies..."
rm -rf node_modules package-lock.json .vite

echo "📦 Installing fresh dependencies..."
npm install

echo "✅ Cleanup complete!"
echo ""
echo "🚀 Starting development server..."
npm run dev
