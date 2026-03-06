import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Vercel handles image optimization natively
    images: {
        unoptimized: false,
    },
    // Strict mode for better React debugging
    reactStrictMode: true,
    // Disable x-powered-by header for security
    poweredByHeader: false,
};

export default nextConfig;
