/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/stalls',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
