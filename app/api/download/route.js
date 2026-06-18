import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const fileUrl = url.searchParams.get('url');
  const filename = url.searchParams.get('name') || 'download';

  if (!fileUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  try {
    const res = await fetch(fileUrl);
    
    if (!res.ok) {
      return new Response('Failed to fetch file from storage', { status: res.status });
    }

    // Only set specific headers to avoid conflicting headers from Convex
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${filename}.zip"`);
    
    const contentLength = res.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy download error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
