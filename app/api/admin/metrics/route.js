import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return NextResponse.json({ error: 'Missing Clerk Secret Key' }, { status: 500 });
    }

    const res = await fetch('https://api.clerk.com/v1/users/count', {
      headers: { Authorization: 'Bearer ' + process.env.CLERK_SECRET_KEY }
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch user count from Clerk');
    }

    return NextResponse.json({ 
      totalUsers: data.total_count || 0 
    });

  } catch (error) {
    console.error('Admin Metrics API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
