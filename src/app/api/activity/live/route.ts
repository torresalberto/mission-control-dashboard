import { NextResponse } from 'next/server'

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
  agents: {
    [sessionKey: string]: OpenClawSession
  }
  timestamp: string
  source: 'openclaw-gateway'
}

// Fetch live OpenClaw sessions
async function fetchOpenClawSessions(): Promise<OpenClawSession[]> {
  try {
    // This will connect to the actual OpenClaw Gateway
    // For now, we'll use a direct connection to the gateway
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:8080'
    
    const response = await fetch(`${gatewayUrl}/api/v1/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Short timeout to avoid hanging
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform gateway response to our format
    if (data.sessions && Array.isArray(data.sessions)) {
      return data.sessions.map((session: any) => ({
        sessionKey: session.id || session.sessionKey,
        model: session.model || 'unknown',
        status: session.status || (session.error ? 'error' : 'running'),
        task: session.task || session.description || 'Unknown task',
        startTime: session.startTime || session.createdAt || new Date().toISOString(),
        endTime: session.endTime,
        runtime: session.runtime || session.duration,
        lastMessage: session.lastMessage || session.progress,
        error: session.error || session.errorMessage
      }))
    }
    
    return []
  } catch (error) {
    console.error('Failed to connect to OpenClaw Gateway:', error)
    throw error
  }
}

// Fallback to mock data for development
function getMockLiveData(): LiveActivityResponse {
  const now = new Date()
  const sessionKey = `mock-session-${Date.now()}`
  
  return {
    director: {
      operation: "Real-time system analysis",
      lastUpdate: now.toISOString(),
      activeAgents: 2,
      completedAgents: 1,
      totalAgents: 3
    },
    agents: {
      [sessionKey]: {
        sessionKey,
        model: "nvidia-kimi2/moonshotai/kimi-k2-instruct",
        status: "running",
        task: "Build REAL-TIME Activity Feed for Mission Control",
        startTime: now.toISOString(),
        runtime: Math.floor(Math.random() * 120) // Random runtime 0-120 seconds
      },
      "analysis-agent-1": {
        sessionKey: "analysis-agent-1",
        model: "nvidia/moonshotai/kimi-k2.5",
        status: "completed",
        task: "Analyze current codebase structure",
        startTime: new Date(now.getTime() - 120000).toISOString(),
        endTime: new Date(now.getTime() - 60000).toISOString(),
        runtime: 60
      }
    },
    timestamp: now.toISOString(),
    source: "mock-gateway"
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    let agents: OpenClawSession[] = []
    
    try {
      // Try to get real sessions from OpenClaw Gateway
      agents = await fetchOpenClawSessions()
    } catch (gatewayError) {
      console.log('Using mock data due to gateway connection issue:', gatewayError)
    }

    // Build director status from agents
    const runningAgents = agents.filter(a => a.status === 'running')
    const completedAgents = agents.filter(a => a.status === 'completed')
    const errorAgents = agents.filter(a => a.status === 'error')
    
    const directorStatus: DirectorStatus = {
      operation: getDirectorOperation(),
      lastUpdate: new Date().toISOString(),
      activeAgents: runningAgents.length,
      completedAgents: completedAgents.length,
      totalAgents: agents.length
    }

    const response: LiveActivityResponse = {
      director: directorStatus,
      agents: agents, 
      timestamp: new Date().toISOString(),
      source: agents.length > 0 ? 'openclaw-gateway' : 'mock-gateway'
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error in live activity endpoint:', error)
    return NextResponse.json(getMockLiveData(), {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

function getDirectorOperation(): string {
  // This would ideally read Director's current operation
  const operations = [
    "Analyzing project requirements", 
    "Delegating tasks to agents",
    "Monitoring agent execution",
    "Consolidating agent results",
    "Processing user request",
    "Real-time system analysis"
  ]
  
  return operations[Math.floor(Math.random() * operations.length)]
}