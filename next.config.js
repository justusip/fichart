/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    webpack5: true,
    webpack: (config) => {
        config.resolve.fallback = {fs: false};
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/data_alpaca_markets/:path*',
                destination: 'https://data.alpaca.markets/:path*' // Proxy to Backend
            }
        ];
    }
};
