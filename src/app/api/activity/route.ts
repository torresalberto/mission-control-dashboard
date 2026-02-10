import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Sample activities for when no real activity exists
function getSampleActivities() {
  return [
    {
      id: 'director_init_1',
      action: 'Director initiated',
      details: 'Analyzing project request: "Email marketing for NexAgua"',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'director_delegate_1',
      action: 'Director delegating',
      details: 'Assigned to 3 agents: K2.5-Think (analysis), Kimi-Instruct (execution), Instruct-0905 (review)',
      timestamp: new Date(Date.now() - 3540000).toISOString()
    },
    {
      id: 'agent_start_k25',
      action: 'K2.5-Think started',
      details: 'Task: Analyze email strategy and provide recommendations',
      timestamp: new Date(Date.now() - 3540000).toISOString()
    },
    {
      id: 'agent_start_kimi',
      action: 'Kimi-Instruct started',
      details: 'Task: Build email drip campaign with templates',
      timestamp: new Date(Date.now() - 3530000).toISOString()
    },
    {
      id: 'agent_start_instruct',
      action: 'Instruct-0905 started',
      details: 'Task: Review and validate email copy',
      timestamp: new Date(Date.now() - 3520000).toISOString()
    },
    {
      id: 'agent_complete_instruct',
      action: 'Instruct-0905 completed',
      details: 'Reviewed 3 email templates in 2m 15s — validated OK',
      timestamp: new Date(Date.now() - 3420000).toISOString()
    },
    {
      id: 'agent_complete_kimi',
      action: 'Kimi-Instruct completed',
      details: 'Built 6-email drip sequence in 4m 30s — sequences ready for deployment',
      timestamp: new Date(Date.now() - 3380000).toISOString()
    },
    {
      id: 'agent_running_k25',
      action: 'K2.5-Think running',
      details: 'Deep analysis in progress... analyzing competitor strategies',
      timestamp: new Date(Date.now() - 3280000).toISOString()
    },
    {
      id: 'director_consolidating',
      action: 'Director consolidating',
      details: 'Gathering results from completed agents for final output',
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: 'agent_complete_k25',
      action: 'K2.5-Think completed',
      details: 'Analysis complete in 15m 45s — provided 8 strategic recommendations',
      timestamp: new Date(Date.now() - 2940000).toISOString()
    },
    {
      id: 'director_complete_1',
      action: 'Director completed',
      details: 'All agents finished — delivering consolidated NexAgua email strategy',
      timestamp: new Date(Date.now() - 2900000).toISOString()
    },
    {
      id: 'activity_summary_1',
      action: 'Activity summary',
      details: '4 tasks processed | 3 agents utilized | Total runtime: 16m 30s',
      timestamp: new Date(Date.now() - 2900000).toISOString()
    },
    {
      id: 'director_init_2',
      action: 'Director monitoring',
      details: 'Proactive check: Scanning for idle agents',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'agent_idle_1',
      action: 'Agent idle detected',
      details: 'Think-NV idle for 45m — queued for new task',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'director_assign_idle',
      action: 'Director auto-assigned',
      details: 'Think-NV → Task: Review Mission Control optimization suggestions',
      timestamp: new Date(Date.now() - 1790000).toISOString()
    },
    {
      id: 'agent_start_thinknv',
      action: 'Think-NV started',
      details: 'Task: Review optimization suggestions (confidence 85%+)',
      timestamp: new Date(Date.now() - 1790000).toISOString()
    },
    {
      id: 'task_queue_1',
      action: 'System update',
      details: 'Task #142 queued → "Analyze competitor pricing" → Pending agent',
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: 'task_approve_1',
      action: 'Suggestion approved',
      details: 'User approved: "Add WebSocket real-time updates" → Allocating agent',
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'agent_spawn_mini',
      action: 'MiniMax M2.1 spawned',
      details: 'Task: Deploy WebSocket integration → ETA 3m',
      timestamp: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'gateway_webhook_1',
      action: 'Gateway webhook',
      details: 'Callback received → Agent c7e8d9 completed in 2m 43s',
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 'error_recovery_1',
      action: 'Error recovery',
      details: 'Ollama Kimi failed → Auto-fallback to Think-NV → Task recovered',
      timestamp: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: 'director_heartbeat',
      action: 'Director heartbeat',
      details: 'System status: 5 agents idle, 2 busy, 0 errors | All systems nominal',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'nexagua_drip_1',
      action: 'NexAgua campaign',
      details: 'Email #1/6 (Welcome) sent → Open rate: 68% (above benchmark)',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ];
}

async function getLiveAgentStatus() {
  try {
    // Check if we're on local OpenClaw
    const { stdout } = await execAsync('openclaw sessions list --active 2>/dev/null || echo "[]"', { timeout: 3000 });
    if (stdout.trim() && stdout !== '[]') {
      return { hasLiveData: true, raw: stdout };
    }
  } catch {
    // No OpenClaw CLI available on Vercel, use sample
  }
  return { hasLiveData: false };
}

export async function GET(): Promise<NextResponse> {
  const db = getDb();
  try {
    // Try to get real activities from database
    const activities = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT id, action, details, timestamp FROM activity_logs ORDER BY timestamp DESC LIMIT 50`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // If no real activities, return sample data showing Director/sub-agent workflow
    if (activities.length === 0) {
      const samples = getSampleActivities();
      return NextResponse.json({ 
        activities: samples,
        count: samples.length,
        isSample: true,
        hasLiveData: false
      });
    }

    return NextResponse.json({ 
      activities, 
      count: activities.length,
      isSample: false,
      hasLiveData: true
    });
  } catch (error) {
    console.error('Database error:', error);
    // Fallback to samples on error
    const samples = getSampleActivities();
    return NextResponse.json({ 
      activities: samples,
      count: samples.length,
      isSample: true,
      hasLiveData: false,
      error: 'Database error, showing sample data'
    });
  }
}