// Project management database operations
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { promisify } from 'util';

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

export interface SuggestionAction {
  id: number;
  suggestion_id: number;
  action: 'approve' | 'decline' | 'snooze';
  reason: string;
  executed_at: string;
}

export interface ProjectWithSuggestions extends Project {
  suggestions: ProjectSuggestion[];
}

// Helper function to get DB path
function getDbPath() {
  return path.resolve(process.cwd(), 'mission-control.db');
}

// Open database connection
export async function getDb() {
  const sqlite = require('sqlite3');
  return open({
    filename: getDbPath(),
    driver: sqlite3.Database
  });
}

// Get all projects with their suggestions
export async function getAllProjects(): Promise<ProjectWithSuggestions[]> {
  const db = await getDb();
  
  try {
    const projects = await db.all<Project[]>(`SELECT * FROM projects ORDER BY last_activity DESC`);
    
    const projectsWithSuggestions = await Promise.all(
      projects.map(async (project) => {
        const suggestions = await db.all<ProjectSuggestion[]>(
          `SELECT * FROM project_suggestions WHERE project_id = ? ORDER BY created_at DESC`,
          [project.id]
        );
        return { ...project, suggestions };
      })
    );
    
    return projectsWithSuggestions;
  } finally {
    await db.close();
  }
}

// Get specific project by ID
export async function getProject(id: number): Promise<ProjectWithSuggestions | null> {
  const db = await getDb();
  
  try {
    const project = await db.get<Project>(`SELECT * FROM projects WHERE id = ?`, [id]);
    if (!project) return null;
    
    const suggestions = await db.all<ProjectSuggestion[]>(
      `SELECT * FROM project_suggestions WHERE project_id = ? ORDER BY created_at DESC`,
      [project.id]
    );
    
    return { ...project, suggestions };
  } finally {
    await db.close();
  }
}

// Create new project
export async function createProject(project: Omit<Project, 'id' | 'last_activity'>): Promise<Project> {
  const db = await getDb();
  
  try {
    const result = await db.run(
      `INSERT INTO projects (name, description, status, progress, config_json) VALUES (?, ?, ?, ?, ?)`,
      [project.name, project.description || '', project.status || 'active', project.progress || 0, project.config_json || '{}']
    );
    
    const newProject = await db.get<Project>(`SELECT * FROM projects WHERE id = ?`, [result.lastID]);
    return newProject!;
  } finally {
    await db.close();
  }
}

// Create project suggestion
export async function createSuggestion(
  projectId: number,
  suggestion: Omit<ProjectSuggestion, 'id' | 'project_id' | 'status' | 'created_at' | 'acted_at'>
): Promise<ProjectSuggestion> {
  const db = await getDb();
  
  try {
    const result = await db.run(
      `INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
      [projectId, suggestion.suggestion_type, suggestion.title, suggestion.description, suggestion.confidence || 50]
    );
    
    const newSuggestion = await db.get<ProjectSuggestion>(
      `SELECT * FROM project_suggestions WHERE id = ?`, [result.lastID]
    );
    return newSuggestion!;
  } finally {
    await db.close();
  }
}

// Update suggestion status
export async function updateSuggestionStatus(
  suggestionId: number,
  status: 'approved' | 'declined' | 'snoozed' | 'executed',
  reason?: string
): Promise<void> {
  const db = await getDb();
  
  try {
    await db.run(
      `UPDATE project_suggestions SET status = ?, acted_at = ? WHERE id = ?`,
      [status, new Date().toISOString(), suggestionId]
    );
    
    // Log the action
    await db.run(
      `INSERT INTO suggestion_actions (suggestion_id, action, reason) VALUES (?, ?, ?)`,
      [suggestionId, status, reason || '']
    );
  } finally {
    await db.close();
  }
}

// Get pending suggestions for learning
export async function getDeclinedSuggestions(projectId: number): Promise<ProjectSuggestion[]> {
  const db = await getDb();
  
  try {
    return await db.all<ProjectSuggestion[]>(
      `SELECT * FROM project_suggestions 
       WHERE project_id = ? AND status = 'declined' 
       ORDER BY created_at DESC`,
      [projectId]
    );
  } finally {
    await db.close();
  }
}

// Update project progress
export async function updateProjectProgress(projectId: number, progress: number): Promise<void> {
  const db = await getDb();
  
  try {
    await db.run(
      `UPDATE projects SET progress = ?, last_activity = ? WHERE id = ?`,
      [Math.max(0, Math.min(100, progress)), new Date().toISOString(), projectId]
    );
  } finally {
    await db.close();
  }
}

// Get suggestions to display (excluding snoozed ones older than 24h)
export async function getActiveSuggestions(): Promise<ProjectSuggestion[]> {
  const db = await getDb();
  
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    return await db.all<ProjectSuggestion[]>(
      `SELECT * FROM project_suggestions 
       WHERE status = 'pending'
       OR (status = 'snoozed' AND created_at > ?)
       ORDER BY confidence DESC, created_at DESC`,
      [twentyFourHoursAgo]
    );
  } finally {
    await db.close();
  }
}