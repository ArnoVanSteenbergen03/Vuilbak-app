// app/api/trash-status/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

interface KVClient {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

let kvAvailable = false;
let kv: KVClient | null = null;

// Initialize KV if available
async function initKV() {
  if (!kvAvailable) {
    try {
      const kvModule = await import('@vercel/kv');
      kv = kvModule.kv as KVClient;
      kvAvailable = true;
    } catch (error) {
      console.log('[GET /api/trash-status] KV not available, will use JSON fallback', error);
    }
  }
}

export async function GET() {
  try {
    console.log('[GET /api/trash-status] Fetching trash cans...');
    await initKV();
    
    // Try to get from KV first if available
    if (kvAvailable && kv) {
      try {
        const cachedData = await kv.get('trashcans');
        if (cachedData) {
          console.log('[GET /api/trash-status] Successfully fetched from KV');
          return NextResponse.json(cachedData);
        }
      } catch (kvError) {
        console.log('[GET /api/trash-status] KV fetch failed, falling back to JSON:', kvError);
      }
    }
    
    // Fall back to JSON file
    console.log('[GET /api/trash-status] Loading from JSON file...');
    const filePath = join(process.cwd(), 'data', 'trashcans.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Try to store in KV for future requests if available
    if (kvAvailable && kv) {
      try {
        await kv.set('trashcans', data);
        console.log('[GET /api/trash-status] Cached data in KV');
      } catch (kvError) {
        console.log('[GET /api/trash-status] Failed to cache in KV (will use JSON next time):', kvError);
      }
    }
    
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
