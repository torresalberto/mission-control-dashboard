#!/bin/bash
# Safe dashboard startup — prevents dist/ corruption

cd /home/alb/.openclaw/workspace/mission-control

# Kill any existing dev servers
pkill -9 -f "next dev" 2>/dev/null
sleep 1

# Clean corrupt folders
rm -rf dist .next

# Start fresh
echo "Starting Mission Control..."
npm run dev
