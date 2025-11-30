import reddit from '../../../src/reddit.js';

export default async function handler(req, res) {
    // Allow GET or POST for the refresh trigger
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        console.log('Internal refresh triggered...');
        const posts = await reddit.fetchLatestPosts();

        res.status(200).json({
            success: true,
            posts: posts,
            count: posts.length,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error in refresh endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
