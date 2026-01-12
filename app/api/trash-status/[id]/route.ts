// app/api/trash-status/[id]/route.ts
import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
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
      console.log('[PUT /api/trash-status] KV not available, will use JSON fallback', error);
    }
  }
}

interface TrashCan {
  id: number;
  location: string;
  lat: number;
  lng: number;
  status: string;
  lastUpdated: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`[PUT /api/trash-status/${id}] Updating trash can ${id} with status: ${body.status}`);
    await initKV();
    
    let trashCans: TrashCan[] = [];
    
    // Try to get from KV first if available
    if (kvAvailable && kv) {
      try {
        const cachedData = await kv.get('trashcans');
        if (cachedData) {
          trashCans = cachedData as TrashCan[];
          console.log(`[PUT /api/trash-status/${id}] Loaded from KV`);
        }
      } catch (kvError) {
        console.log(`[PUT /api/trash-status/${id}] KV fetch failed, falling back to JSON:`, kvError);
      }
    }
    
    // Fall back to JSON file if not loaded from KV
    if (trashCans.length === 0) {
      console.log(`[PUT /api/trash-status/${id}] Loading from JSON file...`);
      const filePath = join(process.cwd(), 'data', 'trashcans.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      trashCans = JSON.parse(fileContent);
    }
    
    console.log(`[PUT /api/trash-status/${id}] Loaded trashcans:`, trashCans.map(t => t.id));
    
    // Find and update the trash can (convert id to number for comparison)
    const numericId = parseInt(id, 10);
    console.log(`[PUT /api/trash-status/${id}] Looking for trash can with id: ${numericId}`);
    
    const trashCanIndex = trashCans.findIndex((t) => t.id === numericId);
    
    if (trashCanIndex === -1) {
      console.error(`[PUT /api/trash-status/${id}] Trash can not found. Available IDs:`, trashCans.map(t => t.id));
      return NextResponse.json(
        { error: 'Trash can not found' },
        { status: 404 }
      );
    }
    
    // Update the status and timestamp
    trashCans[trashCanIndex].status = body.status;
    trashCans[trashCanIndex].lastUpdated = new Date().toISOString().split('T')[0];
    
    // Try to save to KV first if available
    let savedToKV = false;
    if (kvAvailable && kv) {
      try {
        await kv.set('trashcans', trashCans);
        savedToKV = true;
        console.log(`[PUT /api/trash-status/${id}] Saved to KV`);
      } catch (kvError) {
        console.log(`[PUT /api/trash-status/${id}] Failed to save to KV, will use local storage only:`, kvError);
      }
    }
    
    // Also save to JSON file for local development and as a fallback
    try {
      const filePath = join(process.cwd(), 'data', 'trashcans.json');
      writeFileSync(filePath, JSON.stringify(trashCans, null, 2));
      console.log(`[PUT /api/trash-status/${id}] Saved to JSON file`);
    } catch (fileError) {
      // On Vercel, this will fail (read-only filesystem), but that's OK if KV worked
      if (!savedToKV) {
        throw fileError;
      }
      console.log(`[PUT /api/trash-status/${id}] Could not save to JSON file (read-only), but KV saved successfully`);
    }
    
    console.log(`[PUT /api/trash-status/${id}] Successfully updated trash can:`, trashCans[trashCanIndex]);
    return NextResponse.json(trashCans[trashCanIndex]);
  } catch (error) {
    console.error(`[PUT /api/trash-status] Error updating trash can:`, error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
