import { NextResponse } from 'next/server';
import { getAgentStatus } from '@/lib/agents';

export async function GET(): Promise<NextResponse> {
  try {
    const agents = getAgentStatus();
    return NextResponse.json({ agents, count: agents.length });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
