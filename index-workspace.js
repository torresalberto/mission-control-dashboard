// Workspace indexer for Mission Control - using sqlite3
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/mission-control.db' 
  : path.join(__dirname, 'mission-control.db');

const db = new sqlite3.Database(dbPath);

// Enable WAL mode for performance
db.run('PRAGMA journal_mode = WAL');

// Files to index
const memoryDir = '/home/alb/.openclaw/workspace/memory/';
const filesToIndex = [];

// Add memory files
if (fs.existsSync(memoryDir)) {
  const memoryFiles = fs.readdirSync(memoryDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(memoryDir, f));
  filesToIndex.push(...memoryFiles);
}

// Add main workspace files
const mainFiles = [
  '/home/alb/.openclaw/workspace/TASKS_TRACKER.md',
  '/home/alb/.openclaw/workspace/PROJECTS_DASHBOARD.md',
  '/home/alb/.openclaw/workspace/MEMORY.md',
  '/home/alb/.openclaw/workspace/HEARTBEAT.md',
  '/home/alb/.openclaw/workspace/SOUL.md',
  '/home/alb/.openclaw/workspace/USER.md',
  '/home/alb/.openclaw/workspace/AGENTS.md',
];

filesToIndex.push(...mainFiles.filter(f => fs.existsSync(f)));

let indexedCount = 0;
let totalWords = 0;

console.log('🗂️ Indexing workspace files...\n');

db.serialize(() => {
  db.run('DELETE FROM search_index'); // Clear existing
  
  const stmt = db.prepare(
    'INSERT INTO search_index (content, source_path, source_type, modified_date) VALUES (?, ?, ?, ?)'
  );
  
  for (const filePath of filesToIndex) {
    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
      
      // Determine source type
      let sourceType = 'document';
      if (filePath.includes('/memory/')) {
        sourceType = 'memory';
      } else if (filePath.includes('TASKS') || filePath.includes('DASHBOARD')) {
        sourceType = 'task';
      }
      
      stmt.run(content, filePath, sourceType, stats.mtime.toISOString());
      
      indexedCount++;
      totalWords += wordCount;
      console.log(`✅ ${path.basename(filePath)} (${wordCount} words)`);
      
    } catch (error) {
      console.error(`❌ Error: ${filePath} - ${error.message}`);
    }
  }
  
  stmt.finalize();
});

db.close(() => {
  console.log(`\n📊 INDEX COMPLETE:`);
  console.log(`   Files indexed: ${indexedCount}`);
  console.log(`   Total words: ${totalWords.toLocaleString()}`);
});
