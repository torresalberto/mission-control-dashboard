import { NextRequest, NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const db = initDb();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  if (!query.trim()) {
    return NextResponse.json({ results: [], query: '' });
  }
  return new Promise<NextResponse>((resolve) => {
    db.all(
      `SELECT source_path, source_type, modified_date, snippet(search_index, 0, '<mark>', '</mark>', '...', 100) as snippet FROM search_index WHERE search_index MATCH ? LIMIT 20`,
      [query],
      (err, rows) => {
        if (err) {
          console.error('Search error:', err);
          resolve(NextResponse.json({ results: [], query, error: err.message }));
          return;
        }
        resolve(NextResponse.json({ results: rows || [], query, count: (rows || []).length }));
      }
    );
  });
}
