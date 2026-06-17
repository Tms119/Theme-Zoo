import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET() {
  try {
    const codes = await convex.query(api.promo_codes.listAll);
    return NextResponse.json({ codes });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
