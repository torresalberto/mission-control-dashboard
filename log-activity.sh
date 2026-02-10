#!/bin/bash
# Real-time activity logger for Mission Control
# Usage: ./log-activity.sh "action_type" "tool_name" "result_summary"

ACTION_TYPE="$1"
TOOL_NAME="$2"
RESULT_SUMMARY="$3"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cd /home/alb/.openclaw/workspace/mission-control
node -e "
const db = require('./src/lib/db.ts').db || require('better-sqlite3')('./mission-control.db');

db.exec(\`
  INSERT INTO activity_logs (timestamp, action_type, tool_name, result_summary, success, session_id)
  VALUES ('\${TIMESTAMP}', '\${ACTION_TYPE}', '\${TOOL_NAME}', '\${RESULT_SUMMARY}', true, 'main-session');
\`);
console.log('✓ Activity logged:', '\${ACTION_TYPE}', '-', '\${TOOL_NAME}');
"
