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
  const episodeId = params.id as string;
  const [mediaId, setMediaId] = useState<string>('');

  useEffect(() => {
    // Get mediaId from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const media = urlParams.get('mediaId');
    if (media) {
      setMediaId(media);
    } else {
      // If no mediaId provided, try to use episodeId as both
      setMediaId(episodeId);
    }
  }, [episodeId]);

  const { data: streamingLinks, isLoading, error } = useQuery({
    queryKey: ['streaming', episodeId, mediaId],
    queryFn: () => movieAPI.getStreamingLinks(episodeId, mediaId),
    enabled: !!episodeId && !!mediaId,
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
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load video</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-full transition-colors"
          >
            Go Back
          </button>
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
            Back to Movies
          </button>
        </motion.div>

        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <DirectVideoPlayer 
            streamingLinks={(streamingLinks || []).map(link => ({
              url: link.url,
              quality: link.quality,
              type: link.isM3U8 ? 'hls' as const : (link.type === 'iframe' ? 'iframe' as const : 'mp4' as const)
            }))} 
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