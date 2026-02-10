import { NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';

// Sample activities showing Director + Agent workflow
function getSampleActivities() {
  const now = new Date();
  return [
    {
      id: 'director_init',
      action: 'Director initiated',
      details: 'Analyzing project request: "Email marketing for NexAgua"',
      timestamp: new Date(now.getTime() - 3600000).toISOString()
    },
    {
      id: 'director_delegate',
      action: 'Director delegating',
      details: 'Assigned to 3 agents: K2.5-Think (analysis), Kimi-Instruct (execution), Instruct-0905 (review)',
      timestamp: new Date(now.getTime() - 3540000).toISOString()
    },
    {
      id: 'agent_start_1',
      action: 'K2.5-Think started',
      details: 'Task: Analyze email strategy and provide recommendations',
      timestamp: new Date(now.getTime() - 3540000).toISOString()
    },
    {
      id: 'agent_start_2',
      action: 'Kimi-Instruct started',
      details: 'Task: Build email drip campaign with templates',
      timestamp: new Date(now.getTime() - 3530000).toISOString()
    },
    {
      id: 'agent_complete_1',
      action: 'Instruct-0905 completed',
      details: 'Reviewed 3 email templates in 2m 15s — validated OK',
      timestamp: new Date(now.getTime() - 3420000).toISOString()
    },
    {
      id: 'agent_complete_2',
      action: 'Kimi-Instruct completed',
      details: 'Built 6-email drip sequence in 4m 30s — sequences ready',
      timestamp: new Date(now.getTime() - 3380000).toISOString()
    },
    {
      id: 'director_complete',
      action: 'Director completed',
      details: 'All agents finished — delivering consolidated NexAgua email strategy',
      timestamp: new Date(now.getTime() - 2900000).toISOString()
    });
}

export async function GET(): Promise<NextResponse> {
  try {
    const db = await getDb();
    
    // Try to get real activities
    let activities: any[] = [];
    try {
      activities = await db.all(
        `SELECT id, action, details, timestamp FROM activity_logs ORDER BY timestamp DESC LIMIT 50`
      );
    } catch (e) {
      console.log('Using sample activities:', e);
    }
    
    // If no real activities or DB error, return samples
    if (!activities || activities.length === 0) {
      activities = getSampleActivities();
      return NextResponse.json({ 
        activities, 
        count: activities.length,
        source: 'sample'
      });
    }

    return NextResponse.json({ 
      activities, 
      count: activities.length,
      source: 'database'
    });
  } catch (error) {
    console.error('Database error:', error);
    // Return sample data on error
    const activities = getSampleActivities();
    return NextResponse.json({ 
      activities,
      count: activities.length,
      source: 'sample',
      error: 'Database error, showing sample data'
    });
  }
}
