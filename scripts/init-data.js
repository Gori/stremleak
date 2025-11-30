import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import reddit from '../src/reddit.js';
import config from '../src/config.js';

async function main() {
    console.log('Initializing data...');

    // 1. Fetch from Reddit
    console.log('Fetching from Reddit...');
    const posts = await reddit.fetchLatestPosts();
    console.log(`Fetched ${posts.length} posts.`);

    if (posts.length === 0) {
        console.log('No posts found. Check Reddit credentials.');
        return;
    }

    // 2. Push to Convex
    console.log('Pushing to Convex...');
    if (!config.convexUrl) {
        console.error('CONVEX_URL is not defined.');
        return;
    }

    const client = new ConvexHttpClient(config.convexUrl);

    try {
        await client.mutation(api.mutations.storePosts, { posts });
        console.log('Successfully stored posts in Convex.');
    } catch (error) {
        console.error('Error storing posts in Convex:', error);
    }
}

main().catch(console.error);
