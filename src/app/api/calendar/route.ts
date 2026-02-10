import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const db = initDb();
  return new Promise<NextResponse>((resolve) => {
    db.all(
      `SELECT id, name, schedule, next_run, last_run, status, description, category FROM scheduled_tasks ORDER BY next_run ASC`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          resolve(NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 }));
          return;
        }
        const tasks = (rows || []).map((task: any) => ({
          ...task,
          next_run: task.next_run ? new Date(task.next_run).toISOString() : null,
          last_run: task.last_run ? new Date(task.last_run).toISOString() : null,
        }));
        resolve(NextResponse.json({ tasks, count: tasks.length }));
      }
    );
  });
}
