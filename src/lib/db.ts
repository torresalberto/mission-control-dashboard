import sqlite3 from 'sqlite3';
import { join } from 'path';

// Use absolute path to ensure DB is always found
const dbPath = join('/home/alb/.openclaw/workspace/mission-control', 'mission-control.db');

let db: sqlite3.Database | null = null;

export function initDb(): sqlite3.Database {
  if (db) return db;
  db = new sqlite3.Database(dbPath);
  
  // Enable WAL mode
  db.run('PRAGMA journal_mode = WAL');
  
  console.log('✓ Database initialized');
  return db;
}

export default function getDb() {
  if (!db) return initDb();
  return db;
}
