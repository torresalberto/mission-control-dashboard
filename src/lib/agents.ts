// Agent status tracking for Mission Control
export interface AgentStatus {
  id: string;
  name: string;
  model: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentTask?: string;
  lastAction: string;
  lastOutput: string;
  runtime: number;
  lastUpdate: string;
}

// Simulated agent registry - updated to current status
// TODO: Replace with real session monitoring API
export const AGENT_REGISTRY: AgentStatus[] = [
  {
    id: 'kimi-director',
    name: 'Kimi-Director',
    model: 'nvidia/kimi-k2.5',
    status: 'busy',
    currentTask: 'Mission Control optimization',
    lastAction: 'Pushed commit 0bb18ce',
    lastOutput: '6 optimizations + MiniCPM project added',
    runtime: 3600,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'k2.5-think',
    name: 'K2.5-Think',
    model: 'nvidia-kimi3/kimi-k2.5',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Build fixed - deferred DB loading',
    lastOutput: 'SQLite working on Vercel (runtime init)',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'think-nv',
    name: 'Think-NV',
    model: 'nvidia/kimi-k2-thinking',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Build fixed - mock DB during build',
    lastOutput: 'TypeScript generic issues resolved',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'kimi-instruct',
    name: 'Kimi-Instruct',
    model: 'nvidia-kimi2/kimi-k2-instruct',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'UI components verified',
    lastOutput: 'Seed button working on Vercel',
    runtime: 1200,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'instruct-0905',
    name: 'Instruct-0905',
    model: 'nvidia-kimi2/kimi-k2-instruct-0905',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'QA verification complete',
    lastOutput: 'No runtime errors detected',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  }
];

export function getAgentStatus(): AgentStatus[] {
  return AGENT_REGISTRY.sort((a, b) => {
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
