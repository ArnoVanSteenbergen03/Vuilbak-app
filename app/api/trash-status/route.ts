// app/api/trash-status/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    console.log('[GET /api/trash-status] Fetching trash cans from JSON file...');
    const filePath = join(process.cwd(), 'data', 'trashcans.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    console.log('[GET /api/trash-status] Successfully fetched trash cans:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/trash-status] Error fetching trash cans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trash can data' },
      { status: 500 }
    );
  }
}
