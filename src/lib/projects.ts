// Project management database operations - Vercel-compatible
// DEFERRED LOADING: No database operations during build

import type { Database } from 'sqlite3';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  last_activity: string;
  config_json: string;
}

export interface ProjectSuggestion {
  id: number;
  project_id: number;
  suggestion_type: string;
  title: string;
  description: string;
  confidence: number;
  status: 'pending' | 'approved' | 'declined' | 'snoozed' | 'executed';
  created_at: string;
  acted_at: string | null;
}

export interface ProjectWithSuggestions extends Project {
  suggestions: ProjectSuggestion[];
}

// Lazy load sqlite3 only when needed (NOT at build time)
async function getSqliteModule() {
  const { open } = await import('sqlite');
  const sqlite3 = await import('sqlite3');
  return { open, sqlite3 };
}

// Detect if we're in build phase
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         process.env.VERCEL_ENV === 'production' && !process.env.VERCEL_URL;
}

// Get database path based on environment
function getDbPath(): string {
  // Vercel: /tmp is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/mission-control.db';
  }
  // Local development
  return require('path').resolve(process.cwd(), 'mission-control.db');
}

// Database connection cache
let dbPromise: Promise<any> | null = null;

// Lazy database initialization - never called during build
async function getDbLazy() {
  if (dbPromise) return dbPromise;
  
  // During build, return null
  if (isBuildPhase()) {
    console.log('[DB] Build phase - skipping database init');
    throw new Error('Database not available during build');
  }
  
  dbPromise = (async () => {
    const { open, sqlite3 } = await getSqliteModule();
    const dbPath = getDbPath();
    
    console.log('[DB] Connecting to:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.default.Database
    });
    
    // Initialize schema
    await initSchema(db);
    
    return db;
  })();
  
  return dbPromise;
}

async function initSchema(db: any) {
  await db.run(`
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
  
  await db.run(`
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
  
  await db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      details TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await db.run(`
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

// Safe getDb that handles build phase
export async function getDb() {
  try {
    return await getDbLazy();
  } catch (e) {
    console.error('[DB] Failed to get database:', e);
    throw e;
  }
}

// Get all projects with their suggestions
export async function getAllProjects(): Promise<ProjectWithSuggestions[]> {
  const db = await getDb();
  
  const projects = await db.all<Project[]>('SELECT * FROM projects ORDER BY id DESC');
  
  const projectsWithSuggestions: ProjectWithSuggestions[] = [];
  
  for (const project of projects || []) {
    const suggestions = await db.all<ProjectSuggestion[]>(
      'SELECT * FROM project_suggestions WHERE project_id = ? ORDER BY confidence DESC',
      project.id
    );
    
    projectsWithSuggestions.push({
      ...project,
      suggestions: suggestions || []
    });
  }
  
  return projectsWithSuggestions;
}

// Get project by ID
export async function getProjectById(id: number): Promise<ProjectWithSuggestions | null> {
  const db = await getDb();
  
  const project = await db.get<Project>('SELECT * FROM projects WHERE id = ?', id);
  if (!project) return null;
  
  const suggestions = await db.all<ProjectSuggestion[]>(
    'SELECT * FROM project_suggestions WHERE project_id = ? ORDER BY confidence DESC',
    id
  );
  
  return {
    ...project,
    suggestions: suggestions || []
  };
}

// Create new project
export async function createProject(data: {
  name: string;
  description: string;
  status?: string;
  progress?: number;
}): Promise<Project> {
  const db = await getDb();
  
  const result = await db.run(
    `INSERT INTO projects (name, description, status, progress, last_activity) 
     VALUES (?, ?, ?, ?, datetime('now'))`,
    data.name,
    data.description,
    data.status || 'active',
    data.progress || 0
  );
  
  const project = await db.get<Project>('SELECT * FROM projects WHERE id = ?', result.lastID);
  return project!;
}

// Update project
export async function updateProject(
  id: number,
  data: Partial<Project>
): Promise<Project | null> {
  const db = await getDb();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    values.push(data.status);
  }
  if (data.progress !== undefined) {
    fields.push('progress = ?');
    values.push(data.progress);
  }
  
  if (fields.length === 0) return getProjectById(id);
  
  fields.push("last_activity = datetime('now')");
  values.push(id);
  
  await db.run(
    `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
  
  return getProjectById(id);
}

// Create suggestion for project
export async function createSuggestion(data: {
  project_id: number;
  suggestion_type: string;
  title: string;
  description: string;
  confidence: number;
}): Promise<ProjectSuggestion> {
  const db = await getDb();
  
  const result = await db.run(
    `INSERT INTO project_suggestions 
     (project_id, suggestion_type, title, description, confidence, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    data.project_id,
    data.suggestion_type,
    data.title,
    data.description,
    data.confidence
  );
  
  const suggestion = await db.get<ProjectSuggestion>(
    'SELECT * FROM project_suggestions WHERE id = ?',
    result.lastID
  );
  return suggestion!;
}

// Update suggestion status
export async function updateSuggestionStatus(
  id: number,
  status: 'approved' | 'declined' | 'snoozed' | 'executed'
): Promise<ProjectSuggestion | null> {
  const db = await getDb();
  
  await db.run(
    `UPDATE project_suggestions 
     SET status = ?, acted_at = datetime('now') 
     WHERE id = ?`,
    status,
    id
  );
  
  return db.get<ProjectSuggestion>(
    'SELECT * FROM project_suggestions WHERE id = ?',
    id
  );
}
