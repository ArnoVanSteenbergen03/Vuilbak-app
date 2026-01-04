// app/api/trash-status/route.ts
import { NextResponse } from 'next/server';
import { getLatestStatus } from '@/lib/arduino';

export async function GET() {
  const status = getLatestStatus();
  return NextResponse.json(status);
}
