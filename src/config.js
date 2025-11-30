import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 7000,
    cacheTtl: process.env.CACHE_TTL || 3600, // Still used as fallback
    convexUrl: process.env.CONVEX_URL,
    reddit: {
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        userAgent: process.env.REDDIT_USER_AGENT || 'StremioMovieLeaks/1.0.0',
        refreshToken: process.env.REDDIT_REFRESH_TOKEN,
    },
    tmdb: {
        apiKey: process.env.TMDB_API_KEY,
    }
};
