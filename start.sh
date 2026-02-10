#!/bin/bash
set -e

echo "🚀 Starting Mission Control Dashboard..."

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔧 Building TypeScript..."
npm run build

# Run initial indexing
echo "🔍 Indexing workspace..."
npm run index || true

# Start the dashboard
echo "✨ Starting dashboard..."
npm start