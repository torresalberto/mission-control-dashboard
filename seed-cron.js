// Seed cron jobs - using sqlite3
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/mission-control.db' 
  : path.join(__dirname, 'mission-control.db');

const db = new sqlite3.Database(dbPath);

// Cron jobs
const cronJobs = [
  { name: 'family-weather', schedule: '0 7 * * *', description: 'Daily weather report at 7 AM', category: 'cron', status: 'active' },
  { name: 'goodnight-dad', schedule: '0 20 * * *', description: 'Goodnight message to Dad', category: 'cron', status: 'active' },
  { name: 'goodnight-mom', schedule: '0 21 * * *', description: 'Goodnight message to Mom', category: 'cron', status: 'active' },
  { name: 'goodnight-sister', schedule: '0 21 * * *', description: 'Goodnight message to Sister', category: 'cron', status: 'active' },
  { name: 'model-health-check', schedule: '0 */6 * * *', description: 'Model health check every 6 hours', category: 'maintenance', status: 'active' },
  { name: 'whatsapp-real-keepalive', schedule: '*/5 * * * *', description: 'WhatsApp keepalive ping', category: 'maintenance', status: 'active' },
  { name: 'daily-status-report', schedule: '0 9 * * *', description: 'Daily status report', category: 'cron', status: 'active' }
];

console.log('🌱 Seeding database...\n');

const now = new Date();

db.serialize(() => {
  // Clear existing
  db.run('DELETE FROM scheduled_tasks');
  db.run('DELETE FROM activity_logs');
  
  // Seed tasks
  const taskStmt = db.prepare(
    'INSERT INTO scheduled_tasks (name, schedule, description, category, status, next_run) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  for (const job of cronJobs) {
    let nextRun = new Date(now);
    
    switch (job.name) {
      case 'family-weather':
        nextRun.setHours(7, 0, 0, 0);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'goodnight-dad':
        nextRun.setHours(20, 0, 0, 0);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'goodnight-mom':
      case 'goodnight-sister':
        nextRun.setHours(21, 0, 0, 0);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'daily-status-report':
        nextRun.setHours(9, 0, 0, 0);
        if (nextRun <= now) nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'model-health-check':
        const currentHour = now.getHours();
        const next6Hour = Math.ceil((currentHour + 1) / 6) * 6;
        if (next6Hour >= 24) {
          nextRun.setDate(nextRun.getDate() + 1);
          nextRun.setHours(next6Hour - 24, 0, 0, 0);
        } else {
          nextRun.setHours(next6Hour, 0, 0, 0);
        }
        break;
      case 'whatsapp-real-keepalive':
        nextRun = new Date(now.getTime() + 5 * 60 * 1000);
        break;
    }
    
    taskStmt.run(job.name, job.schedule, job.description, job.category, job.status, nextRun.toISOString());
    console.log(`✅ ${job.name}`);
  }
  taskStmt.finalize();
  
  // Seed activities
  const activities = [
    { action_type: 'message_send', tool_name: 'message', result_summary: 'Sent morning weather to family', session_id: 'agent:main:main', success: 1 },
    { action_type: 'heartbeat', tool_name: 'sessions_list', result_summary: 'Checked sub-agent health', session_id: 'agent:main:main', success: 1 },
    { action_type: 'file_write', tool_name: 'write', result_summary: 'Created Mission Control dashboard', files_modified: 'mission-control/src/app/activity/page.tsx', session_id: 'agent:main:subagent', success: 1 },
    { action_type: 'subagent_complete', tool_name: 'sessions_spawn', result_summary: 'NexAgua blog post created and pushed', session_id: 'agent:main:subagent', success: 1 }
  ];
  
  const actStmt = db.prepare(
    'INSERT INTO activity_logs (action_type, tool_name, result_summary, files_modified, session_id, success) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  for (const activity of activities) {
    actStmt.run(
      activity.action_type,
      activity.tool_name,
      activity.result_summary,
      activity.files_modified || null,
      activity.session_id,
      activity.success
    );
  }
  actStmt.finalize();
  
  console.log(`\n✅ ${cronJobs.length} tasks + ${activities.length} activities seeded`);
});

db.close();
