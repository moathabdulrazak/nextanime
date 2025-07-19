'use client';

import { AnimeCard } from '@/components/AnimeCard';
import { MovieCard } from '@/components/MovieCard';
import { Navbar } from '@/components/Navbar';
import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play, Info, ChevronRight, ChevronLeft, TrendingUp, Star, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<any>(null);

  // Multiple data fetching for rich content
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => movieAPI.getTrending(),
  });

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ['search-movies-popular'],
    queryFn: () => movieAPI.searchMovies('popular', 1),
  });

  const { data: actionMovies, isLoading: actionLoading } = useQuery({
    queryKey: ['search-movies-action'],
    queryFn: () => movieAPI.searchMovies('action', 1),
  });

  const { data: comedyMovies, isLoading: comedyLoading } = useQuery({
    queryKey: ['search-movies-comedy'],
    queryFn: () => movieAPI.searchMovies('comedy', 1),
  });

  const { data: popularAnime, isLoading: animeLoading } = useQuery({
    queryKey: ['trending-anime'],
    queryFn: () => movieAPI.searchAnime('popular', 1),
  });

  const { data: actionAnime, isLoading: actionAnimeLoading } = useQuery({
    queryKey: ['action-anime'],
    queryFn: () => movieAPI.searchAnime('action', 1),
  });

  const { data: tvShows, isLoading: tvLoading } = useQuery({
    queryKey: ['search-tv-popular'],
    queryFn: () => movieAPI.searchMovies('tv series', 1),
  });

  // Set featured content from trending
  useEffect(() => {
    if (trending?.results && trending.results.length > 0) {
      setFeaturedContent(trending.results[0]);
    }
  }, [trending]);

  const NetflixRow = ({ 
    title, 
    items, 
    isLoading, 
    icon, 
    size = 'medium',
    href
  }: { 
    title: string; 
    items: any[]; 
    isLoading: boolean; 
    icon?: React.ReactNode;
    size?: 'small' | 'medium' | 'large';
    href?: string;
  }) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
      }
    }, []);
    
    const cardWidth = {
      small: isMobile ? 140 : 192, // Smaller on mobile
      medium: isMobile ? 160 : 256,  
      large: isMobile ? 180 : 320
    };
    
    const cardWidthClass = {
      small: isMobile ? 'w-35' : 'w-48',
      medium: isMobile ? 'w-40' : 'w-64',
      large: isMobile ? 'w-45' : 'w-80'
    };
    
    const skeletonWidth = {
      small: isMobile ? 'w-35 h-52' : 'w-48 h-72',
      medium: isMobile ? 'w-40 h-60' : 'w-64 h-96', 
      large: isMobile ? 'w-45 h-68' : 'w-80 h-[480px]'
    };

    const scroll = (direction: 'left' | 'right') => {
      const container = scrollRef.current;
      if (!container) return;
      
      const scrollAmount = cardWidth[size] + (isMobile ? 12 : 16); // Smaller gap on mobile
      const cardsToScroll = isMobile ? 2 : 3; // Scroll fewer cards on mobile
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount * cardsToScroll)
        : scrollPosition + scrollAmount * cardsToScroll;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      
      setScrollPosition(newPosition);
    };

    const canScrollLeft = scrollPosition > 0;
    const canScrollRight = items && scrollPosition < (items.length * (cardWidth[size] + 16) - (scrollRef.current?.clientWidth || 0));

    return (
      <section className="mb-8 md:mb-16">
        <div className="px-3 md:px-12">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              {icon && <div className="text-white">{icon}</div>}
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white">{title}</h2>
            </div>
            {href && (
              <Link 
                href={href}
                className="flex items-center gap-1 md:gap-2 text-white/70 hover:text-white transition-colors group text-sm md:text-base"
              >
                <span className="font-medium hidden sm:inline">View All</span>
                <span className="font-medium sm:hidden">All</span>
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
          
          <div className="relative" style={{ isolation: 'isolate' }}>
            {/* Left Navigation Button */}
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scroll('left')}
                className={`absolute top-1/2 -translate-y-1/2 z-50 bg-black/90 hover:bg-black rounded-full flex items-center justify-center opacity-60 md:opacity-30 hover:opacity-100 active:opacity-100 transition-all duration-300 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 shadow-2xl ${
                  isMobile ? '-left-2 w-10 h-10' : '-left-6 w-14 h-14'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                <ChevronLeft className={isMobile ? "w-5 h-5 text-white" : "w-7 h-7 text-white"} />
              </motion.button>
            )}
            
            {/* Right Navigation Button */}
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scroll('right')}
                className={`absolute top-1/2 -translate-y-1/2 z-50 bg-black/90 hover:bg-black rounded-full flex items-center justify-center opacity-60 md:opacity-30 hover:opacity-100 active:opacity-100 transition-all duration-300 backdrop-blur-sm border-2 border-white/20 hover:border-white/40 shadow-2xl ${
                  isMobile ? '-right-2 w-10 h-10' : '-right-6 w-14 h-14'
                }`}
                style={{ pointerEvents: 'auto' }}
              >
                <ChevronRight className={isMobile ? "w-5 h-5 text-white" : "w-7 h-7 text-white"} />
              </motion.button>
            )}
            
            {isLoading ? (
              <div className="flex space-x-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`${skeletonWidth[size]} rounded-lg flex-shrink-0 loading-skeleton`} />
                ))}
              </div>
            ) : (
              <div 
                ref={scrollRef}
                className={`flex overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth ${
                  isMobile ? 'space-x-3 pb-2' : 'space-x-4 pb-4'
                }`}
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  overscrollBehavior: 'none',
                  touchAction: 'pan-x',
                  WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
                }}
                onWheel={(e) => {
                  // Prevent vertical scrolling, allow horizontal
                  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                    e.preventDefault();
                  }
                }}
              >
                {items?.map((item, index) => (
                  <div key={`${item.id}-${index}`} className={`flex-shrink-0 ${cardWidthClass[size]}`}>
                    {item.type === 'Anime' ? (
                      <AnimeCard anime={item} index={index} size={isMobile ? 'small' : size} />
                    ) : (
                      <MovieCard movie={item} index={index} size={isMobile ? 'small' : size} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      {/* Enhanced Netflix-style Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        {featuredContent && (
          <>
            {/* Background Image with parallax effect */}
            <motion.div 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={featuredContent.image}
                alt={featuredContent.title}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
            </motion.div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/10 rounded-full"
                  initial={{ 
                    x: Math.random() * 1920,
                    y: Math.random() * 1080,
                    opacity: 0
                  }}
                  animate={{
                    y: -100,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    delay: Math.random() * 10,
                  }}
                />
              ))}
            </div>

            {/* Hero Content */}
            <div className="relative z-10 px-4 md:px-12 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {/* Enhanced Content Type Badge */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-lg border border-white/20">
                    <Star className="w-4 h-4" />
                    {featuredContent.type}
                  </span>
                </motion.div>

                {/* Enhanced Title */}
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-2xl"
                >
                  {featuredContent.title}
                </motion.h1>

                {/* Meta info */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-6 mb-6 text-white/80"
                >
                  {featuredContent.releaseDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {new Date(featuredContent.releaseDate).getFullYear()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">HD</span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 rounded text-sm font-medium backdrop-blur-sm">
                    Trending #1
                  </div>
                </motion.div>

                {/* Enhanced Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl drop-shadow-lg"
                >
                  {featuredContent.description || `Experience ${featuredContent.title} in stunning quality with immersive visuals and crystal-clear audio. Available now with multiple language options and premium features.`}
                </motion.p>

                {/* Enhanced Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    href={`/${featuredContent.type === 'Anime' ? 'anime' : featuredContent.type === 'Movie' ? 'movie' : 'tv'}/watch-${featuredContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${featuredContent.id}`}
                    className="group inline-flex items-center gap-3 bg-white text-black font-bold px-8 py-4 rounded-md hover:bg-white/90 transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:scale-105"
                  >
                    <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    Play Now
                  </Link>
                  <Link
                    href={`/${featuredContent.type === 'Anime' ? 'anime' : featuredContent.type === 'Movie' ? 'movie' : 'tv'}/watch-${featuredContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${featuredContent.id}`}
                    className="group inline-flex items-center gap-3 bg-gray-600/70 text-white font-bold px-8 py-4 rounded-md hover:bg-gray-600/90 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 hover:scale-105"
                  >
                    <Info className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    More Info
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}

        {/* Enhanced Fallback Hero */}
        {!featuredContent && !trendingLoading && (
          <div className="relative z-10 px-4 md:px-12 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 bg-clip-text text-transparent mb-8">
                FlixStream
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl leading-relaxed">
                Unlimited movies, TV shows and anime. Stream anywhere, anytime. Premium quality entertainment at your fingertips.
              </p>
              <Link href="/trending" className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-md hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-2xl hover:scale-105">
                <Play className="w-6 h-6 fill-current" />
                Start Watching
              </Link>
            </motion.div>
          </div>
        )}
      </section>

      {/* Enhanced Netflix-style Content Rows */}
      <div className="relative z-10 -mt-40 pb-20">
        <NetflixRow 
          title="Trending Now" 
          items={trending?.results || []} 
          isLoading={trendingLoading}
          icon={<TrendingUp className="w-6 h-6 text-red-500" />}
          size="large"
          href="/trending"
        />
        
        <NetflixRow 
          title="Popular Movies" 
          items={popularMovies?.results || []} 
          isLoading={moviesLoading}
          icon={<Star className="w-6 h-6 text-yellow-500" />}
          size="medium"
          href="/movies"
        />
        
        <NetflixRow 
          title="Anime Collection" 
          items={popularAnime?.results || []} 
          isLoading={animeLoading}
          icon={<div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />}
          size="medium"
          href="/anime"
        />
        
        <NetflixRow 
          title="Action Movies" 
          items={actionMovies?.results || []} 
          isLoading={actionLoading}
          icon={<div className="w-6 h-6 bg-red-500 rounded-full" />}
          size="small"
          href="/movies"
        />
        
        <NetflixRow 
          title="TV Series" 
          items={tvShows?.results || []} 
          isLoading={tvLoading}
          icon={<Clock className="w-6 h-6 text-blue-500" />}
          size="medium"
          href="/tv"
        />
        
        <NetflixRow 
          title="Comedy Movies" 
          items={comedyMovies?.results || []} 
          isLoading={comedyLoading}
          icon={<div className="w-6 h-6 bg-yellow-500 rounded-full" />}
          size="small"
          href="/movies"
        />
        
        <NetflixRow 
          title="Action Anime" 
          items={actionAnime?.results || []} 
          isLoading={actionAnimeLoading}
          icon={<div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />}
          size="small"
          href="/anime"
        />
      </div>

      {/* Enhanced Brand Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="flex items-center gap-3 px-6 py-3 bg-black/90 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-white">FlixStream</span>
          <span className="text-xs text-purple-400 font-medium">Premium</span>
        </div>
      </motion.div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}