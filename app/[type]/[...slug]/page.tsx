'use client';

import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Play, Plus, ThumbsUp, Star, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string; // 'movie' or 'tv'
  const slug = params.slug as string[];
  const [selectedSeason, setSelectedSeason] = useState(1);
  
  // Reconstruct the full ID from the URL segments
  const contentId = `${type}/${slug.join('/')}`;

  const { data: content, isLoading, error } = useQuery({
    queryKey: ['content', contentId],
    queryFn: () => {
      if (type === 'anime') {
        return movieAPI.getAnimeInfo(contentId);
      } else {
        return movieAPI.getMovieInfo(contentId);
      }
    },
    enabled: !!contentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-32 h-32 rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading content info...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-lg">
          <p className="text-red-500 mb-4 text-lg font-semibold">Failed to load content</p>
          <button
            onClick={() => router.back()}
            className="netflix-button"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Netflix-style Hero Section */}
      <section className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={content.image}
            alt={content.title}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-12 max-w-4xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="absolute top-8 left-4 md:left-12 flex items-center gap-2 text-muted hover:text-white transition-colors bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            {/* Content Type Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                content.type === 'Movie' 
                  ? 'bg-purple-600 text-white' 
                  : content.type === 'Anime'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-yellow-500 text-black'
              }`}>
                {content.type}
              </span>
            </div>

            {/* Title */}
            <h1 className="netflix-title mb-6">
              {content.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-muted">
              {content.releaseDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-green-400 font-medium">
                    {new Date(content.releaseDate).getFullYear()}
                  </span>
                </div>
              )}
              
              {content.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{content.duration}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-yellow-500 font-medium">HD</span>
              </div>
            </div>

            {/* Description */}
            {content.description && (
              <p className="netflix-description mb-8 max-w-2xl">
                {content.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {content.type === 'Movie' ? (
                <Link
                  href={`/watch/${contentId}?mediaId=${encodeURIComponent(contentId)}`}
                  className="netflix-button netflix-shadow"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Play Movie
                </Link>
              ) : (
                <Link
                  href={`/watch/${content.episodes?.[0]?.id || contentId}?mediaId=${encodeURIComponent(contentId)}`}
                  className="netflix-button netflix-shadow"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Play S1:E1
                </Link>
              )}
              
              <button className="netflix-button netflix-button-secondary">
                <Plus className="w-6 h-6" />
                My List
              </button>
              
              <button className="netflix-button netflix-button-secondary">
                <ThumbsUp className="w-6 h-6" />
                Rate
              </button>
            </div>

            {/* Genres */}
            {content.geners && content.geners.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.geners.slice(0, 5).map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-muted"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Episodes/Details Section */}
      <section className="relative z-10 bg-black px-4 md:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          
          {content.type !== 'Movie' && content.episodes && content.episodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="netflix-row-title">Episodes</h2>
                
                {/* Season Selector */}
                {content.seasons && content.seasons > 1 && (
                  <div className="flex items-center gap-4">
                    <label className="text-lg font-semibold text-muted">Season:</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                      className="bg-netflix-card border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 netflix-focus"
                    >
                      {Array.from({ length: content.seasons }, (_, i) => i + 1).map((seasonNum) => (
                        <option key={seasonNum} value={seasonNum} className="bg-netflix-card">
                          Season {seasonNum}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Episodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.episodes
                  .filter((episode) => episode.season === selectedSeason)
                  .map((episode, index) => (
                    <motion.div
                      key={episode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={`/watch/${episode.id}?mediaId=${encodeURIComponent(contentId)}`}
                        className="group block bg-netflix-card rounded-lg overflow-hidden hover:bg-netflix-hover transition-all duration-300 netflix-shadow"
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-purple-900/20 to-black">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                              <Play className="w-6 h-6 ml-1 fill-current" />
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 bg-black/80 rounded px-2 py-1">
                            <span className="text-sm font-bold text-white">
                              E{episode.number}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-white mb-2 line-clamp-1">
                            Episode {episode.number}
                          </h3>
                          {episode.title && episode.title !== `Episode ${episode.number}` && (
                            <p className="text-sm text-muted line-clamp-2">{episode.title}</p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* About */}
            <div>
              <h3 className="netflix-row-title mb-6">About {content.title}</h3>
              <div className="space-y-4 text-muted">
                {content.production && (
                  <div>
                    <span className="text-gray-400">Studio: </span>
                    <span className="text-white">{content.production}</span>
                  </div>
                )}
                
                {content.geners && content.geners.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genres: </span>
                    <span className="text-white">{content.geners.join(', ')}</span>
                  </div>
                )}
                
                {content.releaseDate && (
                  <div>
                    <span className="text-gray-400">Release Date: </span>
                    <span className="text-white">{content.releaseDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Content placeholder */}
            <div>
              <h3 className="netflix-row-title mb-6">More Like This</h3>
              <p className="text-muted">
                Discover similar {content.type.toLowerCase()}s you might enjoy.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}