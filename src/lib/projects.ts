// Project management database operations - Vercel-compatible
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

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

// Vercel-compatible DB path
function getDbPath(): string {
  // Serverless environments (Vercel): Use /tmp
  // Local: Use project directory
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/mission-control.db';
  }
  return path.resolve(process.cwd(), 'mission-control.db');
}

// Database singleton
let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

// Open database connection
export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await open({
    filename: getDbPath(),
    driver: sqlite3.Database
  });
  
  return dbInstance;
}

// Get all projects with their suggestions
export async function getAllProjects(): Promise<ProjectWithSuggestions[]> {
  const db = await getDb();
  
  const projects = await db.all<Project[]>('SELECT * FROM projects ORDER BY id DESC');
  
  const projectsWithSuggestions: ProjectWithSuggestions[] = [];
  
  for (const project of projects) {
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
  
  fields.push('last_activity = datetime(\'now\')');
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

export interface ProjectWithSuggestions extends Project {
  suggestions: ProjectSuggestion[];
}
