'use client';

import { AnimeCard } from '@/components/AnimeCard';
import { MovieCard } from '@/components/MovieCard';
import { movieAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [page, setPage] = useState(1);

  const { data: movieData, isLoading: movieLoading } = useQuery({
    queryKey: ['search-movies', query, page],
    queryFn: () => movieAPI.searchMovies(query, page),
    enabled: !!query,
  });

  const { data: animeData, isLoading: animeLoading } = useQuery({
    queryKey: ['search-anime', query, page],
    queryFn: () => movieAPI.searchAnime(query, page),
    enabled: !!query,
  });

  const isLoading = movieLoading || animeLoading;
  const allResults = [
    ...(movieData?.results || []),
    ...(animeData?.results || [])
  ];

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2">Search for Movies, TV Shows & Anime</h2>
          <p className="text-gray-400">Use the search bar above to find your favorite content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400">
          Found {allResults.length || 0} results for "{query}"
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="loading-skeleton aspect-[3/4] rounded-lg" />
          ))}
        </div>
      ) : allResults.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No results found for "{query}"</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allResults.map((item, index) => (
              item.type === 'Anime' ? (
                <AnimeCard key={`anime-${item.id}`} anime={item} index={index} />
              ) : (
                <MovieCard key={`movie-${item.id}`} movie={item} index={index} />
              )
            ))}
          </div>

          {(movieData?.hasNextPage || animeData?.hasNextPage) && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-primary hover:bg-primary-hover rounded-full transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}