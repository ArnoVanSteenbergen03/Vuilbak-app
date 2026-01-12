// app/api/trash-status/[id]/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { kv } from '@vercel/kv';

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
    
    // Get current data from KV or JSON file
    let trashCans: TrashCan[] = await kv.get('trashcans') as TrashCan[];
    
    if (!trashCans) {
      console.log(`[PUT /api/trash-status/${id}] KV cache empty, loading from JSON file...`);
      const filePath = join(process.cwd(), 'data', 'trashcans.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      trashCans = JSON.parse(fileContent);
    }
    
    console.log(`[PUT /api/trash-status/${id}] Loaded trashcans:`, trashCans.map(t => t.id));
    
    // Find and update the trash can (convert id to number for comparison)
    const numericId = parseInt(id, 10);
    console.log(`[PUT /api/trash-status/${id}] Looking for trash can with id: ${numericId} (type: ${typeof numericId})`);
    
    const trashCanIndex = trashCans.findIndex((t) => t.id === numericId);
    
    console.log(`[PUT /api/trash-status/${id}] Found at index: ${trashCanIndex}`);
    
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
    
    // Write back to KV
    await kv.set('trashcans', trashCans);
    
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
