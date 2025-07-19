'use client';

import { AnimeCard } from '@/components/AnimeCard';
import { MovieCard } from '@/components/MovieCard';
import { Navbar } from '@/components/Navbar';
import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function PopularPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Get popular movies, TV shows, and anime
  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ['popular-movies', currentPage],
    queryFn: () => movieAPI.searchMovies('popular', currentPage),
  });

  const { data: popularTV, isLoading: tvLoading } = useQuery({
    queryKey: ['popular-tv', currentPage],
    queryFn: () => movieAPI.searchMovies('tv', currentPage),
  });

  const { data: popularAnime, isLoading: animeLoading } = useQuery({
    queryKey: ['popular-anime', currentPage],
    queryFn: () => movieAPI.searchAnime('popular', currentPage),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = 20;
  const isLoading = moviesLoading || tvLoading || animeLoading;

  // Combine all popular content
  const allPopularContent = [
    ...(popularMovies?.results || []),
    ...(popularTV?.results || []),
    ...(popularAnime?.results || [])
  ].slice(0, 18); // Limit to 18 items per page

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
            <h1 className="text-4xl md:text-6xl font-black text-white">Popular</h1>
          </div>
          <p className="text-xl text-white/70 max-w-2xl">
            All-time fan favorites and must-watch content. The most popular movies, TV shows, and anime.
          </p>
        </motion.div>

        {/* Popular Movies Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Popular Movies</h2>
          {moviesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularMovies?.results?.slice(0, 6).map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Popular TV Shows Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Popular TV Shows</h2>
          {tvLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularTV?.results?.slice(0, 6).map((show, index) => (
                <MovieCard key={show.id} movie={show} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Popular Anime Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Popular Anime</h2>
          {animeLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {popularAnime?.results?.slice(0, 6).map((anime, index) => (
                <AnimeCard key={anime.id} anime={anime} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* All Popular Content */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">All Popular Content</h2>
            <span className="text-white/50">Page {currentPage} of {totalPages}</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="loading-skeleton w-full h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {allPopularContent.map((item, index) => (
                <MovieCard key={`${item.id}-${currentPage}`} movie={item} index={index} />
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
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-yellow-600 text-white'
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