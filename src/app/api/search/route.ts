import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query.trim()) {
      return NextResponse.json({ results: [], query: '' });
    }
    
    try {
      const rows = await db.all(
        `SELECT source_path, source_type, modified_date, snippet(search_index, 0, '<mark>', '</mark>', '...', 100) as snippet FROM search_index WHERE search_index MATCH ? LIMIT 20`,
        [query]
      );
      
      return NextResponse.json({ 
        results: rows || [], 
        query, 
        count: (rows || []).length 
      });
    } catch (err) {
      console.error('Search error:', err);
      // Return empty results if search fails
      return NextResponse.json({ results: [], query, source: 'empty' });
    }
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ results: [], query: '', source: 'error' });
  }
}
