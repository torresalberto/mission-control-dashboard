import { NextResponse } from 'next/server';
import { getAgentStatus } from '@/lib/agents';

export async function GET(): Promise<NextResponse> {
  try {
    const agents = getAgentStatus();
    return NextResponse.json({ agents, count: agents.length });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    // Return static fallback during build
    return NextResponse.json({ 
      agents: [], 
      count: 0,
      error: error.message || 'Failed to fetch agents'
    });
  }
}
