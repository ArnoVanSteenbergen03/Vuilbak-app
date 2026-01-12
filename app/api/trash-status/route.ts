// app/api/trash-status/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    console.log('[GET /api/trash-status] Fetching trash cans from KV...');
    
    // Try to get from KV first
    const cachedData = await kv.get('trashcans');
    
    if (cachedData) {
      console.log('[GET /api/trash-status] Successfully fetched from KV:', cachedData);
      return NextResponse.json(cachedData);
    }
    
    // Fallback to JSON file if KV is empty
    console.log('[GET /api/trash-status] KV cache empty, loading from JSON file...');
    const filePath = join(process.cwd(), 'data', 'trashcans.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Store in KV for future requests
    await kv.set('trashcans', data);
    
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
