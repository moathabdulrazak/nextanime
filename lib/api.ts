import axios from 'axios';

const TMDB_API_KEY = '88d2c735e36149b50c9d46f09826ec06';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const ANILIST_API_URL = 'https://graphql.anilist.co';

export interface MovieResult {
  id: string;
  title: string;
  image: string;
  url?: string;
  releaseDate?: string;
  duration?: string;
  type: 'Movie' | 'TV Series';
}

export interface MovieInfo extends MovieResult {
  description: string;
  geners: string[];
  casts: string[];
  tags: string[];
  production?: string;
  episodes?: Episode[];
  seasons?: number;
}

export interface Episode {
  id: string;
  title: string;
  number: number;
  season?: number;
  url?: string;
}

export interface StreamingLink {
  url: string;
  quality: string;
  isM3U8?: boolean;
  type?: string;
}

export interface Server {
  name: string;
  url: string;
}

export interface SearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: MovieResult[];
}

class MovieAPI {
  private tmdbAxios = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 10000,
    params: {
      api_key: TMDB_API_KEY
    }
  });

  private anilistAxios = axios.create({
    baseURL: ANILIST_API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  async searchMovies(query: string, page: number = 1): Promise<SearchResponse> {
    try {
      const { data } = await this.tmdbAxios.get('/search/multi', {
        params: { query, page }
      });
      
      const results = data.results.map((item: any) => ({
        id: item.id.toString(),
        title: item.title || item.name,
        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        releaseDate: item.release_date || item.first_air_date,
        type: item.media_type === 'movie' ? 'Movie' as const : 'TV Series' as const
      }));
      
      return {
        currentPage: data.page,
        hasNextPage: data.page < data.total_pages,
        results
      };
    } catch (error) {
      console.error('Search error:', error);
      return { currentPage: 1, hasNextPage: false, results: [] };
    }
  }

  async getTrending(): Promise<SearchResponse> {
    try {
      // Get trending movies/TV from TMDB
      const { data: tmdbData } = await this.tmdbAxios.get('/trending/all/week');
      
      // Get trending anime from AniList
      const animeQuery = `
        query {
          Page(page: 1, perPage: 10) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
              }
              startDate {
                year
                month
                day
              }
            }
          }
        }
      `;

      let animeResults = [];
      try {
        const { data: animeData } = await this.anilistAxios.post('', {
          query: animeQuery
        });
        
        animeResults = animeData.data.Page.media.map((anime: any) => ({
          id: anime.id.toString(),
          title: anime.title.english || anime.title.romaji || anime.title.native,
          image: anime.coverImage.large || '',
          releaseDate: anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '',
          type: 'Anime' as const
        }));
      } catch (animeError) {
        console.warn('Failed to fetch trending anime:', animeError);
      }
      
      const tmdbResults = tmdbData.results.map((item: any) => ({
        id: item.id.toString(),
        title: item.title || item.name,
        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
        releaseDate: item.release_date || item.first_air_date,
        type: item.media_type === 'movie' ? 'Movie' : 'TV Series'
      }));
      
      // Combine and shuffle results
      const allResults = [...tmdbResults, ...animeResults];
      
      return {
        currentPage: 1,
        hasNextPage: false,
        results: allResults
      };
    } catch (error) {
      console.error('Trending error:', error);
      return { currentPage: 1, hasNextPage: false, results: [] };
    }
  }

  async getMovieInfo(id: string): Promise<MovieInfo | null> {
    try {
      // Check if it's anime first
      if (id.includes('anime/')) {
        return this.getAnimeInfo(id);
      }
      
      // Determine if it's a movie or TV show based on the ID format
      const isMovie = !id.includes('tv/');
      const tmdbId = id.match(/\d+$/)?.[0] || id;
      
      if (isMovie) {
        console.log('Fetching movie info for TMDB ID:', tmdbId);
        const { data } = await this.tmdbAxios.get(`/movie/${tmdbId}`);
        return {
          id: data.id.toString(),
          title: data.title,
          image: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
          description: data.overview,
          releaseDate: data.release_date,
          duration: `${data.runtime} min`,
          type: 'Movie',
          geners: data.genres.map((g: any) => g.name),
          casts: [],
          tags: [],
          production: data.production_companies?.[0]?.name
        };
      } else {
        console.log('Fetching TV info for TMDB ID:', tmdbId);
        const { data } = await this.tmdbAxios.get(`/tv/${tmdbId}`);
        
        // Fetch all seasons
        const allEpisodes = [];
        const seasonCount = Math.min(data.number_of_seasons || 1, 10); // Limit to 10 seasons for performance
        
        for (let seasonNum = 1; seasonNum <= seasonCount; seasonNum++) {
          try {
            const seasonData = await this.tmdbAxios.get(`/tv/${tmdbId}/season/${seasonNum}`);
            const seasonEpisodes = seasonData.data.episodes.map((ep: any) => ({
              id: `${tmdbId}/season/${seasonNum}/episode/${ep.episode_number}`,
              title: ep.name,
              number: ep.episode_number,
              season: seasonNum
            }));
            allEpisodes.push(...seasonEpisodes);
          } catch (seasonError) {
            console.warn(`Failed to fetch season ${seasonNum}:`, seasonError);
          }
        }
        
        return {
          id: data.id.toString(),
          title: data.name,
          image: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
          description: data.overview,
          releaseDate: data.first_air_date,
          type: 'TV Series',
          geners: data.genres.map((g: any) => g.name),
          casts: [],
          tags: [],
          production: data.production_companies?.[0]?.name,
          episodes: allEpisodes,
          seasons: seasonCount
        };
      }
    } catch (error) {
      console.error('Movie info error:', error);
      return null;
    }
  }

  async getServers(episodeId: string, mediaId: string): Promise<Server[]> {
    // Return embed servers directly
    return [
      { name: 'VidSrc', url: 'vidsrc' },
      { name: 'SuperEmbed', url: 'superembed' },
      { name: '2Embed', url: '2embed' }
    ];
  }

  // Legacy methods for compatibility with old anime pages
  async getPopular(page: number = 1): Promise<SearchResponse> {
    return this.getTrending(); // Use trending as fallback
  }

  async getRecentEpisodes(page: number = 1): Promise<SearchResponse> {
    return this.getTrending(); // Use trending as fallback
  }

  async searchAnime(query: string, page: number = 1): Promise<SearchResponse> {
    try {
      const searchQuery = `
        query ($search: String, $page: Int) {
          Page(page: $page, perPage: 20) {
            pageInfo {
              hasNextPage
              currentPage
            }
            media(search: $search, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
              }
              startDate {
                year
                month
                day
              }
              episodes
              format
            }
          }
        }
      `;

      const { data } = await this.anilistAxios.post('', {
        query: searchQuery,
        variables: { search: query, page }
      });

      const results = data.data.Page.media.map((anime: any) => ({
        id: anime.id.toString(),
        title: anime.title.english || anime.title.romaji || anime.title.native,
        image: anime.coverImage.large || '',
        releaseDate: anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '',
        type: 'Anime' as const
      }));

      return {
        currentPage: data.data.Page.pageInfo.currentPage,
        hasNextPage: data.data.Page.pageInfo.hasNextPage,
        results
      };
    } catch (error) {
      console.error('Anime search error:', error);
      return { currentPage: 1, hasNextPage: false, results: [] };
    }
  }

  async getAnimeInfo(id: string): Promise<MovieInfo | null> {
    try {
      // Extract AniList ID from URL format (anime/watch-naruto-46260)
      const anilistId = id.match(/(\d+)$/)?.[0] || id;
      console.log('Fetching anime info for AniList ID:', anilistId);
      
      const infoQuery = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
            }
            startDate {
              year
              month
              day
            }
            episodes
            genres
            studios {
              nodes {
                name
              }
            }
            format
          }
        }
      `;

      const { data } = await this.anilistAxios.post('', {
        query: infoQuery,
        variables: { id: parseInt(anilistId) }
      });

      const anime = data.data.Media;
      if (!anime) return null;

      // Generate episode list
      const episodes = [];
      if (anime.episodes) {
        for (let i = 1; i <= anime.episodes; i++) {
          episodes.push({
            id: `${anilistId}/episode/${i}`,
            title: `Episode ${i}`,
            number: i,
            season: 1
          });
        }
      }

      return {
        id: anime.id.toString(),
        title: anime.title.english || anime.title.romaji || anime.title.native,
        image: anime.coverImage.large || '',
        description: anime.description ? anime.description.replace(/<[^>]*>/g, '') : '',
        releaseDate: anime.startDate ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}` : '',
        type: 'Anime',
        geners: anime.genres || [],
        casts: [],
        tags: [],
        production: anime.studios?.nodes?.[0]?.name || '',
        episodes
      };
    } catch (error) {
      console.error('Anime info error:', error);
      return null;
    }
  }

  async getStreamingLinks(episodeId: string, mediaId: string = '', server: string = 'vidsrc'): Promise<StreamingLink[]> {
    try {
      const streamingLinks: StreamingLink[] = [];
      
      // Extract ID and type from the mediaId or episodeId
      let id = '';
      let type: 'movie' | 'tv' | 'anime' = 'movie';
      let season = '1';
      let episode = '1';
      let isAnime = false;
      
      // Check if it's anime (contains 'anime' in the path)
      if (mediaId.includes('anime/') || episodeId.includes('anime/')) {
        isAnime = true;
        type = 'anime';
        
        // Extract AniList ID from mediaId (format: anime/watch-name-12345)
        const aniMatch = (mediaId || episodeId).match(/anime\/.*?(\d+)/);
        if (aniMatch) {
          id = aniMatch[1];
        }
        
        // Extract episode number
        if (episodeId) {
          const epMatch = episodeId.match(/episode[/-](\d+)/i) || episodeId.match(/ep[/-](\d+)/i) || episodeId.match(/(\d+)$/);
          if (epMatch) {
            episode = epMatch[1];
          }
        }
      } else {
        // Movie or TV show - extract TMDB ID
        if (mediaId) {
          const idMatch = mediaId.match(/(\d+)$/);
          if (idMatch) {
            id = idMatch[1];
            type = mediaId.includes('tv/') ? 'tv' : 'movie';
          }
        }
        
        // If no ID from mediaId, try episodeId
        if (!id && episodeId) {
          const idMatch = episodeId.match(/(\d+)/);
          if (idMatch) {
            id = idMatch[1];
          }
        }
        
        // Extract season and episode for TV shows
        if (type === 'tv' && episodeId) {
          // Check for format: tmdbId/season/X/episode/Y
          const tvMatch = episodeId.match(/season\/(\d+)\/episode\/(\d+)/);
          if (tvMatch) {
            season = tvMatch[1];
            episode = tvMatch[2];
          }
        }
      }
      
      if (!id) {
        console.error('Could not extract ID from:', { episodeId, mediaId });
        return [];
      }
      
      console.log('Extracted info:', { id, type, season, episode, isAnime, episodeId, mediaId });
      
      // Generate embed URLs based on type
      if (type === 'anime') {
        // VidSrc Anime - Sub
        streamingLinks.push({
          url: `https://vidsrc.icu/embed/anime/${id}/${episode}/0/1`,
          quality: 'HD (Sub)',
          isM3U8: false,
          type: 'iframe'
        });
        
        // VidSrc Anime - Dub
        streamingLinks.push({
          url: `https://vidsrc.icu/embed/anime/${id}/${episode}/1/1`,
          quality: 'HD (Dub)',
          isM3U8: false,
          type: 'iframe'
        });
      } else if (type === 'movie') {
        // VidSrc
        streamingLinks.push({
          url: `https://vidsrc.icu/embed/movie/${id}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
        
        // SuperEmbed
        streamingLinks.push({
          url: `https://multiembed.mov/?video_id=${id}&tmdb=1`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
        
        // 2Embed
        streamingLinks.push({
          url: `https://www.2embed.cc/embed/${id}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
        
        // Autoembed
        streamingLinks.push({
          url: `https://player.autoembed.cc/embed/movie/${id}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
      } else {
        // TV Shows
        // VidSrc
        streamingLinks.push({
          url: `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
        
        // SuperEmbed
        streamingLinks.push({
          url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
        
        // 2Embed
        streamingLinks.push({
          url: `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
        
        // Autoembed
        streamingLinks.push({
          url: `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
          quality: 'HD',
          isM3U8: false,
          type: 'iframe'
        });
      }
      
      console.log(`Generated ${streamingLinks.length} streaming sources`);
      return streamingLinks;
      
    } catch (error) {
      console.error('Streaming links error:', error);
      return [];
    }
  }
}

export const movieAPI = new MovieAPI();

// Legacy alias for compatibility
export const animeAPI = movieAPI;