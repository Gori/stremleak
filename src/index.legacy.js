import sdk from 'stremio-addon-sdk';
const { getRouter } = sdk;
import express from 'express';
import addonInterface from './addon.js';
import reddit from './reddit.js';
import config from './config.js';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors());

// Internal refresh endpoint for Convex to call
app.get('/internal/refresh', async (req, res) => {
    try {
        console.log('Internal refresh triggered by Convex...');
        const posts = await reddit.fetchLatestPosts();

        res.json({
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
});

// Mount the addon router
const addonRouter = getRouter(addonInterface);
app.use('/', addonRouter);

// Start server
app.listen(config.port, () => {
    console.log(`Addon active on http://localhost:${config.port}`);
    console.log(`Manifest URL: http://localhost:${config.port}/manifest.json`);
    console.log(`Refresh endpoint: http://localhost:${config.port}/internal/refresh`);
});
