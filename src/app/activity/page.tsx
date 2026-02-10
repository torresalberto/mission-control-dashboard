"use client"

import { useState, useEffect } from 'react'

interface OpenClawSession {
  sessionKey: string
  model: string
  status: 'running' | 'completed' | 'error'
  task: string
  startTime: string
  endTime?: string
  runtime?: number
  lastMessage?: string
  error?: string
}

interface DirectorStatus {
  operation: string
  lastUpdate: string
  activeAgents: number
  completedAgents: number
  totalAgents: number
}

interface LiveActivityResponse {
  director: DirectorStatus
  agents: OpenClawSession[]
  timestamp: string
  source: 'openclaw-gateway' | 'mock-gateway'
}

export default function ActivityPage() {
  const [data, setData] = useState<LiveActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('Never')

  async function fetchLiveActivity() {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch from live endpoint
      const response = await fetch('/api/activity/live?v=' + Date.now())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const liveData: LiveActivityResponse = await response.json()
      setData(liveData)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Failed to fetch live activity:', err)
      setError('Unable to connect to OpenClaw Gateway')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveActivity()
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchLiveActivity, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-4">Connecting to OpenClaw Gateway...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button 
            onClick={fetchLiveActivity}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const agents = data?.agents || []
  const runningAgents = agents.filter(a => a.status === 'running')
  const completedAgents = agents.filter(a => a.status === 'completed')
  const errorAgents = agents.filter(a => a.status === 'error')

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🔴 Live Activity Monitor
          {data?.source === 'openclaw-gateway' && (
            <span className="text-sm bg-green-600 px-2 py-1 rounded">LIVE</span>
          )}
          {data?.source === 'mock-gateway' && (
            <span className="text-sm bg-yellow-600 px-2 py-1 rounded">OFFLINE</span>
          )}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Last update: {lastUpdate} | Auto-refresh every 5s
        </p>
      </div>

      {/* Director Status */}
      {data?.director && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                🎯 Director
              </h2>
              <p className="text-gray-300 mt-1">{data.director.operation}</p>
              <p className="text-xs text-gray-500 mt-1">
                Updated: {new Date(data.director.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-400">{data.director.activeAgents}</p>
              <p className="text-xs text-gray-400">active</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-yellow-400">
              ⚡ {data.director.totalAgents} total
            </span>
            <span className="text-green-400">
              ✅ {data.director.completedAgents} completed
            </span>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🤖 Agents ({agents.length})
      </h2>
      
      {agents.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-500">
          No active agents. Waiting for Director to spawn...
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.sessionKey} agent={agent} />
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 flex gap-4 text-sm">
        <div className="bg-green-900/30 px-4 py-2 rounded border border-green-700">
          <span className="text-green-400 font-bold">{completedAgents.length}</span> completed
        </div>
        <div className="bg-yellow-900/30 px-4 py-2 rounded border border-yellow-700">
          <span className="text-yellow-400 font-bold">{runningAgents.length}</span> running
        </div>
        {errorAgents.length > 0 && (
          <div className="bg-red-900/30 px-4 py-2 rounded border border-red-700">
            <span className="text-red-400 font-bold">{errorAgents.length}</span> failed
          </div>
        )}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: OpenClawSession }) {
  const statusColors = {
    running: 'border-blue-600 bg-blue-900/20',
    completed: 'border-green-600 bg-green-900/20',
    error: 'border-red-600 bg-red-900/20'
  }

  const statusText = {
    running: '🔄 RUNNING',
    completed: '✅ COMPLETED',
    error: '❌ ERROR'
  }

  const runtime = agent.runtime 
    ? `${Math.floor(agent.runtime / 60)}m ${agent.runtime % 60}s`
    : 'Unknown'

  return (
    <div className={`border rounded-lg p-4 ${statusColors[agent.status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-mono font-bold text-gray-300">
              {agent.sessionKey.split('-').slice(-1)[0]}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${statusColors[agent.status]}`}>
              {statusText[agent.status]}
            </span>
          </div>
          <p className="text-gray-300 font-medium">{agent.task}</p>
          <p className="text-sm text-gray-500 mt-1">{agent.model}</p>
          <div className="flex gap-4 text-xs text-gray-400 mt-2">
            <span>⏱️ {runtime}</span>
            <span>🕐 {new Date(agent.startTime).toLocaleTimeString()}</span>
          </div>
          {agent.lastMessage && (
            <p className="text-sm text-gray-400 mt-2 bg-black/20 p-2 rounded">
              {agent.lastMessage}
            </p>
          )}
          {agent.error && (
            <p className="text-sm text-red-400 mt-2 bg-red-900/20 p-2 rounded">
              Error: {agent.error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
