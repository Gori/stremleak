import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import config from './config.js';

// Initialize Convex client
let convexClient = null;
if (config.convexUrl) {
    convexClient = new ConvexHttpClient(config.convexUrl);
} else {
    console.warn('CONVEX_URL not set. Addon will not function properly.');
}

export const manifest = {
    id: 'org.stremio.movieleaks',
    version: '1.0.0',
    name: 'MovieLeaks',
    description: 'Latest leaks from r/MovieLeaks',
    logo: `${config.publicUrl || 'http://localhost:3000'}/images/logo.webp`,
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie'],
    catalogs: [
        {
            type: 'movie',
            id: 'movieleaks',
            name: 'Movie Leaks: New',
            extra: [{ name: 'skip' }]
        },
        {
            type: 'movie',
            id: 'movieleaks-top-monthly',
            name: 'Movie Leaks: Top Monthly',
            extra: [{ name: 'skip' }]
        }
    ],
    idPrefixes: ['tt', 'movieleaks:']
};

export async function catalogHandler({ type, id, extra }) {
    if (type === 'movie' && (id === 'movieleaks' || id === 'movieleaks-top-monthly')) {
        if (!convexClient) {
            return { metas: [] };
        }

        try {
            // TODO: Handle extra.skip for pagination if Convex query supports it
            let posts;
            if (id === 'movieleaks-top-monthly') {
                posts = await convexClient.query(api.queries.getTopMonthlyPosts, {});
            } else {
                posts = await convexClient.query(api.queries.getPosts, {});
            }
            return { metas: posts };
        } catch (error) {
            console.error('Error fetching posts from Convex:', error);
            return { metas: [] };
        }
    }
    return { metas: [] };
}

export async function metaHandler({ type, id }) {
    if (type === 'movie' && (id.startsWith('movieleaks:') || id.startsWith('tt'))) {
        if (!convexClient) {
            return { meta: {} };
        }

        try {
            const post = await convexClient.query(api.queries.getPostById, { id });

            if (post) {
                return { meta: post };
            }
        } catch (error) {
            console.error('Error fetching post from Convex:', error);
        }
    }
    return { meta: {} };
}

export async function streamHandler({ type, id }) {
    if (type === 'movie' && (id.startsWith('movieleaks:') || id.startsWith('tt'))) {
        if (!convexClient) {
            return { streams: [] };
        }

        try {
            const post = await convexClient.query(api.queries.getPostById, { id });

            if (post && post.originalPost) {
                return {
                    streams: [
                        {
                            title: 'Open Reddit Thread',
                            externalUrl: post.originalPost.permalink
                        },
                        {
                            title: 'Open Link',
                            externalUrl: post.originalPost.url
                        }
                    ]
                };
            }
        } catch (error) {
            console.error('Error fetching post from Convex:', error);
        }
    }
    return { streams: [] };
}

export default {
    manifest,
    catalogHandler,
    metaHandler,
    streamHandler
};
