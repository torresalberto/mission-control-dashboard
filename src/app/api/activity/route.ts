import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(): Promise<NextResponse> {
  const db = getDb();
  
  try {
    const activities = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT id, action, details, timestamp FROM activity_logs ORDER BY timestamp DESC LIMIT 50`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
    
    return NextResponse.json({ activities, count: activities.length });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
