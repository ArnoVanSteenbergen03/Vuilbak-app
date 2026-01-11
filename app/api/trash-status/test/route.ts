// app/api/trash-status/test/route.ts
import { NextResponse } from 'next/server';
import { getLatestStatus, setLatestStatus } from '@/lib/status';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'full') {
    setLatestStatus({ isFull: true, distance: 15 });
  } else if (action === 'empty') {
    setLatestStatus({ isFull: false, distance: 50 });
  } else if (action === 'halfway') {
    setLatestStatus({ isFull: false, distance: 35 });
  }

  const status = getLatestStatus();
  return NextResponse.json(status);
}
