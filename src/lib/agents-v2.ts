/**
 * Agent Monitoring V2 — Progress-Precise System
 * Updated: 2026-02-09
 * 
 * Philosophy:
 * - Report completion, not noise
 * - Visualize exact progress
 * - Identify stalls with specific location
 * - Track all 8 brains (5 NVIDIA + Ollama + MiniMax + DeepSeek)
 */

export interface TaskProgress {
  taskId: string;
  name: string;
  agentId: string;
  startedAt: Date;
  updatedAt: Date;
  progress: number; // 0-100, exact percentage
  completed: string[]; // Milestones achieved
  inProgress: string | null; // Current step
  blocked: boolean;
  stallLocation?: string; // File:line if stalled
  stallReason?: string; // Specific error
  recoveryAction?: string; // Command to fix
  etaMinutes?: number | null;
}

export interface AgentStatusV2 {
  id: string;
  name: string;
  model: string;
  key: 'Key1' | 'Key2' | 'Key3' | 'Ollama' | 'OAuth' | 'OpenRouter';
  status: 'online' | 'busy' | 'error' | 'idle' | 'stalled' | 'offline';
  currentTask?: TaskProgress;
  lastAction: string;
  lastOutput?: string;
  runtime: number; // seconds
  lastUpdate: Date;
  reportsToMonitor: boolean;
}

// The 8 Brain Fleet
export const AGENT_REGISTRY_V2: AgentStatusV2[] = [
  {
    id: 'kimi-director',
    name: 'Kimi-Director',
    model: 'nvidia/moonshotai/kimi-k2.5',
    key: 'Key1',
    status: 'online',
    currentTask: undefined,
    lastAction: 'User chat active',
    lastOutput: 'Awaiting instruction',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'kimi-k2.5-think',
    name: 'Kimi-K2.5-Think',
    model: 'nvidia-kimi3/moonshotai/kimi-k2.5',
    key: 'Key3',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'No active task',
    lastOutput: 'Ready for deep analysis',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'kimi-think-nv',
    name: 'Kimi-Think-NV',
    model: 'nvidia/moonshotai/kimi-k2-thinking',
    key: 'Key1',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'No active task',
    lastOutput: 'Ready for architecture',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'kimi-instruct',
    name: 'Kimi-Instruct',
    model: 'nvidia-kimi2/moonshotai/kimi-k2-instruct',
    key: 'Key2',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'No active task',
    lastOutput: 'Ready for execution',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'kimi-instruct-0905',
    name: 'Kimi-Instruct-0905',
    model: 'nvidia-kimi2/moonshotai/kimi-k2-instruct-0905',
    key: 'Key2',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'No active task',
    lastOutput: 'Ready for parallel execution',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'kimi-think-cloud',
    name: 'Kimi-Think-Cloud (Ollama)',
    model: 'ollama/kimi-k2-thinking:cloud',
    key: 'Ollama',
    status: 'idle',
    currentTask: undefined,
    lastAction: 'Weekly limited',
    lastOutput: 'Fallback when NVIDIA exhausted',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'agent-monitor',
    name: 'Agent-Monitor (MiniMax)',
    model: 'minimax-portal/MiniMax-M2.1',
    key: 'OAuth',
    status: 'online',
    currentTask: undefined,
    lastAction: 'Continuous surveillance',
    lastOutput: 'Monitoring 7 agents',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1 (Dormant)',
    model: 'openrouter/deepseek/deepseek-r1:free',
    key: 'OpenRouter',
    status: 'offline',
    currentTask: undefined,
    lastAction: 'Rate limited (shared IP)',
    lastOutput: 'Unavailable — needs IP cooldown',
    runtime: 0,
    lastUpdate: new Date(),
    reportsToMonitor: true
  }
];

// Progress tracking functions
export function updateTaskProgress(
  agentId: string,
  progress: number,
  completed?: string[],
  inProgress?: string | null,
  blocked?: boolean,
  stallLocation?: string,
  stallReason?: string,
  recoveryAction?: string
): void {
  const agent = AGENT_REGISTRY_V2.find(a => a.id === agentId);
  if (!agent) return;
  
  agent.currentTask = {
    taskId: agent.currentTask?.taskId || crypto.randomUUID(),
    name: agent.currentTask?.name || 'Unknown task',
    agentId,
    startedAt: agent.currentTask?.startedAt || new Date(),
    updatedAt: new Date(),
    progress: Math.min(100, Math.max(0, progress)),
    completed: completed || agent.currentTask?.completed || [],
    inProgress: inProgress !== undefined ? inProgress : agent.currentTask?.inProgress,
    blocked: blocked || false,
    stallLocation,
    stallReason,
    recoveryAction,
    etaMinutes: blocked ? null : Math.ceil((100 - progress) * 0.5)
  };
  
  agent.status = blocked ? 'stalled' : agent.status;
  agent.lastUpdate = new Date();
}

export function getAgentProgressReport(agentId: string): TaskProgress | null {
  const agent = AGENT_REGISTRY_V2.find(a => a.id === agentId);
  return agent?.currentTask || null;
}

export function formatStallReport(task: TaskProgress): string {
  if (!task.blocked) return '';
  
  return `STALLED: ${task.name}
Location: ${task.stallLocation || 'unknown'}
Reason: ${task.stallReason || 'No error reported'}
Fix: ${task.recoveryAction || 'Manual intervention required'}`;
}

export function getActiveBrains(): AgentStatusV2[] {
  return AGENT_REGISTRY_V2.filter(a => ['online', 'busy'].includes(a.status));
}

export function getStalledAgents(): AgentStatusV2[] {
  return AGENT_REGISTRY_V2.filter(a => a.status === 'stalled' || a.status === 'error');
}
