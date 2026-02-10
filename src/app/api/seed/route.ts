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
      ('Mission Control', 'Agent monitoring dashboard', 'active', 90)`
    );
    
    // Insert sample suggestions
    await db.run(
      `INSERT OR IGNORE INTO project_suggestions 
       (project_id, suggestion_type, title, description, confidence, status) VALUES 
       (1, 'marketing', 'Launch email campaign', 'Send targeted emails to water utility companies', 85, 'pending'),
       (1, 'content', 'Create case studies', 'Document successful NexAgua deployments', 75, 'pending'),
       (2, 'feature', 'Add confidence scoring', 'Display confidence level for each prediction', 90, 'pending'),
       (5, 'optimization', 'Add real-time updates', 'WebSocket for live agent status', 70, 'pending')`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded with sample data' 
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
