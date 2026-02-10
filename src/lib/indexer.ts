import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

interface SearchResult {
  filePath: string;
  snippet: string;
  score: number;
}

export class WorkspaceIndexer {
  private db: sqlite3.Database;
  private workspacePath: string;

  constructor(workspacePath: string = process.env.HOME + '/.openclaw/workspace') {
    this.workspacePath = workspacePath;
    this.db = new sqlite3.Database('./mission-control.db');
    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
          content,
          file_path UNINDEXED,
          modified_date UNINDEXED
        )
      `);
    });
  }

  public async indexAllFiles(): Promise<{ files: number; directories: string[] }> {
    const files: string[] = [];
    const directories: Set<string> = new Set();

    const walkDir = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          directories.add(fullPath);
          walkDir(fullPath);
        } else if (entry.isFile() && this.shouldIndexFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    walkDir(this.workspacePath);

    for (const file of files) {
      await this.indexFile(file);
    }

    return { files: files.length, directories: Array.from(directories) };
  }

  private shouldIndexFile(filename: string): boolean {
    const extensions = ['.md', '.txt', '.ts', '.js', '.tsx', '.jsx', '.json'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  private async indexFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stat = fs.statSync(filePath);

      return new Promise((resolve, reject) => {
        this.db.run(
          'INSERT OR REPLACE INTO search_index (file_path, content, modified_date) VALUES (?, ?, ?)',
          [filePath, content, stat.mtime.toISOString()],
          (err: any) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    } catch (error) {
      console.warn(`Failed to index ${filePath}:`, error);
    }
  }

  public async search(query: string): Promise<SearchResult[]> {
    const sql = `
      SELECT file_path, snippet(search_index, 0, '<mark>', '</mark>', '...', 32) as snippet
      FROM search_index
      WHERE search_index MATCH ?
      LIMIT 20
    `;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [query], (err: any, rows: any[]) => {
        if (err) reject(err);
        else resolve((rows || []).map((row: any) => ({
          filePath: row.file_path,
          snippet: row.snippet,
          score: 1
        })));
      });
    });
  }

  public close(): void {
    this.db.close();
  }
}
