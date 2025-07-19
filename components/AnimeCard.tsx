'use client';

import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
import { Play, Plus, ThumbsUp, ChevronDown, Star, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MovieResult } from '@/lib/api';

interface AnimeCardProps {
  anime: MovieResult;
  index?: number;
  size?: 'small' | 'medium' | 'large';
}

export function AnimeCard({ anime, index = 0, size = 'medium' }: AnimeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sizeClasses = {
    small: isMobile ? 'w-35' : 'w-36',
    medium: isMobile ? 'w-40' : 'w-48',
    large: isMobile ? 'w-45' : 'w-60'
  };

  return (
    <div
      className={`group relative ${sizeClasses[size]} flex-shrink-0 cursor-pointer transform transition-all duration-300 hover:scale-105`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link href={`/anime/watch-${anime.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${anime.id}`}>
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 shadow-2xl shadow-black/50">
            {!imageError ? (
              <Image
                src={anime.image}
                alt={anime.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-zinc-900 to-black">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-purple-300 text-sm font-medium line-clamp-2">{anime.title}</p>
                </div>
              </div>
            )}
            
            {/* Anime-specific gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Anime Badge */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className="px-2 py-1 text-xs font-bold rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                ANIME
              </span>
            </div>

            {/* Sub/Dub indicator */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-white text-xs font-medium">SUB</span>
              </div>
            </div>

            {/* Play button overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 transform transition-all duration-300 hover:scale-110"
              >
                <Play className="w-7 h-7 text-white ml-1 fill-current" />
              </div>
            </div>

            {/* Bottom info on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 drop-shadow-lg">
                {anime.title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                {anime.releaseDate && (
                  <span className="text-purple-400 font-medium">
                    {new Date(anime.releaseDate).getFullYear()}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-purple-600/30 text-purple-200 rounded text-xs">
                  SUB & DUB
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Netflix-style expanded info card - Hidden on mobile */}
        {!isMobile && (
          <div
            className={`absolute top-full left-0 right-0 z-20 mt-2 bg-zinc-900/95 backdrop-blur-xl rounded-lg p-4 shadow-2xl border border-purple-500/20 transition-all duration-200 transform ${isHovered ? 'opacity-100 scale-100 -translate-y-2' : 'opacity-0 scale-95 translate-y-0'}`}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href={`/anime/watch-${anime.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${anime.id}`}
              className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-purple-500/20"
            >
              <Play className="w-4 h-4 text-white ml-0.5 fill-current" />
            </Link>
            <button className="w-9 h-9 border-2 border-purple-500/50 hover:border-purple-400 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-purple-500/10">
              <Plus className="w-4 h-4 text-purple-400 hover:text-purple-300" />
            </button>
            <button className="w-9 h-9 border-2 border-purple-500/50 hover:border-purple-400 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-purple-500/10">
              <ThumbsUp className="w-4 h-4 text-purple-400 hover:text-purple-300" />
            </button>
            <div className="ml-auto">
              <Link
                href={`/anime/watch-${anime.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${anime.id}`}
                className="w-9 h-9 border-2 border-purple-500/50 hover:border-purple-400 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-purple-500/10"
              >
                <ChevronDown className="w-4 h-4 text-purple-400 hover:text-purple-300" />
              </Link>
            </div>
          </div>

          {/* Enhanced Meta Info */}
          <div className="flex items-center gap-3 text-xs mb-2">
            {anime.releaseDate && (
              <span className="text-purple-400 font-bold">
                {new Date(anime.releaseDate).getFullYear()}
              </span>
            )}
            <span className="px-2 py-0.5 bg-purple-600/30 text-purple-200 rounded text-xs font-medium">
              SUB & DUB
            </span>
            <span className="px-2 py-0.5 bg-zinc-700 text-white rounded text-xs font-medium">
              HD
            </span>
          </div>

          {/* Enhanced Description */}
          <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
            {anime.description || `Experience ${anime.title} with authentic Japanese voice acting and high-quality subtitles. Available in both subbed and dubbed versions with multiple language options.`}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}