import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const embedUrl = searchParams.get('url');

  if (!embedUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    console.log(`Attempting to extract video URL from: ${embedUrl}`);
    
    // Try multiple approaches to extract video URLs
    const extractionResults = await Promise.allSettled([
      extractFromDirectFetch(embedUrl),
      extractFromMegacloudAPI(embedUrl),
      extractFromNetworkRequests(embedUrl)
    ]);

    const allVideoUrls = extractionResults
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<string[]>).value)
      .filter(url => url && url.length > 0);

    if (allVideoUrls.length > 0) {
      // Remove duplicates and prioritize by quality
      const uniqueUrls = [...new Set(allVideoUrls)];
      const videoSources = uniqueUrls.map(url => ({
        url,
        type: url.includes('.m3u8') ? 'hls' : 'mp4',
        quality: extractQualityFromUrl(url) || 'auto'
      }));

      return NextResponse.json({
        success: true,
        sources: videoSources,
        count: videoSources.length
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No video URLs found',
        embedUrl
      });
    }

  } catch (error) {
    console.error('Video extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract video URLs' },
      { status: 500 }
    );
  }
}

// Extract from direct HTML fetch
async function extractFromDirectFetch(embedUrl: string): Promise<string[]> {
  const response = await fetch(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://megacloud.blog/',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch embed page: ${response.status}`);
  }

  const html = await response.text();
  const foundUrls = new Set<string>();
  
  // Look for common video URL patterns in the HTML
  const videoUrlPatterns = [
    // M3U8 playlists
    /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi,
    // MP4 files  
    /https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi,
    // Common video CDN patterns
    /https?:\/\/[^"'\s]*(?:cdn|video|stream)[^"'\s]*\.(m3u8|mp4)[^"'\s]*/gi,
    // Look for source URLs in JavaScript
    /"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/gi,
    /'(https?:\/\/[^']+\.(?:m3u8|mp4)[^']*)'/gi,
  ];

  for (const pattern of videoUrlPatterns) {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(url => {
        const cleanUrl = url.replace(/['"]/g, '').trim();
        if (cleanUrl.startsWith('http')) {
          foundUrls.add(cleanUrl);
        }
      });
    }
  }

  // Look for video source elements
  const sourceRegex = /<source[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let sourceMatch;
  while ((sourceMatch = sourceRegex.exec(html)) !== null) {
    foundUrls.add(sourceMatch[1]);
  }

  return Array.from(foundUrls).filter(url => 
    url.includes('.m3u8') || url.includes('.mp4')
  );
}

// Extract from Megacloud API endpoints
async function extractFromMegacloudAPI(embedUrl: string): Promise<string[]> {
  try {
    // Extract video ID from the embed URL
    const urlParts = embedUrl.split('/');
    const videoId = urlParts[urlParts.length - 1]?.split('?')[0];
    
    if (!videoId) return [];

    // Try common API endpoints
    const apiEndpoints = [
      `https://megacloud.blog/api/v1/video/${videoId}`,
      `https://megacloud.blog/api/video/${videoId}/sources`,
      `https://megacloud.blog/embed-2/ajax/v2/getSources?id=${videoId}`,
    ];

    const foundUrls: string[] = [];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Referer': embedUrl,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Look for sources in the response
          if (data.sources && Array.isArray(data.sources)) {
            data.sources.forEach((source: any) => {
              if (source.file || source.url) {
                foundUrls.push(source.file || source.url);
              }
            });
          }
          
          if (data.source) {
            foundUrls.push(data.source);
          }
        }
      } catch (apiError) {
        console.log(`API endpoint ${endpoint} failed:`, apiError);
      }
    }

    return foundUrls;
  } catch (error) {
    console.log('Megacloud API extraction failed:', error);
    return [];
  }
}

// Simulate network request interception
async function extractFromNetworkRequests(embedUrl: string): Promise<string[]> {
  // This would ideally use a headless browser like Puppeteer
  // For now, return empty array as a placeholder
  return [];
}

// Extract quality info from URL
function extractQualityFromUrl(url: string): string | null {
  const qualityPatterns = [
    /(\d+p)/i,           // 720p, 1080p, etc.
    /(hd|sd|uhd|4k)/i,   // HD, SD, UHD, 4K
    /(high|medium|low)/i  // quality descriptors
  ];

  for (const pattern of qualityPatterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return null;
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