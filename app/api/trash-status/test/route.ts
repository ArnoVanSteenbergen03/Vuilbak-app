// app/api/trash-status/test/route.ts
import { NextResponse } from 'next/server';

let testStatus = { isFull: false, distance: 50 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'full') {
    testStatus = { isFull: true, distance: 15 };
  } else if (action === 'empty') {
    testStatus = { isFull: false, distance: 50 };
  } else if (action === 'halfway') {
    testStatus = { isFull: false, distance: 35 };
  }

  return NextResponse.json(testStatus);
}
