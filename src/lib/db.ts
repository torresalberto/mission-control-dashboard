// Database interface for Mission Control - Vercel compatible
// Provides mock database for static generation, real DB at runtime

let dbInstance: any = null;

// Mock database for static generation / build phase
const createMockDb = () => {
  const mockDb = {
    all: async () => [],
    get: async () => null,
    run: async () => ({ lastID: 1, changes: 1 }),
  };
  return mockDb;
};

// Initialize database - returns mock during build, real DB at runtime
export async function initDb() {
  if (dbInstance) return dbInstance;
  
  // During build/static generation, return mock
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    dbInstance = createMockDb();
    return dbInstance;
  }
  
  // Runtime - try to use real database
  try {
    const sqlite3 = await import('sqlite3');
    const { open } = await import('sqlite');
    
    const dbPath = process.env.VERCEL 
      ? '/tmp/mission-control.db' 
      : './mission-control.db';
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.default.Database
    });
    
    // Initialize schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        last_activity TEXT,
        config_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS project_suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        suggestion_type TEXT,
        title TEXT,
        description TEXT,
        confidence INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        acted_at TEXT
      );
      
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        details TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        schedule TEXT,
        next_run TEXT,
        last_run TEXT,
        status TEXT,
        description TEXT,
        category TEXT
      );
    `);
    
    dbInstance = db;
    return db;
  } catch (error) {
    console.log('Using mock DB:', error);
    dbInstance = createMockDb();
    return dbInstance;
  }
}

// Get existing DB instance
export async function getDb() {
  return initDb();
}

// Log activity - async
export async function logActivity(action: string, details: string) {
  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO activity_logs (action, details) VALUES (?, ?)',
      [action, details]
    );
    console.log(`[Activity] ${action}: ${details}`);
  } catch (e) {
    console.log('[Activity] Failed to log:', e);
  }
}

// Activity database class
class ActivityDb {
  async logActivity(action: string, details: string) {
    return logActivity(action, details);
  }
  
  async getRecentActivities(limit = 50) {
    try {
      const db = await getDb();
      return await db.all(
        'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?',
        [limit]
      );
    } catch {
      return [];
    }
  }
}

export default new ActivityDb();
