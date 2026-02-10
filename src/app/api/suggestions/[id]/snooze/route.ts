import { NextRequest, NextResponse } from 'next/server';
import { updateSuggestionStatus } from '@/lib/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = parseInt(params.id);
    const { reason } = await request.json();

    // Update suggestion status to snoozed
    await updateSuggestionStatus(suggestionId, 'snoozed', reason);

    return NextResponse.json({
      success: true,
      message: 'Suggestion snoozed for 24 hours',
      suggestionId
    });
  } catch (error) {
    console.error('Error processing snooze:', error);
    return NextResponse.json(
      { error: 'Failed to process snooze' },
      { status: 500 }
    );
  }
}