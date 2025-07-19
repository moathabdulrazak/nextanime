'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

interface PostMessagePlayerProps {
  url: string;
  className?: string;
}

export function PostMessagePlayer({ url, className = '' }: PostMessagePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Listen for messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from megacloud.blog
      if (event.origin.includes('megacloud.blog')) {
        console.log('Received message from embed:', event.data);
        
        if (event.data.type === 'playerReady') {
          setPlayerReady(true);
        }
        
        if (event.data.type === 'videoLoaded') {
          setPlayerReady(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Set fallback timer
    const fallbackTimer = setTimeout(() => {
      if (!playerReady) {
        setShowFallback(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(fallbackTimer);
    };
  }, [playerReady]);

  const sendMessageToPlayer = (message: any) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    }
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded, attempting communication...');
    
    // Try to communicate with the player
    setTimeout(() => {
      sendMessageToPlayer({ type: 'init', source: 'nextanime' });
    }, 1000);
    
    // Set ready after a delay if no message received
    setTimeout(() => {
      if (!playerReady) {
        setPlayerReady(true);
      }
    }, 3000);
  };

  if (showFallback) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg ${className}`}>
        <div className="text-center p-8">
          <Play className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Video Player</h3>
          <p className="text-gray-300 mb-4">
            The embedded player couldn't load. Click to watch in a new tab.
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
    <div className={`relative w-full h-full ${className}`}>
      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-pointer-lock allow-top-navigation allow-presentation"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={handleIframeLoad}
        onError={() => {
          console.log('Iframe failed to load');
          setShowFallback(true);
        }}
        style={{
          border: 'none',
          borderRadius: '8px',
        }}
        title="Video Player"
      />
      
      {/* Loading overlay */}
      {!playerReady && !showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg">
          <div className="text-center">
            <div className="loading-skeleton w-16 h-16 rounded-full mx-auto mb-4" />
            <p className="text-white">Loading video player...</p>
            <button
              onClick={() => setShowFallback(true)}
              className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm transition-colors"
            >
              Having trouble? Click here
            </button>
          </div>
        </div>
      )}
      
      {/* Player controls overlay */}
      {playerReady && (
        <div className="absolute top-4 right-4 bg-black/50 rounded px-2 py-1">
          <span className="text-white text-xs">Player Ready</span>
        </div>
      )}
    </div>
  );
}