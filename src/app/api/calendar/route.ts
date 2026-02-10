import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const rows = await db.all(`SELECT id, name, schedule, next_run, last_run, status, description, category FROM scheduled_tasks ORDER BY next_run ASC`);
    
    const tasks = (rows || []).map((task: any) => ({
      ...task,
      next_run: task.next_run ? new Date(task.next_run).toISOString() : null,
      last_run: task.last_run ? new Date(task.last_run).toISOString() : null,
    }));
    
    return NextResponse.json({ tasks, count: tasks.length });
  } catch (err) {
    console.error('Database error:', err);
    // Return sample tasks if DB not available
    return NextResponse.json({ 
      tasks: [
        { id: 1, name: 'Agent Health Check', schedule: '*/5 * * * *', next_run: new Date(Date.now() + 300000).toISOString(), last_run: new Date().toISOString(), status: 'active', description: 'Monitor all agents', category: 'system' },
        { id: 2, name: 'Activity Feed Update', schedule: '*/30 * * * *', next_run: new Date(Date.now() + 1800000).toISOString(), last_run: new Date().toISOString(), status: 'active', description: 'Refresh activity feed', category: 'maintenance' },
        { id: 3, name: 'NexAgua Email Campaign', schedule: '0 9 * * *', next_run: new Date(Date.now() + 86400000).toISOString(), last_run: new Date(Date.now() - 86400000).toISOString(), status: 'active', description: 'Send daily emails', category: 'nexagua' }
      ], 
      count: 3,
      source: 'sample'
    });
  }
}
