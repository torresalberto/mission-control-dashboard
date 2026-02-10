import * as sqlite3 from 'sqlite3';

interface ActivityLog {
  id?: number;
  timestamp: number;
  action_type: string;
  tool_name: string;
  params: string;
  result_summary: string;
  files_modified: string;
}

class ActivityLogger {
  private db: sqlite3.Database;
  private static instance: ActivityLogger;

  constructor(dbPath: string = './activity_logs.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initDatabase();
  }

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            tool_name TEXT NOT NULL,
            params TEXT,
            result_summary TEXT,
            files_modified TEXT
          )
        `, (err) => {
          if (err) reject(err);
          else resolve();
        });

        this.db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON activity_logs(timestamp)`, (err) => {
          if (err) reject(err);
        });

        this.db.run(`CREATE INDEX IF NOT EXISTS idx_action_type ON activity_logs(action_type)`, (err) => {
          if (err) reject(err);
        });
      });
    });
  }

  async logActivity({
    action_type,
    tool_name,
    params,
    result_summary,
    files_modified
  }: {
    action_type: string;
    tool_name: string;
    params?: any;
    result_summary?: string;
    files_modified?: string[];
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const logEntry: ActivityLog = {
        timestamp: Date.now(),
        action_type,
        tool_name,
        params: params ? JSON.stringify(params) : 'null',
        result_summary: result_summary || '',
        files_modified: files_modified ? JSON.stringify(files_modified) : ''
      };

      this.db.run(
        `INSERT INTO activity_logs (timestamp, action_type, tool_name, params, result_summary, files_modified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          logEntry.timestamp,
          logEntry.action_type,
          logEntry.tool_name,
          logEntry.params,
          logEntry.result_summary,
          logEntry.files_modified
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getRecentActivities(limit: number = 50): Promise<ActivityLog[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?`,
        [limit],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            params: row.params ? JSON.parse(row.params) : null,
            files_modified: row.files_modified ? JSON.parse(row.files_modified) : []
          })));
        }
      );
    });
  }

  async getActivitiesByTool(toolName: string, limit: number = 20): Promise<ActivityLog[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM activity_logs WHERE tool_name = ? ORDER BY timestamp DESC LIMIT ?`,
        [toolName, limit],
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            params: row.params ? JSON.parse(row.params) : null,
            files_modified: row.files_modified ? JSON.parse(row.files_modified) : []
          })));
        }
      );
    });
  }
}

export default ActivityLogger;
