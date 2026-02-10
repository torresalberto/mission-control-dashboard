import { NextResponse } from 'next/server'

// REAL OpenClaw Gateway integration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://gordon-objective-mailto-reviews.trycloudflare.com'

interface OpenClawSession {
  key: string
  kind: string
  displayName: string
  model: string
  status: 'running' | 'completed' | 'error' | 'idle'
  task?: string
  lastUpdate: number
  contextTokens: number
  totalTokens: number
  label?: string
}

interface AgentStatus {
  id: string
  name: string
  model: string
  status: 'running' | 'completed' | 'error' | 'idle'
  task: string
  startTime: string
  runtime?: string
  tokens: number
  label?: string
  channel?: string
}

interface DirectorStatus {
  operation: string
  lastUpdate: string
  activeAgents: number
  completedAgents: number
  idleAgents: number
  errorAgents: number
  totalAgents: number
}

interface RealActivityResponse {
  director: DirectorStatus
  agents: AgentStatus[]
  timestamp: string
  source: 'openclaw-live'
  rateLimited: boolean
  nvidiaKeysDown: number
}

// Fetch real sessions from OpenClaw Gateway
async function fetchRealSessions(): Promise<OpenClawSession[]> {
  try {
    console.log('Fetching from:', `${GATEWAY_URL}/api/v1/sessions`)
    
    const response = await fetch(`${GATEWAY_URL}/api/v1/sessions?activeMinutes=120&format=api`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    if (!response.ok) {
      throw new Error(`Gateway HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Gateway response:', data)
    
    return data.sessions || []
  } catch (error) {
    console.error('Gateway fetch failed:', error)
    return []
  }
}

// Check NVIDIA rate limits
async function checkNvidiaStatus(): Promise<{ rateLimited: boolean, keysDown: number }> {
  try {
    // Try to get health status from gateway
    const response = await fetch(`${GATEWAY_URL}/api/v1/health`, {
      cache: 'no-store'
    })
    
    if (!response.ok) return { rateLimited: true, keysDown: 4 }
    
    const health = await response.json()
    return {
      rateLimited: health.nvidia?.rateLimited || false,
      keysDown: health.nvidia?.keysDown || 0
    }
  } catch {
    return { rateLimited: true, keysDown: 4 }
  }
}

// Transform session to agent status
function transformSession(session: OpenClawSession): AgentStatus {
  const now = Date.now()
  const lastUpdateMs = now - session.lastUpdate
  const minutesAgo = Math.floor(lastUpdateMs / 60000)
  
  let status: 'running' | 'completed' | 'error' | 'idle' = 'idle'
  
  if (session.key.includes('main')) {
    status = 'running' // Director is always running
  } else if (lastUpdateMs < 300000) {
    status = 'running' // Active in last 5 min
  } else if (lastUpdateMs < 600000) {
    status = 'completed' // Finished in last 10 min
  } else {
    status = 'idle'
  }
  
  // Format runtime
  const hours = Math.floor(minutesAgo / 60)
  const mins = minutesAgo % 60
  const runtime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  
  // Extract agent name from model
  const modelName = session.model || 'unknown'
  const agentName = modelName.includes('kimi-k2.5') ? 'Kimi-K2.5-Think' :
                   modelName.includes('kimi-k2-thinking') ? 'Kimi-Think-NV' :
                   modelName.includes('kimi-k2-instruct') ? 'Kimi-Instruct' :
                   modelName.includes('minimax') ? 'MiniMax-M2.1' :
                   'Unknown'
  
  return {
    id: session.key,
    name: session.label || agentName,
    model: modelName,
    status,
    task: session.label ? session.label.replace(/-/g, ' ').toUpperCase() : 'Active session',
    startTime: new Date(session.lastUpdate - (session.totalTokens * 100)).toISOString(),
    runtime: runtime === '0m' ? 'Just started' : runtime,
    tokens: session.totalTokens || 0,
    label: session.label,
    channel: session.kind
  }
}

// Get Director operation from main session
function getDirectorOperation(sessions: OpenClawSession[]): string {
  const mainSession = sessions.find(s => s.key.includes('main') && !s.key.includes('subagent'))
  if (!mainSession) return 'Monitoring agent activity'
  
  // Extract from session context
  const tokens = mainSession.totalTokens || 0
  if (tokens > 50000) return 'Coordinating multi-agent workflow'
  if (tokens > 20000) return 'Delegating tasks to sub-agents'
  if (tokens > 5000) return 'Analyzing project requirements'
  return 'Processing user requests'
}

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now()
  console.log('Real activity endpoint called at', new Date().toISOString())
  
  try {
    // Fetch real sessions
    const sessions = await fetchRealSessions()
    console.log('Found', sessions.length, 'sessions')
    
    // Check NVIDIA status
    const nvidiaStatus = await checkNvidiaStatus()
    
    // Transform to agent statuses
    const agents = sessions.map(transformSession)
    
    // Calculate summary
    const running = agents.filter(a => a.status === 'running')
    const completed = agents.filter(a => a.status === 'completed')
    const idle = agents.filter(a => a.status === 'idle')
    const errors = agents.filter(a => a.status === 'error')
    
    // Build director status
    const director: DirectorStatus = {
      operation: getDirectorOperation(sessions),
      lastUpdate: new Date().toISOString(),
      activeAgents: running.length,
      completedAgents: completed.length,
      idleAgents: idle.length,
      errorAgents: errors.length,
      totalAgents: agents.length
    }
    
    // Check if this is fallback
    const isRealData = sessions.length > 0
    
    const response: RealActivityResponse = {
      director,
      agents,
      timestamp: new Date().toISOString(),
      source: isRealData ? 'openclaw-live' : 'openclaw-live-empty',
      rateLimited: nvidiaStatus.rateLimited,
      nvidiaKeysDown: nvidiaStatus.keysDown
    }
    
    console.log('Response ready:', response.director.operation, '| Agents:', agents.length)
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Real activity endpoint error:', error)
    
    // Return error state with empty data
    return NextResponse.json({
      director: {
        operation: 'Error: Gateway unreachable',
        lastUpdate: new Date().toISOString(),
        activeAgents: 0,
        completedAgents: 0,
        idleAgents: 0,
        errorAgents: 0,
        totalAgents: 0
      },
      agents: [],
      timestamp: new Date().toISOString(),
      source: 'openclaw-error',
      rateLimited: true,
      nvidiaKeysDown: 4,
      error: String(error)
    })
  }
}

// Enable dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0
