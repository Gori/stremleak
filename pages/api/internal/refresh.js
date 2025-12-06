import reddit from '../../../src/reddit.js';

export default async function handler(req, res) {
    // Allow GET or POST for the refresh trigger
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Check for secret token to bypass Vercel deployment protection
    const authToken = req.headers['x-refresh-token'] || req.query.token;
    const expectedToken = process.env.REFRESH_SECRET_TOKEN;

    if (expectedToken && authToken !== expectedToken) {
        console.error('Unauthorized refresh attempt - invalid or missing token');
        res.status(401).json({ error: 'Unauthorized' });
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
