'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { PostMessagePlayer } from './PostMessagePlayer';

interface EmbedPlayerProps {
  url: string;
  className?: string;
}

export function EmbedPlayer({ url, className = '' }: EmbedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingMethod, setLoadingMethod] = useState<string>('postmessage');
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Import x-frame-bypass dynamically to avoid SSR issues
    const loadXFrameBypass = async () => {
      try {
        await import('x-frame-bypass');
        console.log('x-frame-bypass loaded successfully');
      } catch (error) {
        console.log('x-frame-bypass failed to load:', error);
        setShowFallback(true);
      }
    };

    loadXFrameBypass();

    // Set a timeout to show fallback if nothing loads
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, 5000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const tryAlternativeMethod = () => {
    if (loadingMethod === 'postmessage') {
      setLoadingMethod('webview');
    } else if (loadingMethod === 'webview') {
      setLoadingMethod('object');
    } else if (loadingMethod === 'object') {
      setLoadingMethod('embed');
    } else {
      setShowFallback(true);
    }
  };

  if (showFallback) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg ${className}`}>
        <div className="text-center p-8">
          <Play className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Video Player</h3>
          <p className="text-gray-300 mb-4">
            Click below to watch the episode
          </p>
          <button
            onClick={() => window.open(url, '_blank')}
            className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <Play className="w-5 h-5 inline mr-2" />
            Watch Episode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {loadingMethod === 'postmessage' && (
        <PostMessagePlayer 
          url={url} 
          className="w-full h-full"
        />
      )}
      
      {loadingMethod === 'webview' && (
        <x-frame-bypass 
          src={url}
          style={{ width: '100%', height: '100%', border: 'none' }}
          onError={tryAlternativeMethod}
        />
      )}
      
      {loadingMethod === 'object' && (
        <object
          data={url}
          type="text/html"
          className="w-full h-full"
          onError={tryAlternativeMethod}
        >
          <embed
            src={url}
            type="text/html"
            width="100%"
            height="100%"
            onError={tryAlternativeMethod}
          />
        </object>
      )}
      
      {loadingMethod === 'embed' && (
        <embed
          src={url}
          type="text/html"
          width="100%"
          height="100%"
          className="w-full h-full"
          onError={() => setShowFallback(true)}
        />
      )}
      
      {/* Loading indicator */}
      <div className="absolute top-4 left-4 bg-black/50 rounded px-2 py-1">
        <span className="text-white text-xs">Method: {loadingMethod}</span>
      </div>
      
      {/* Manual fallback button */}
      <div className="absolute top-4 right-4 bg-black/50 rounded px-2 py-1">
        <button
          onClick={tryAlternativeMethod}
          className="text-white text-xs hover:text-primary"
        >
          Try Different Method
        </button>
      </div>
    </div>
  );
}

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'x-frame-bypass': any;
    }
  }
}