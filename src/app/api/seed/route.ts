import { NextResponse } from 'next/server';
import { getDb, logActivity } from '@/lib/db';

export async function POST(): Promise<NextResponse> {
  try {
    const db = await getDb();
    
    // Insert sample projects
    await db.run(
      `INSERT OR IGNORE INTO projects (name, description, status, progress) VALUES 
      ('NexAgua Marketing', 'Digital marketing strategy for water optimization solutions', 'active', 65),
      ('Sports Picks AI', 'ML model for sports betting predictions', 'active', 40),
      ('Doctoriofy MVP', 'Healthcare appointment booking platform', 'paused', 20),
      ('GitHub Cleanup', 'Repository maintenance and organization', 'active', 80),
      ('Mission Control', 'This dashboard - self-managing project and agent monitoring system', 'active', 95),
      ('Mission Control Optimizations', 'Continuous improvements to the dashboard itself', 'active', 30),
      ('MiniCPM-o-4.5 Evaluation', 'Test 9B multimodal model (vision+speech+Qwen3-8B)', 'proposed', 0)`
    );

    // Insert sample suggestions
    await db.run(
      `INSERT OR IGNORE INTO project_suggestions (project_id, suggestion_type, title, description, confidence, status) VALUES 
      (1, 'marketing', 'Launch email campaign', 'Send targeted emails to water utility companies', 85, 'pending'),
      (1, 'content', 'Create case studies', 'Document successful NexAgua deployments', 75, 'pending'),
      (2, 'feature', 'Add confidence scoring', 'Display confidence level for each prediction', 90, 'pending'),
      (5, 'performance', 'Add WebSocket real-time updates', 'Live agent status without page refresh', 85, 'pending'),
      (5, 'infrastructure', 'Move SQLite to Supabase', 'Persistent database across deployments', 90, 'pending'),
      (5, 'ui', 'Add dark mode toggle', 'Match NexAgua brand colors (#0A2540 navy)', 75, 'pending'),
      (5, 'responsive', 'Fix mobile agent grid', 'Better layout on small screens', 80, 'pending'),
      (5, 'ux', 'Auto-refresh every 30s', 'Dashboard updates automatically', 70, 'pending'),
      (5, 'export', 'Download projects as CSV/JSON', 'Data export functionality', 65, 'pending'),
      (7, 'benchmark', 'Compare vision accuracy vs Gemini', 'Test on sister photos, compare quality', 80, 'pending'),
      (7, 'cost', 'Evaluate hosting costs', 'Can RTX 4090 run 9B efficiently?', 70, 'pending'),
      (7, 'integration', 'Add as vision fallback', 'Use when Gemini API unavailable', 85, 'pending')`
    );

    // Seed sample tasks
    await db.run(
      `INSERT OR IGNORE INTO scheduled_tasks (name, schedule, next_run, last_run, status, description, category) VALUES 
      ('Agent Health Check', '*/5 * * * *', datetime('now', '+5 minutes'), datetime('now'), 'active', 'Monitor all agents', 'system'),
      ('Activity Feed Update', '*/30 * * * *', datetime('now', '+30 minutes'), datetime('now'), 'active', 'Refresh activity feed', 'maintenance'),
      ('NexAgua Email Campaign', '0 9 * * *', datetime('now', '+1 day'), datetime('now', '-1 day'), 'active', 'Send daily emails', 'nexagua')`
    );

    // Log activity
    await logActivity('database_seeded', 'Sample data loaded: 7 projects, 12 suggestions, 3 tasks');

    return NextResponse.json({
      success: true,
      message: 'Database seeded: 7 projects, 12 suggestions, 3 tasks'
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return POST();
}
