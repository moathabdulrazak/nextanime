'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tv, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TVPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: tvShows, isLoading, error } = useQuery({
    queryKey: ['tv-shows', currentPage],
    queryFn: () => movieAPI.searchMovies('tv series', currentPage),
  });

  const { data: popularTV, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-tv', currentPage],
    queryFn: () => movieAPI.searchMovies('tv', currentPage),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Tv className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-black text-white">TV Shows</h1>
          </div>
          <p className="text-sm md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Binge-watch your favorite TV series and discover new shows. From drama to comedy, action to documentaries.
          </p>
        </motion.div>

        {/* Popular TV Shows Section */}
        <section className="mb-8 md:mb-16">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-8">Popular TV Shows</h2>
          {popularLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-48 md:h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
              {popularTV?.results?.slice(0, 12).map((show, index) => (
                <MovieCard key={show.id} movie={show} index={index} size="small" />
              ))}
            </div>
          )}
        </section>

        {/* All TV Shows Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">All TV Shows</h2>
            <span className="text-white/50">Page {currentPage} of {totalPages}</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-72 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Failed to load TV shows</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {tvShows?.results?.map((show, index) => (
                <MovieCard key={`${show.id}-${currentPage}`} movie={show} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 pb-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {/* Show page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
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
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}