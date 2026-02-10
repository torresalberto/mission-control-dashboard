#!/bin/bash
# Deploy Mission Control to A2Hosting shared hosting

set -e

echo "🚀 Building Mission Control for production..."
cd /home/alb/.openclaw/workspace/mission-control

# Clean build
rm -rf dist

# Build static export
npm run build

# Database needs to be copied too
cp mission-control.db dist/ 2>/dev/null || echo "Note: mission-control.db not found, API won't have data"

# Deploy to A2Hosting via rsync (configure these variables)
A2HOST_USER="albto"
A2HOST_SERVER="a2ss76.a2hosting.com"
A2HOST_PATH="/home/albto/public_html/mission-control"

echo "📤 Uploading to $A2HOST_SERVER..."
rsync -avz --delete dist/ "$A2HOST_USER@$A2HOST_SERVER:$A2HOST_PATH/"

echo "✅ Deployed to: https://albto.me/mission-control/"
echo "🔗 Projects page: https://albto.me/mission-control/projects"
