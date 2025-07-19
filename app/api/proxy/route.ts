import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    console.log(`Proxying request to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const content = await response.text();
    
    // Get the base URL to fix relative paths
    const baseUrl = new URL(url).origin;
    
    // Remove X-Frame-Options and CSP headers that prevent embedding
    // Also fix relative URLs to point to the original domain
    const modifiedContent = content
      .replace(/X-Frame-Options:[^\r\n]*/gi, '')
      .replace(/Content-Security-Policy:[^\r\n]*/gi, '')
      .replace(/x-frame-options:\s*[^\r\n]*/gi, '')
      .replace(/content-security-policy:\s*[^\r\n]*/gi, '')
      // Add a base tag to handle relative URLs properly
      .replace(/<head>/i, `<head><base href="${baseUrl}/">`)
      // Fix any remaining absolute relative paths
      .replace(/href="\/(?!\/)/g, `href="${baseUrl}/`)
      .replace(/src="\/(?!\/)/g, `src="${baseUrl}/`)
      .replace(/url\("\/(?!\/)/g, `url("${baseUrl}/`)
      .replace(/url\('\/(?!\/)/g, `url('${baseUrl}/`)
      .replace(/url\(\/(?!\/)/g, `url(${baseUrl}/`)

    return new NextResponse(modifiedContent, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        // Remove frame restrictions
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self' *;",
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}