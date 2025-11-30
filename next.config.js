/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                // Apply comprehensive CORS headers to all routes for Stremio compatibility
                source: "/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/manifest.json',
                destination: '/api/addon',
            },
            {
                source: '/:resource/:type/:id.json',
                destination: '/api/addon?resource=:resource&type=:type&id=:id',
            },
            {
                source: '/:resource/:type/:id/:extra.json',
                destination: '/api/addon?resource=:resource&type=:type&id=:id&extra=:extra',
            },
        ];
    },
}

export default nextConfig;
