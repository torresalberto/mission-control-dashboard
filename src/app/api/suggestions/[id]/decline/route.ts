import { NextRequest, NextResponse } from 'next/server';
import { updateSuggestionStatus } from '@/lib/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = parseInt(params.id);
    const { reason } = await request.json();

    // Update suggestion status to declined
    await updateSuggestionStatus(suggestionId, 'declined', reason);

    return NextResponse.json({
      success: true,
      message: 'Suggestion declined and logged for learning',
      suggestionId
    });
  } catch (error) {
    console.error('Error processing decline:', error);
    return NextResponse.json(
      { error: 'Failed to process decline' },
      { status: 500 }
    );
  }
}