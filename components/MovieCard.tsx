'use client';

import { MovieResult } from '@/lib/api';
// import { motion } from 'framer-motion';
import { Play, Plus, ThumbsUp, ChevronDown, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface MovieCardProps {
  movie: MovieResult;
  index: number;
  size?: 'small' | 'medium' | 'large';
}

export function MovieCard({ movie, index, size = 'medium' }: MovieCardProps) {
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
      <div
        className="relative"
      >
        <Link href={`/${movie.type === 'Movie' ? 'movie' : 'tv'}/watch-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`}>
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 shadow-2xl shadow-black/50">
            {!imageError ? (
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Play className="w-8 h-8 text-white/60" />
                  </div>
                  <p className="text-white/60 text-sm font-medium line-clamp-2">{movie.title}</p>
                </div>
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content Type Badge */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <span className={`px-2 py-1 text-xs font-bold rounded-md backdrop-blur-sm ${
                movie.type === 'Movie' 
                  ? 'bg-purple-600/90 text-white' 
                  : 'bg-yellow-500/90 text-black'
              }`}>
                {movie.type.toUpperCase()}
              </span>
            </div>

            {/* Rating badge */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">HD</span>
              </div>
            </div>

            {/* Play button overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div
                className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20 transform transition-all duration-300 hover:scale-110"
              >
                <Play className="w-7 h-7 text-black ml-1 fill-current" />
              </div>
            </div>

            {/* Bottom info on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 drop-shadow-lg">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                {movie.releaseDate && (
                  <span className="text-green-400 font-medium">
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                )}
                {movie.duration && (
                  <span className="text-white/80">{movie.duration}</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Netflix-style expanded info card - Hidden on mobile */}
        {!isMobile && (
          <div
            className={`absolute top-full left-0 right-0 z-20 mt-2 bg-zinc-900/95 backdrop-blur-xl rounded-lg p-4 shadow-2xl border border-zinc-700/50 transition-all duration-200 transform ${isHovered ? 'opacity-100 scale-100 -translate-y-2' : 'opacity-0 scale-95 translate-y-0'}`}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              href={`/${movie.type === 'Movie' ? 'movie' : 'tv'}/watch-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`}
              className="w-9 h-9 bg-white hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-white/20"
            >
              <Play className="w-4 h-4 text-black ml-0.5 fill-current" />
            </Link>
            <button className="w-9 h-9 border-2 border-zinc-500 hover:border-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10">
              <Plus className="w-4 h-4 text-zinc-400 hover:text-white" />
            </button>
            <button className="w-9 h-9 border-2 border-zinc-500 hover:border-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10">
              <ThumbsUp className="w-4 h-4 text-zinc-400 hover:text-white" />
            </button>
            <div className="ml-auto">
              <Link
                href={`/${movie.type === 'Movie' ? 'movie' : 'tv'}/watch-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${movie.id}`}
                className="w-9 h-9 border-2 border-zinc-500 hover:border-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
              >
                <ChevronDown className="w-4 h-4 text-zinc-400 hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Enhanced Meta Info */}
          <div className="flex items-center gap-3 text-xs mb-2">
            {movie.releaseDate && (
              <span className="text-green-400 font-bold">
                {new Date(movie.releaseDate).getFullYear()}
              </span>
            )}
            <span className="px-2 py-0.5 bg-zinc-700 text-white rounded text-xs font-medium">
              HD
            </span>
            {movie.duration && (
              <span className="text-zinc-300">{movie.duration}</span>
            )}
          </div>

          {/* Enhanced Description */}
          <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
            {`Experience ${movie.title} in stunning quality with crystal-clear visuals and immersive audio. Available with multiple subtitle options.`}
          </p>
        </div>
        )}
      </div>
    </div>
  );
}