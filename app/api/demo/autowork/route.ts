import { NextResponse } from 'next/server';

/**
 * Demo Mode Autowork API — Returns empty autowork policies for demo
 */
export async function GET() {
  return NextResponse.json({ policies: {} });
}

export async function POST() {
  // In demo mode, all writes are no-ops
  return NextResponse.json({ success: true });
}

export async function PUT() {
  // In demo mode, all writes are no-ops
  return NextResponse.json({ success: true, sent: [] });
}
