// Agent status tracking for Mission Control
export interface AgentStatus {
  id: string;
  name: string;
  model: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentTask?: string;
  lastAction: string;
  lastOutput: string;
  runtime: number; // seconds
  lastUpdate: string;
}

// Simulated agent registry - in production this reads from session state
export const AGENT_REGISTRY: AgentStatus[] = [
  {
    id: 'kimi-director',
    name: 'Kimi-Director',
    model: 'nvidia/kimi-k2.5',
    status: 'busy',
    currentTask: 'Mission Control testing',
    lastAction: 'Spawned sub-agent e0e21d05',
    lastOutput: 'Family ops paused, archiving data...',
    runtime: 840,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'k2.5-think',
    name: 'K2.5-Think', 
    model: 'nvidia-kimi3/kimi-k2.5',
    status: 'error',
    currentTask: 'Mission Control build',
    lastAction: 'Build failed - TypeScript errors',
    lastOutput: 'SQLITE_CANTOPEN during static generation',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'think-nv',
    name: 'Think-NV',
    model: 'nvidia/kimi-k2-thinking',
    status: 'error',
    currentTask: 'Database init fix',
    lastAction: 'Seed script isolation failed',
    lastOutput: 'Build process keeps opening DB at build time',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'kimi-instruct',
    name: 'Kimi-Instruct',
    model: 'nvidia-kimi2/kimi-k2-instruct',
    status: 'busy',
    currentTask: 'mission-control-delivery',
    lastAction: 'Testing dashboard buttons',
    lastOutput: 'GET /api/projects returned 5 projects',
    runtime: 1080,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'instruct-0905',
    name: 'Instruct-0905',
    model: 'nvidia-kimi2/kimi-k2-instruct-0905',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Available for review/fallback',
    lastOutput: 'Idle - awaiting assignment',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  }
];

export function getAgentStatus(): AgentStatus[] {
  return AGENT_REGISTRY.sort((a, b) => {
    // Sort by status: busy first, then error, then idle
    const statusOrder = { busy: 0, error: 1, idle: 2, offline: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export function updateAgentStatus(id: string, updates: Partial<AgentStatus>): void {
  const agent = AGENT_REGISTRY.find(a => a.id === id);
  if (agent) {
    Object.assign(agent, updates, { lastUpdate: new Date().toISOString() });
  }
}

export function formatRuntime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
