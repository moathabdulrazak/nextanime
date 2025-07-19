'use client';

import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { DirectVideoPlayer } from '@/components/DirectVideoPlayer';
import { useEffect, useState } from 'react';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const idSegments = params.id as string[];
  const [mediaId, setMediaId] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Reconstruct the full episode/movie ID from URL segments
  const episodeId = idSegments.join('/');

  useEffect(() => {
    // Get mediaId from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const media = urlParams.get('mediaId');
    if (media) {
      setMediaId(media);
    } else {
      // If no mediaId provided, try to use episodeId as both
      // For anime, append episode 1 if no episode specified
      let finalEpisodeId = episodeId;
      if (episodeId.includes('anime/') && !episodeId.includes('episode')) {
        finalEpisodeId = `${episodeId}/episode/1`;
      }
      setMediaId(finalEpisodeId);
    }
    
    // Set debug info
    setDebugInfo(`Episode ID: ${episodeId}, Media ID: ${media || episodeId}`);
  }, [episodeId]);

  const { data: streamingLinks, isLoading, error } = useQuery({
    queryKey: ['streaming', episodeId, mediaId],
    queryFn: async () => {
      console.log('Fetching streaming links with:', { episodeId, mediaId });
      const links = await movieAPI.getStreamingLinks(episodeId, mediaId);
      console.log('Received streaming links:', links);
      return links;
    },
    enabled: !!episodeId && !!mediaId,
    retry: 3,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !streamingLinks || streamingLinks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg">
          <p className="text-red-500 mb-4 text-lg font-semibold">Failed to load video</p>
          
          <div className="mb-6 p-4 bg-gray-800 rounded-lg text-left">
            <p className="text-sm text-gray-400 mb-2">Debug Information:</p>
            <p className="text-xs text-gray-500 font-mono">{debugInfo}</p>
            {error && (
              <p className="text-xs text-red-400 mt-2">Error: {error.message || 'Unknown error'}</p>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors mr-3"
            >
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-full transition-colors"
            >
              Go Back
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Try refreshing the page or check the console for more details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Content
          </button>
        </motion.div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <DirectVideoPlayer 
            streamingLinks={streamingLinks || []} 
            className="rounded-lg"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-effect p-6 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4">Video Player</h2>
          
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-white">i</span>
              </div>
              <div>
                <p className="text-sm font-medium">FlixStream Platform</p>
                <p className="text-xs text-gray-400 mt-1">
                  This movie streaming platform is built with Next.js and FlixHQ API. 
                  Enjoy high-quality streaming with multiple server options.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm text-gray-400">Available Sources</h3>
              <p className="text-sm text-gray-300">
                {streamingLinks.length} streaming source{streamingLinks.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm text-gray-400">Quality</h3>
              <div className="flex flex-wrap gap-2">
                {streamingLinks.map((link, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/20 rounded text-sm"
                  >
                    {link.quality} {link.isM3U8 ? '(HLS)' : '(MP4)'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>If the video doesn't play, try refreshing the page or contact support.</p>
        </motion.div>
      </div>
    </div>
  );
}