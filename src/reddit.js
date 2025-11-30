import Snoowrap from 'snoowrap';
import config from './config.js';
import tmdb from './tmdb.js';

let r;

try {
    if (config.reddit.clientId && config.reddit.clientSecret && config.reddit.refreshToken) {
        r = new Snoowrap({
            userAgent: config.reddit.userAgent,
            clientId: config.reddit.clientId,
            clientSecret: config.reddit.clientSecret,
            refreshToken: config.reddit.refreshToken,
        });
    } else {
        console.warn('Reddit credentials not fully configured. Addon will fail to fetch posts.');
    }
} catch (error) {
    console.error('Failed to initialize Snoowrap:', error);
}

/**
 * Extract IMDb ID from a Reddit post
 * Looks for IMDb links in post.selftext or post.url
 * @param {Object} post - Reddit post object
 * @returns {string|null} - IMDb ID (e.g., 'tt1234567') or null if not found
 */
function extractImdbId(post) {
    // Check selftext first, then url
    const text = post.selftext || post.url || '';

    // Match IMDb ID pattern: tt followed by 7-8 digits
    const match = text.match(/tt\d{7,8}/);
    return match ? match[0] : null;
}

/**
 * Parse clean movie title by removing year suffix
 * @param {string} title - Original title (e.g., "Tron: Ares (2025)")
 * @returns {string} - Clean title (e.g., "Tron: Ares")
 */
function parseMovieTitle(title) {
    // Remove year in parentheses at the end of the title
    return title.replace(/\s*\(\d{4}\)\s*$/, '').trim();
}

/**
 * Fetch latest posts from Reddit (no caching - used by Convex refresh)
 * @returns {Array} - Array of mapped posts with order index
 */
async function fetchLatestPosts() {
    try {
        console.log('Fetching new posts from r/MovieLeaks...');
        if (!r) {
            console.error('Snoowrap instance (r) is not initialized!');
            return [];
        }
        const posts = await r.getSubreddit('MovieLeaks').getNew({ limit: 100 });
        console.log(`Fetched ${posts.length} posts from Reddit.`);

        // Filter out posts without IMDb ID
        const validPosts = posts.filter(post => {
            const hasImdb = extractImdbId(post) !== null;
            if (!hasImdb) {
                console.log(`Ignoring post without IMDb ID: "${post.title}"`);
            }
            return hasImdb;
        });
        console.log(`Filtered down to ${validPosts.length} valid posts with IMDb IDs.`);

        // Map posts with TMDB data fetching
        const mappedPostsPromises = validPosts.map(async (post, index) => {
            const imdbId = extractImdbId(post);
            const cleanTitle = parseMovieTitle(post.title);

            // Use IMDb ID if found, otherwise fall back to custom ID
            const stremioId = imdbId || `movieleaks:${post.id}`;

            // Try to fetch TMDB data if we have an IMDb ID
            let tmdbData = null;
            if (imdbId) {
                console.log(`Found IMDb ID ${imdbId} for post: ${cleanTitle}`);
                tmdbData = await tmdb.getMovieByImdbId(imdbId);
                if (tmdbData) {
                    console.log(`  → Fetched TMDB poster for ${cleanTitle}`);
                }
            } else {
                console.warn(`No IMDb ID found for post: ${post.title}`);
            }


            // Poster is REQUIRED for catalog items in Stremio - use placeholder if none available
            const posterUrl = tmdbData?.poster ||
                (isValidUrl(post.thumbnail) ? post.thumbnail : null) ||
                'https://via.placeholder.com/300x450/1a1a2e/eee?text=No+Poster';

            // Convert TMDB date string (YYYY-MM-DD) to ISO 8601 if needed
            let releasedDate = new Date(post.created_utc * 1000).toISOString();
            if (tmdbData?.releaseDate) {
                // TMDB returns YYYY-MM-DD, convert to ISO 8601
                releasedDate = new Date(tmdbData.releaseDate + 'T00:00:00.000Z').toISOString();
            }

            return {
                // Convex storage fields
                redditId: post.id,
                redditTitle: post.title,
                redditUrl: post.url,
                redditPermalink: `https://reddit.com${post.permalink}`,
                redditThumbnail: post.thumbnail,
                redditSelftext: post.selftext || '',
                redditCreatedUtc: post.created_utc,
                stremioId: stremioId,
                name: cleanTitle,
                type: 'movie',
                poster: posterUrl,
                description: tmdbData?.overview || post.selftext || post.url,
                released: releasedDate,
                background: tmdbData?.backdrop || (isValidUrl(post.url) && isImageUrl(post.url) ? post.url : undefined),
                orderIndex: index, // Position in /new/ feed (0 = newest)
            };
        });

        // Wait for all TMDB fetches to complete
        const mappedPosts = await Promise.all(mappedPostsPromises);

        console.log(`Mapped ${mappedPosts.length} posts.`);

        return mappedPosts;
    } catch (error) {
        console.error('Error fetching posts from Reddit:', error);
        if (error.statusCode) {
            console.error('Status Code:', error.statusCode);
        }
        return [];
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isImageUrl(url) {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}

export default {
    fetchLatestPosts
};
