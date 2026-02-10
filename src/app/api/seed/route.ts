import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST(): Promise<NextResponse> {
  try {
    const db = initDb();
    
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
      `INSERT OR IGNORE INTO project_suggestions 
       (project_id, suggestion_type, title, description, confidence, status) VALUES 
       -- NexAgua suggestions
       (1, 'marketing', 'Launch email campaign', 'Send targeted emails to water utility companies', 85, 'pending'),
       (1, 'content', 'Create case studies', 'Document successful NexAgua deployments', 75, 'pending'),
       -- Sports Picks suggestions
       (2, 'feature', 'Add confidence scoring', 'Display confidence level for each prediction', 90, 'pending'),
       -- Mission Control suggestions (dashboard optimizations)
       (6, 'performance', 'Add WebSocket real-time updates', 'Live agent status without page refresh', 85, 'pending'),
       (6, 'infrastructure', 'Move SQLite to Supabase', 'Persistent database across deployments', 90, 'pending'),
       (6, 'ui', 'Add dark mode toggle', 'Match NexAgua brand colors (#0A2540 navy)', 75, 'pending'),
       (6, 'responsive', 'Fix mobile agent grid', 'Better layout on small screens', 80, 'pending'),
       (6, 'ux', 'Auto-refresh every 30s', 'Dashboard updates automatically', 70, 'pending'),
       (6, 'export', 'Download projects as CSV/JSON', 'Data export functionality', 65, 'pending'),
       -- MiniCPM evaluation suggestions
       (7, 'benchmark', 'Compare vision accuracy vs Gemini', 'Test on sister photos, compare quality', 80, 'pending'),
       (7, 'cost', 'Evaluate hosting costs', 'Can RTX 4090 run 9B efficiently?', 70, 'pending'),
       (7, 'integration', 'Add as vision fallback', 'Use when Gemini API unavailable', 85, 'pending')`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded: 7 projects, 12 suggestions (6 Mission Control optimizations ready to approve)' 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return POST();
}
