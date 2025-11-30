import { manifest, catalogHandler, metaHandler, streamHandler } from '../../src/addon.js';

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { resource, type, id, extra } = req.query;

    // If no resource is provided, or it looks like manifest.json
    if (!resource || req.url.includes('manifest.json')) {
        res.status(200).json(manifest);
        return;
    }

    try {
        let extraObj = {};
        if (extra) {
            // Stremio passes extra args as key=value pairs in the path
            const params = new URLSearchParams(extra);
            for (const [key, value] of params) {
                extraObj[key] = value;
            }
        }

        const args = { type, id, extra: extraObj };
        let response = null;

        console.log(`Handling request: resource=${resource}, type=${type}, id=${id}`);

        if (resource === 'catalog') {
            response = await catalogHandler(args);
        } else if (resource === 'meta') {
            response = await metaHandler(args);
        } else if (resource === 'stream') {
            response = await streamHandler(args);
        } else {
            res.status(404).json({ error: `Resource '${resource}' not supported` });
            return;
        }

        if (response) {
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Not found' });
        }

    } catch (error) {
        console.error('Error handling addon request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
