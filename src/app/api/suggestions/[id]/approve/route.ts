import { NextRequest, NextResponse } from 'next/server';
import { updateSuggestionStatus } from '@/lib/projects';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = parseInt(params.id);
    const { reason } = await request.json();

    // Update suggestion status to approved
    await updateSuggestionStatus(suggestionId, 'approved', reason);

    // Queue task for execution by spawning sub-agent in background
    const subAgent = spawn('node', [
      path.join(process.cwd(), 'scripts', 'execute-suggestion.js'),
      suggestionId.toString()
    ], {
      detached: true,
      stdio: 'ignore'
    });

    subAgent.unref(); // Allow process to continue independently

    return NextResponse.json({
      success: true,
      message: 'Suggestion approved and task queued for execution',
      suggestionId
    });
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}