// Database initialization - Deferred loading for Vercel compatibility
// This module defers all database operations until request time (NOT build time)

// Detect build phase
const isBuildPhase = typeof window === 'undefined' && 
  (process.env.NEXT_PHASE === 'phase-production-build' || 
   process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL);

// Return a stub during build that creates real DB at runtime
export function getDbPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/mission-control.db';
  }
  return '/home/alb/.openclaw/workspace/mission-control/mission-control.db';
}

// During build, return a mock that prevents errors
// At runtime, returns the actual path
export function initDb(): any {
  if (isBuildPhase) {
    console.log('[DB] Build phase - returning stub');
    return null;
  }
  
  // Lazy load sqlite3 only at runtime
  const sqlite3 = require('sqlite3');
  const path = getDbPath();
  
  console.log('[DB] Initializing:', path);
  
  try {
    const db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
    
    db.run('PRAGMA journal_mode = WAL', (err: any) => {
      if (err) console.error('[DB] WAL error:', err);
    });
    
    initTables(db);
    
    return db;
  } catch (e) {
    console.error('[DB] Init error:', e);
    return null;
  }
}

function initTables(db: any) {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      last_activity TEXT,
      config_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS project_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      suggestion_type TEXT,
      title TEXT,
      description TEXT,
      confidence INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      acted_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      details TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      priority TEXT,
      due_date TEXT,
      completed BOOLEAN DEFAULT 0
    )
  `);
}

// Safe getter - throws if db unavailable (API will handle error)
export default function getDb(): any {
  const db = initDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db;
}

// Check if in build phase
export { isBuildPhase };
