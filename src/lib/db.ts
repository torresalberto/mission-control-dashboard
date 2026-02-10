import sqlite3 from 'sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Detect environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

let db: sqlite3.Database | null = null;
let isInitialized = false;

// Vercel: Use /tmp for ephemeral storage
// Local: Use workspace directory
function getDbPath(): string {
  if (process.env.DATABASE_URL) {
    // External database (e.g., PlanetScale, Supabase)
    return process.env.DATABASE_URL;
  }
  
  if (isServerless) {
    // Serverless: /tmp is writable
    return '/tmp/mission-control.db';
  }
  
  // Local development
  return join('/home/alb/.openclaw/workspace/mission-control', 'mission-control.db');
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    try {
      mkdirSync(dir, { recursive: true });
    } catch (e) {
      // Directory might already exist or /tmp is auto-created
    }
  }
}

export function initDb(): sqlite3.Database | null {
  if (isInitialized) return db;
  
  const dbPath = getDbPath();
  
  // Ensure directory (skip for /tmp)
  if (!isServerless) {
    const dir = dbPath.substring(0, dbPath.lastIndexOf('/'));
    ensureDir(dir);
  }
  
  try {
    // Open database
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('[DB] Failed to open:', err.message);
        return;
      }
      console.log('[DB] Connected to', dbPath);
    });
    
    // Enable WAL mode for better concurrency
    db.run('PRAGMA journal_mode = WAL', (err) => {
      if (err) console.error('[DB] WAL mode failed:', err);
    });
    
    // Initialize schema
    initSchema(db);
    
    isInitialized = true;
    return db;
    
  } catch (err) {
    console.error('[DB] Initialization error:', err);
    return null;
  }
}

function initSchema(database: sqlite3.Database) {
  database.run(`
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
  `, (err) => {
    if (err) console.error('[DB] Projects table:', err);
  });
  
  database.run(`
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
  `, (err) => {
    if (err) console.error('[DB] Suggestions table:', err);
  });
  
  database.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      details TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('[DB] Activity table:', err);
  });
  
  database.run(`
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      priority TEXT,
      due_date TEXT,
      completed BOOLEAN DEFAULT 0
    )
  `, (err) => {
    if (err) console.error('[DB] Tasks table:', err);
  });
}

// Safe database getter - never returns null
export default function getDb(): sqlite3.Database {
  const database = initDb();
  if (!database) {
    throw new Error('Database initialization failed');
  }
  return database;
}

// Check if database is ready
export function isDbReady(): boolean {
  return isInitialized && db !== null;
}
