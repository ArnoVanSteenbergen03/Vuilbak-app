// app/api/trash-status/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const numericId = parseInt(id, 10);
    console.log(`[PUT /api/trash-status/${id}] Updating trash can ${numericId} with status: ${body.status}`);
    
    // Update in database
    const updatedTrashCan = await prisma.trashCan.update({
      where: { id: numericId },
      data: {
        status: body.status,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    });
    
    console.log(`[PUT /api/trash-status/${id}] Successfully updated:`, updatedTrashCan);
    return NextResponse.json(updatedTrashCan);
  } catch (error) {
    console.error(`[PUT /api/trash-status] Error updating trash can:`, error);
    
    if (error instanceof Error && error.message.includes('No TrashCan found')) {
      return NextResponse.json(
        { error: 'Trash can not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
