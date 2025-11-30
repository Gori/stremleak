import sdk from 'stremio-addon-sdk';
const { addonBuilder } = sdk;
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

const manifest = {
    id: 'org.stremio.movieleaks',
    version: '1.0.0',
    name: 'MovieLeaks',
    description: 'Latest leaks from r/MovieLeaks',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie'],
    catalogs: [
        {
            type: 'movie',
            id: 'movieleaks',
            name: 'MovieLeaks (Reddit)',
            extra: [{ name: 'skip' }]
        }
    ],
    idPrefixes: ['tt', 'movieleaks:']
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
    if (type === 'movie' && id === 'movieleaks') {
        if (!convexClient) {
            return { metas: [] };
        }

        try {
            const posts = await convexClient.query(api.queries.getPosts, {});
            return { metas: posts };
        } catch (error) {
            console.error('Error fetching posts from Convex:', error);
            return { metas: [] };
        }
    }
    return { metas: [] };
});

builder.defineMetaHandler(async ({ type, id }) => {
    if (type === 'movie' && id.startsWith('movieleaks:') || id.startsWith('tt')) {
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
});

builder.defineStreamHandler(async ({ type, id }) => {
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
});

export default builder.getInterface();
