import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    console.log(`Proxying resource request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Referer': 'https://megacloud.blog/',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch resource: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // For text-based resources (CSS, JS), we might need to fix relative URLs
    if (contentType.includes('text/css') || contentType.includes('javascript')) {
      const content = await response.text();
      const baseUrl = new URL(url).origin;
      
      // Fix relative URLs in CSS/JS files
      const modifiedContent = content
        .replace(/url\(\s*['"]?\/([^'")]+)['"]?\s*\)/g, `url("${baseUrl}/$1")`)
        .replace(/src\s*=\s*['"]\/([^'"]+)['"]/g, `src="${baseUrl}/$1"`)
        .replace(/href\s*=\s*['"]\/([^'"]+)['"]/g, `href="${baseUrl}/$1"`);
      
      return new NextResponse(modifiedContent, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      // For binary resources (images, etc.), just proxy them as-is
      const buffer = await response.arrayBuffer();
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Resource proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy resource request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}