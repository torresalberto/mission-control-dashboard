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

// Complete agent registry with all 8 agents from AGENT_ROLES_V2.md
export const AGENT_REGISTRY: AgentStatus[] = [
  {
    id: 'kimi-director',
    name: 'Kimi-Director',
    model: 'nvidia/kimi-k2.5',
    status: 'busy',
    currentTask: 'Mission control operations',
    lastAction: 'Deployed fixes to Vercel',
    lastOutput: 'Build successful with 8 agents',
    runtime: 7200,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'k2.5-think',
    name: 'K2.5-Think',
    model: 'nvidia-kimi3/kimi-k2.5',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Completed architectural analysis',
    lastOutput: 'Database schema optimized',
    runtime: 1800,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'think-nv',
    name: 'Think-NV',
    model: 'nvidia/kimi-k2-thinking',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Database optimization complete',
    lastOutput: 'SQL queries optimized for performance',
    runtime: 1200,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'kimi-instruct',
    name: 'Kimi-Instruct',
    model: 'nvidia-kimi2/kimi-k2-instruct',
    status: 'busy',
    currentTask: 'UI enhancements in progress',
    lastAction: 'Updated component styling',
    lastOutput: 'Responsive design implemented',
    runtime: 2400,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'instruct-0905',
    name: 'Instruct-0905',
    model: 'nvidia-kimi2/kimi-k2-instruct-0905',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Code review completed',
    lastOutput: 'Linting and type checking passed',
    runtime: 300,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'kimi-think-cloud',
    name: 'Kimi-Think-Cloud (Ollama)',
    model: 'ollama/phi3.5',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Local model initialized',
    lastOutput: 'Offline processing ready',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'minimax-m2.1',
    name: 'MiniMax M2.1',
    model: 'minimax/mms-m2.1',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Connected to cloud inference',
    lastOutput: 'Multi-modal capabilities enabled',
    runtime: 0,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 (fallback)',
    model: 'deepseek/deepseek-reasoner',
    status: 'offline',
    currentTask: undefined,
    lastAction: 'Rate limit management',
    lastOutput: 'Ready for high-complexity tasks',
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
