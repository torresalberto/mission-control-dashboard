import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Simple static file reading - works on Vercel
    const activityPath = path.join(process.cwd(), 'public', 'activity.json');
    
    try {
      const data = await fs.readFile(activityPath, 'utf8');
      const jsonData = JSON.parse(data);
      
      return NextResponse.json({
        ...jsonData,
        source: 'static',
        endpoint: '/activity.json',
        refreshInterval: 10000
      });
    } catch (fileNotFound) {
      // Return embedded simple data for development
      const fallback = {
        timestamp: new Date().toISOString(),
        activities: [
          {
            id: 'live_director_' + Date.now(),
            type: 'director',
            agent: 'Director',
            action: 'System Monitoring',
            description: 'Direct orchestration of mission control agents',
            status: 'completed',
            timestamp: new Date().toISOString(),
            display_time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', minute: '2-digit', hour12: false 
            }),
            duration: 'instant'
          },
          {
            id: 'live_agent_' + Date.now(),
            type: 'agent',
            agent: 'MiniMax M2.1',
            action: 'Activity Feed Generation',
            description: 'Creating working activity feed for Director visibility',
            status: 'completed',
            timestamp: new Date(Date.now() - 120000).toISOString(),
            display_time: '22:27',
            duration: '30s'
          }
        ],
        summary: {
          director_actions: 1,
          agent_actions: 1,
          total_duration: '30s',
          last_update: new Date().toLocaleTimeString()
        }
      };
      
      return NextResponse.json({
        ...fallback,
        source: 'fallback',
        cached: false
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load activities',
        message: error instanceof Error ? error.message : 'Unknown error',
        activities: []
      },
      { status: 500 }
    );
  }
}