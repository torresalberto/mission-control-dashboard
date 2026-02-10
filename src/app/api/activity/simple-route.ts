import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read static activity.json file
    const activityPath = path.join(process.cwd(), 'public', 'activity.json');
    
    try {
      const data = await fs.readFile(activityPath, 'utf8');
      const activity = JSON.parse(data);
      
      return NextResponse.json({
        ...activity,
        source: 'static-file',
        cached: true,
        endpoint: '/activity.json'
      });
    } catch (fileError) {
      // If static file doesn't exist, return embedded sample
      const sampleData = {
        timestamp: new Date().toISOString(),
        activities: [
          {
            id: 'sample_director_1',
            type: 'director',
            agent: 'Director',
            action: 'Task Decomposition',
            description: 'Breaking complex request into atomic sub-tasks',
            status: 'completed',
            timestamp: new Date(Date.now() - 2*60*1000).toISOString(),
            display_time: '22:28',
            duration: '3s'
          },
          {
            id: 'sample_agent_1',
            type: 'agent',
            agent: 'K2.5-Think',
            action: 'Strategy Analysis',
            description: 'Analyzing requirements and producing insights',
            status: 'completed',
            timestamp: new Date(Date.now() - 4*60*1000).toISOString(),
            display_time: '22:26',
            duration: '2m 15s'
          },
          {
            id: 'sample_agent_2',
            type: 'agent',
            agent: 'Kimi-Instruct',
            action: 'Code Generation',
            description: 'Building implementation based on analysis',
            status: 'running',
            timestamp: new Date(Date.now() - 1*60*1000).toISOString(),
            display_time: '22:29',
            duration: '45s'
          },
          {
            id: 'sample_director_2',
            type: 'director',
            agent: 'Director',
            action: 'Result Consolidation',
            description: 'Merging outputs from 3 completed agents',
            status: 'completed',
            timestamp: new Date().toISOString(),
            display_time: '22:30',
            duration: '5s'
          }
        ],
        summary: {
          director_actions: 2,
          agent_actions: 2,
          total_duration: '3m 8s',
          last_update: new Date().toLocaleTimeString()
        }
      };
      
      return NextResponse.json({
        ...sampleData,
        source: 'embedded',
        cached: false,
        error: 'Static file not found, using fallback'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to load activities',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'failure'
      },
      { status: 500 }
    );
  }
}