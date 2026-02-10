#!/bin/bash
cd /home/alb/.openclaw/workspace/mission-control

# Clear caches
rm -rf .next node_modules/.cache 2>/dev/null
pkill -9 -f "next" 2>/dev/null
sleep 2

# Start dev server
npx next dev -p 3002 2>&1 | tee -a dashboard.log
