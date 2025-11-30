import axios from 'axios';
import NodeCache from 'node-cache';
import config from './config.js';

// Cache TMDB responses for 24 hours (longer than Reddit cache since movie metadata is static)
const cache = new NodeCache({ stdTTL: 86400 });

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'; // w500 = 500px width posters

/**
 * Fetch movie details from TMDB using IMDb ID
 * @param {string} imdbId - IMDb ID (e.g., 'tt1234567')
 * @returns {Promise<Object|null>} - Movie details or null if not found/error
 */
async function getMovieByImdbId(imdbId) {
    if (!config.tmdb.apiKey) {
        console.warn('TMDB API key not configured, skipping poster fetch');
        return null;
    }

    // Check cache first
    const cached = cache.get(imdbId);
    if (cached) {
        return cached;
    }

    try {
        // TMDB's find endpoint allows searching by IMDb ID
        const response = await axios.get(`${TMDB_API_BASE}/find/${imdbId}`, {
            params: {
                api_key: config.tmdb.apiKey,
                external_source: 'imdb_id'
            }
        });

        const results = response.data.movie_results;
        if (results && results.length > 0) {
            const movie = results[0];
            const movieData = {
                title: movie.title,
                overview: movie.overview,
                poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
                backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
                releaseDate: movie.release_date,
                rating: movie.vote_average
            };

            // Cache the result
            cache.set(imdbId, movieData);
            return movieData;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching TMDB data for ${imdbId}:`, error.message);
        return null;
    }
}

export default {
    getMovieByImdbId
};
