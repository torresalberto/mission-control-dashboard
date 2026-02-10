// Database utilities - NO imports at build time
// Everything is conditionally loaded to avoid Vercel build errors

// Detect build phase
function isBuildPhase(): boolean {
  return typeof window === 'undefined' && 
    (process.env.NEXT_PHASE === 'phase-production-build' || 
     (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL));
}

// Return database path based on environment
export function getDbPath(): string {
  // Vercel/AWS Lambda: use /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/mission-control.db';
  }
  // Local development
  return require('path').resolve(process.cwd(), 'mission-control.db');
}

// Safe database initialization - returns mock during build, real DB at runtime
export function initDb(): any {
  // BUILD PHASE: Return a mock database that prevents errors
  if (isBuildPhase()) {
    console.log('[DB] Build phase - returning mock');
    return createMockDb();
  }
  
  // RUNTIME: Actually create the database
  try {
    // Dynamic require - only load sqlite3 at runtime
    const sqlite3 = require('sqlite3');
    const dbPath = getDbPath();
    
    console.log('[DB] Runtime - initializing:', dbPath);
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
    
    db.run('PRAGMA journal_mode = WAL', (err: any) => {
      if (err) console.error('[DB] WAL error:', err);
    });
    
    initTables(db);
    
    return db;
  } catch (e) {
    console.error('[DB] Runtime error:', e);
    return createMockDb();
  }
}

// Mock database for build phase
function createMockDb(): any {
  const mockQueries: string[] = [];
  
  return {
    run: (sql: string, ...params: any[]) => {
      mockQueries.push(sql);
      // Callback-style compatibility
      if (typeof params[params.length - 1] === 'function') {
        params[params.length - 1](null);
      }
    },
    all: (sql: string, ...params: any[]) => {
      if (typeof params[params.length - 1] === 'function') {
        params[params.length - 1](null, []);
      }
    },
    get: (sql: string, ...params: any[]) => {
      if (typeof params[params.length - 1] === 'function') {
        params[params.length - 1](null, null);
      }
    },
    close: () => {}
  };
}

// Initialize schema on real database
function initTables(db: any) {
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    last_activity TEXT,
    config_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS project_suggestions (
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
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    details TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    priority TEXT,
    due_date TEXT,
    completed BOOLEAN DEFAULT 0
  )`);
}

// Activity logging function
export function logActivity(action: string, details: string): void {
  try {
    const db = initDb();
    db.run(
      'INSERT INTO activity_logs (action, details) VALUES (?, ?)',
      [action, details],
      (err: any) => {
        if (err) console.error('[Activity] Failed to log:', err);
        else console.log('[Activity] Logged:', action, '|', details);
      }
    );
  } catch (error) {
    console.error('[Activity] Error logging activity:', error);
  }
}

// Safe getter
export default function getDb(): any {
  return initDb();
}

export { isBuildPhase };
