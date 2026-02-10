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
      ('Mission Control', 'This dashboard - AI-powered project management and agent monitoring system', 'active', 95),
      ('MiniCPM-o-4.5 Evaluation', 'Test 9B multimodal model (vision+speech+Qwen3-8B) for specialized tasks', 'proposed', 0)`
    );
    
    // Insert sample suggestions
    await db.run(
      `INSERT OR IGNORE INTO project_suggestions 
       (project_id, suggestion_type, title, description, confidence, status) VALUES 
       (1, 'marketing', 'Launch email campaign', 'Send targeted emails to water utility companies', 85, 'pending'),
       (1, 'content', 'Create case studies', 'Document successful NexAgua deployments', 75, 'pending'),
       (2, 'feature', 'Add confidence scoring', 'Display confidence level for each prediction', 90, 'pending'),
       (5, 'optimization', 'Add real-time updates', 'WebSocket for live agent status', 70, 'pending'),
       (6, 'benchmark', 'Compare vision accuracy vs Gemini', 'Test on sister photos, compare description quality', 80, 'pending'),
       (6, 'cost', 'Evaluate hosting costs', 'Check if local RTX 4090 can run 9B model efficiently', 70, 'pending'),
       (6, 'integration', 'Add as vision fallback', 'Use when Gemini API is down for image analysis', 85, 'pending')`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded with sample data (6 projects, 7 suggestions)' 
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
