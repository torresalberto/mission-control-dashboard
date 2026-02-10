'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Cpu } from 'lucide-react';
import { AgentStatus, formatRuntime } from '@/lib/agents';

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  async function fetchAgents() {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  function getStatusIcon(status: string) {
    switch (status) {
      case 'busy':
        return <Activity className="w-5 h-5 text-[#FF6B35] animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'idle':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'busy':
        return 'bg-[#FF6B35]/10 border-[#FF6B35]/30';
      case 'error':
        return 'bg-red-900/20 border-red-500/30';
      case 'idle':
        return 'bg-green-900/20 border-green-500/30';
      default:
        return 'bg-gray-800/50 border-gray-700';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#FF6B35]" />
            Agent Status Grid
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time monitoring of all 5 agents • Updated {lastUpdate}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
            Busy: {agents.filter(a => a.status === 'busy').length}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Idle: {agents.filter(a => a.status === 'idle').length}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Error: {agents.filter(a => a.status === 'error').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`p-4 rounded-lg border ${getStatusColor(agent.status)} transition-colors`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(agent.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#0A2540] text-gray-300 border border-gray-700">
                      {agent.model}
                    </span>
                  </div>
                  {agent.currentTask && (
                    <p className="text-[#FF6B35] text-sm mt-1">→ {agent.currentTask}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-2">{agent.lastAction}</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">
                    {agent.lastOutput}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRuntime(agent.runtime)}
                </div>
                <p className="text-xs mt-1">{new Date(agent.lastUpdate).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-[#0A2540] rounded-lg border border-gray-700">
        <h3 className="font-semibold text-white mb-2">Guardian Alert Thresholds</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Agent busy &gt;15 min without announce → alert ready</li>
          <li>• Agent error state → immediate escalation</li>
          <li>• All agents idle &gt;30 min → system health check</li>
        </ul>
      </div>
    </div>
  );
}
