import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/phone-upload/commit?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return NextResponse.json(await res.json(), { status: res.status });
}
