import { NextResponse } from 'next/server';

/**
 * Demo Mode Message API — No-op for demo
 */
export async function POST() {
  return NextResponse.json({ success: true });
}
