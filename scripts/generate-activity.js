#!/usr/bin/env node

/**
 * Simple Activity Feed Generator
 * Creates static JSON activity with Director + agent visibility
 */

const fs = require('fs');
const path = require('path');

// Activity templates that clearly show Director and agents
const ACTIVITY_TEMPLATES = [
  {
    id: 'director_delegation',
    type: 'director',
    agent: 'Director',
    action: 'Task Decomposition',
    description: 'Breaking complex request into atomic sub-tasks',
    status: 'running',
    duration: '2s'
  },
  {
    id: 'agent_assignment',
    type: 'director', 
    agent: 'Director',
    action: 'Agent Deployment',
    description: 'Assigned to K2.5-Think (analysis), Kimi-Instruct (execution), Instruct-0905 (QA)',
    status: 'completed',
    duration: '1s'
  },
  {
    id: 'k25_analysis',
    type: 'agent',
    agent: 'K2.5-Think',
    action: 'Deep Analysis',
    description: 'Analyzing requirements and producing strategic insights',
    status: 'completed',
    duration: '2m 15s'
  },
  {
    id: 'kimi_execution',
    type: 'agent',
    agent: 'Kimi-Instruct',
    action: 'Code Generation',
    description: 'Building implementation based on analysis',
    status: 'completed',
    duration: '3m 30s'
  },
  {
    id: 'instruct_qa',
    type: 'agent',
    agent: 'Instruct-0905',
    action: 'Quality Review',
    description: 'Verifying code quality and formatting standards',
    status: 'completed',
    duration: '45s'
  },
  {
    id: 'director_consolidation',
    type: 'director',
    agent: 'Director',
    action: 'Result Consolidation',
    description: 'Merging outputs from 3 completed agents',
    status: 'completed',
    duration: '8s'
  },
  {
    id: 'completion_summary',
    type: 'director',
    agent: 'Director',
    action: 'Task Delivery',
    description: 'Delivering consolidated results to user',
    status: 'completed',
    duration: '1s'
  }
];

function generateActivity() {
  const now = new Date();
  const activities = [];
  
  // Generate recent activity sequence
  const baseTime = now.getTime() - (30 * 60 * 1000); // 30 minutes ago
  
  ACTIVITY_TEMPLATES.forEach((template, index) => {
    const activityTime = new Date(baseTime + (index * 2 * 60 * 1000));
    
    activities.push({
      ...template,
      id: `${template.id}_${Date.now()}_${index}`,
      timestamp: activityTime.toISOString(),
      display_time: activityTime.toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
    });
  });

  return activities.reverse();
}

function generateStaticActivity() {
  const activities = generateActivity();
  const activityData = {
    timestamp: new Date().toISOString(),
    activities,
    summary: {
      director_actions: activities.filter(a => a.type === 'director').length,
      agent_actions: activities.filter(a => a.type === 'agent').length,
      total_duration: '8m 39s',
      last_update: new Date().toLocaleTimeString()
    }
  };

  // Ensure public directory exists
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write main activity file
  const activityPath = path.join(publicDir, 'activity.json');
  fs.writeFileSync(activityPath, JSON.stringify(activityData, null, 2));
  
  // Write backup/seed file for development
  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'data', 'activities.json'),
    JSON.stringify(activityData, null, 2)
  );

  console.log(`✅ Generated activity feed with ${activityData.activities.length} items`);
  console.log(`📄 Output: ${activityPath}`);
  
  return activityData;
}

// Allow direct execution
if (require.main === module) {
  generateStaticActivity();
}

module.exports = { generateStaticActivity };