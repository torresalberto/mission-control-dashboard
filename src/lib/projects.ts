// Project management database operations - Vercel-compatible
// DEFERRED LOADING: No database operations during build

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

// Database connection cache
let dbPromise: Promise<any> | null = null;

// Detect build phase - return mock DB during build
function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL);
}

// Lazy database initialization - never called during build
async function getDbLazy() {
  if (dbPromise) return dbPromise;
  
  // During build, return mock
  if (isBuildPhase()) {
    console.log('[DB] Build phase - returning mock');
    return createMockDb();
  }
  
  dbPromise = (async () => {
    const { open } = await import('sqlite');
    const sqlite3 = await import('sqlite3');
    
    const dbPath = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? '/tmp/mission-control.db'
      : require('path').resolve(process.cwd(), 'mission-control.db');
    
    console.log('[DB] Connecting to:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.default.Database
    });
    
    await initSchema(db);
    return db;
  })();
  
  return dbPromise;
}

function createMockDb() {
  const mock = async () => [];
  mock.run = async () => ({ lastID: 1 });
  mock.get = async () => null;
  mock.all = async () => [];
  return mock;
}

async function initSchema(db: any) {
  await db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    last_activity TEXT,
    config_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  
  await db.run(`CREATE TABLE IF NOT EXISTS project_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    suggestion_type TEXT,
    title TEXT,
    description TEXT,
    confidence INTEGER,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    acted_at TEXT
  )`);
  
  await db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    details TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  
  await db.run(`CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    priority TEXT,
    due_date TEXT,
    completed BOOLEAN DEFAULT 0
  )`);
}

// Safe getDb - handles build phase
export async function getDb() {
  try {
    return await getDbLazy();
  } catch (e: any) {
    console.error('[DB] Failed:', e.message);
    return createMockDb();
  }
}

// Get all projects with their suggestions
export async function getAllProjects(): Promise<ProjectWithSuggestions[]> {
  const db = await getDb();
  
  const projects = (await db.all('SELECT * FROM projects ORDER BY id DESC')) as Project[];
  
  const projectsWithSuggestions: ProjectWithSuggestions[] = [];
  
  for (const project of projects || []) {
    const suggestions = (await db.all(
      'SELECT * FROM project_suggestions WHERE project_id = ? ORDER BY confidence DESC',
      project.id
    )) as ProjectSuggestion[];
    
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
  
  const project = (await db.get('SELECT * FROM projects WHERE id = ?', id)) as Project | undefined;
  if (!project) return null;
  
  const suggestions = (await db.all(
    'SELECT * FROM project_suggestions WHERE project_id = ? ORDER BY confidence DESC',
    id
  )) as ProjectSuggestion[];
  
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
  
  const project = (await db.get('SELECT * FROM projects WHERE id = ?', result.lastID)) as Project;
  return project;
}

// Update project
export async function updateProject(
  id: number,
  data: Partial<Project>
): Promise<ProjectWithSuggestions | null> {
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
  
  const suggestion = (await db.get(
    'SELECT * FROM project_suggestions WHERE id = ?',
    result.lastID
  )) as ProjectSuggestion;
  
  return suggestion;
}

// Update suggestion status
export async function updateSuggestionStatus(
  id: number,
  status: 'approved' | 'declined' | 'snoozed' | 'executed',
  reason?: string
): Promise<ProjectSuggestion | null> {
  const db = await getDb();
  
  // Log reason if provided
  if (reason) {
    await db.run(
      'INSERT INTO activity_logs (action, details, timestamp) VALUES (?, ?, datetime("now"))',
      `suggestion_${status}`,
      JSON.stringify({ suggestionId: id, reason })
    );
  }
  
  await db.run(
    'UPDATE project_suggestions SET status = ?, acted_at = datetime("now") WHERE id = ?',
    status,
    id
  );
  
  return (await db.get('SELECT * FROM project_suggestions WHERE id = ?', id)) as ProjectSuggestion | null;
}
