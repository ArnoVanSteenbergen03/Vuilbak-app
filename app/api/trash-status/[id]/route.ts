// app/api/trash-status/[id]/route.ts
import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

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
    
    const filePath = join(process.cwd(), 'data', 'trashcans.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const trashCans: TrashCan[] = JSON.parse(fileContent);
    
    console.log(`[PUT /api/trash-status/${id}] Loaded trashcans from file:`, trashCans.map(t => t.id));
    
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
    
    // Write back to file
    writeFileSync(filePath, JSON.stringify(trashCans, null, 2));
    
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
