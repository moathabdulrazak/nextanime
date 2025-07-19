'use client';

import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, AlertTriangle, Loader } from 'lucide-react';

interface DirectVideoPlayerProps {
  streamingLinks: VideoSource[];
  className?: string;
}

interface VideoSource {
  url: string;
  type: 'hls' | 'mp4' | 'iframe';
  quality: string;
}

function getSourceName(url: string): string {
  if (url.includes('vidsrc.icu') || url.includes('vidsrc.to')) return 'VidSrc';
  if (url.includes('multiembed.mov')) return 'SuperEmbed';
  if (url.includes('2embed.cc')) return '2Embed';
  if (url.includes('autoembed.cc')) return 'Autoembed';
  return 'Embed';
}

export function DirectVideoPlayer({ streamingLinks, className = '' }: DirectVideoPlayerProps) {
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (streamingLinks && streamingLinks.length > 0) {
      // Select the best source (prefer iframe for better compatibility)
      const iframeSource = streamingLinks.find(s => s.type === 'iframe');
      const hlsSource = streamingLinks.find(s => s.type === 'hls');
      const mp4Source = streamingLinks.find(s => s.type === 'mp4');
      setSelectedSource(iframeSource || hlsSource || mp4Source || streamingLinks[0]);
    }
  }, [streamingLinks]);

  const handlePlayerError = (error: any) => {
    console.error('Player error:', error);
    
    // Try the next available source
    if (streamingLinks.length > 1) {
      const currentIndex = streamingLinks.findIndex(s => s.url === selectedSource?.url);
      const nextSource = streamingLinks[currentIndex + 1] || streamingLinks[0];
      
      if (nextSource && nextSource.url !== selectedSource?.url) {
        console.log('Trying next source:', nextSource);
        setSelectedSource(nextSource);
        return;
      }
    }
    
    setError('Video playback failed. All sources have been tried.');
  };

  if (!streamingLinks || streamingLinks.length === 0) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg ${className}`}>
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Video Sources</h3>
          <p className="text-gray-300 mb-6">
            No streaming sources available for this content.
          </p>
        </div>
      </div>
    );
  }

  if (error || !selectedSource) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg ${className}`}>
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Video Playback Failed</h3>
          <p className="text-gray-300 mb-6">
            {error || 'Unable to play this video.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {selectedSource.type === 'iframe' ? (
        <iframe
          src={selectedSource.url}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      ) : (
        <ReactPlayer
          url={selectedSource.url}
          playing={false}
          controls={true}
          width="100%"
          height="100%"
          onError={handlePlayerError}
          onReady={() => console.log('Video player ready')}
          config={{
            youtube: {
              playerVars: { showinfo: 1 }
            }
          }}
          style={{
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      )}
      
      {/* Source info overlay */}
      <div className="absolute top-4 left-4 bg-black/50 rounded px-3 py-1">
        <span className="text-white text-xs">
          {getSourceName(selectedSource.url)} • {selectedSource.quality}
        </span>
      </div>
      
      {/* Quality selector */}
      {streamingLinks.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 rounded px-2 py-1">
          <select
            value={selectedSource.url}
            onChange={(e) => {
              const videoSources = streamingLinks.map(link => ({
                url: link.url,
                type: link.type === 'iframe' ? 'iframe' as const : link.isM3U8 ? 'hls' as const : 'mp4' as const,
                quality: link.quality
              }));
              const source = videoSources.find(s => s.url === e.target.value);
              if (source) setSelectedSource(source);
            }}
            className="bg-transparent text-white text-xs border-none outline-none"
          >
            {streamingLinks.map((link, index) => (
              <option key={index} value={link.url} className="bg-black">
                {getSourceName(link.url)} - {link.quality}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}