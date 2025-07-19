'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MoviesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', currentPage],
    queryFn: () => movieAPI.searchMovies('movie', currentPage),
  });

  const { data: popularMovies, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-movies', currentPage],
    queryFn: () => movieAPI.searchMovies('popular', currentPage),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = 20; // Limit to 20 pages for better UX

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-16 md:pt-20 px-3 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-12"
        >
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Film className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-black text-white">Movies</h1>
          </div>
          <p className="text-sm md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Discover thousands of movies from blockbusters to indie films. High-quality streaming with multiple subtitle options.
          </p>
        </motion.div>

        {/* Popular Movies Section */}
        <section className="mb-8 md:mb-16">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-8">Popular Movies</h2>
          {popularLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-48 md:h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
              {popularMovies?.results?.slice(0, 12).map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} size="small" />
              ))}
            </div>
          )}
        </section>

        {/* All Movies Section */}
        <section className="mb-8 md:mb-16">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white">All Movies</h2>
            <span className="text-xs md:text-sm text-white/50">Page {currentPage} of {totalPages}</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-48 md:h-72 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-red-500 text-sm md:text-lg">Failed to load movies</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
              {movies?.results?.map((movie, index) => (
                <MovieCard key={`${movie.id}-${currentPage}`} movie={movie} index={index} size="small" />
              ))}
            </div>
          )}
        </section>

        {/* Mobile-friendly Pagination */}
        <div className="flex items-center justify-center gap-2 md:gap-4 pb-8 md:pb-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Show fewer page numbers on mobile */}
            {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 1 + i, totalPages - 2 + i));
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-200 text-sm md:text-base ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}