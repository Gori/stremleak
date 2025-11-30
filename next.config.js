/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            },
            {
                // Allow CORS for the root path and other paths if they are rewritten to API
                source: "/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
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
