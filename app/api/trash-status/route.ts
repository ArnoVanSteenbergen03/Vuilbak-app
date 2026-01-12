// app/api/trash-status/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[GET /api/trash-status] Fetching trash cans from database...');
    
    const trashCans = await prisma.trashCan.findMany({
      orderBy: { id: 'asc' },
    });
    
    console.log('[GET /api/trash-status] Successfully fetched trash cans:', trashCans);
    return NextResponse.json(trashCans);
  } catch (error) {
    console.error('[GET /api/trash-status] Error fetching trash cans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trash can data' },
      { status: 500 }
    );
  }
}
