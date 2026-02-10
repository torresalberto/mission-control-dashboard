import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/lib/projects';

export async function GET(): Promise<NextResponse> {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    // Return empty array if database not ready (e.g., during build or first request)
    if (error.message?.includes('not available') || error.message?.includes('Build phase')) {
      console.log('[API] DB not ready, returning empty array');
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const project = await createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error.message },
      { status: 500 }
    );
  }
}
