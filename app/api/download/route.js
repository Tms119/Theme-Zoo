import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = new URL(request.url);
  const fileUrl = url.searchParams.get('url');
  const filename = url.searchParams.get('name') || 'download';

  if (!fileUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const res = await fetch(fileUrl);
    
    if (!res.ok) {
      return new NextResponse('Failed to fetch file from storage', { status: res.status });
    }

    const headers = new Headers(res.headers);
    // Force the browser to download it as an attachment with our custom filename
    headers.set('Content-Disposition', `attachment; filename="${filename}.zip"`);
    
    // We stream the file directly to the client
    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy download error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
