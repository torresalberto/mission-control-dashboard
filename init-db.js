// Initialize database tables
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mission-control.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ Initializing database...\n');

db.serialize(() => {
  // Activity logs
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      action_type TEXT NOT NULL,
      tool_name TEXT,
      params TEXT,
      result_summary TEXT,
      files_modified TEXT,
      session_id TEXT,
      success BOOLEAN
    )
  `, (err) => {
    if (err) console.error('activity_logs error:', err);
    else console.log('✓ activity_logs table');
  });
  
  // Scheduled tasks
  db.run(`
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL,
      next_run DATETIME,
      last_run DATETIME,
      status TEXT,
      description TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('scheduled_tasks error:', err);
    else console.log('✓ scheduled_tasks table');
  });
  
  // FTS5 index
  db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(content, source_path, source_type, modified_date)`, (err) => {
    if (err) console.error('search_index error:', err);
    else console.log('✓ search_index table (FTS5)');
  });

  // Projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('active', 'paused', 'completed', 'archived')) DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      config_json TEXT
    )
  `, (err) => {
    if (err) console.error('projects error:', err);
    else console.log('✓ projects table');
  });

  // Project suggestions table
  db.run(`
    CREATE TABLE IF NOT EXISTS project_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      suggestion_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      confidence INTEGER DEFAULT 50,
      status TEXT CHECK(status IN ('pending', 'approved', 'declined', 'snoozed', 'executed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acted_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('project_suggestions error:', err);
    else console.log('✓ project_suggestions table');
  });

  // Suggestion actions table
  db.run(`
    CREATE TABLE IF NOT EXISTS suggestion_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suggestion_id INTEGER NOT NULL,
      action TEXT CHECK(action IN ('approve', 'decline', 'snooze')) NOT NULL,
      reason TEXT,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (suggestion_id) REFERENCES project_suggestions (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('suggestion_actions error:', err);
    else console.log('✓ suggestion_actions table');
  });
});

db.close(() => {
  console.log('\n✅ Database initialized');
});
