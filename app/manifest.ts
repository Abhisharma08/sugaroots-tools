import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TheSugaRoots Tools',
        short_name: 'TheSugaRoots',
        description: 'Your personal health and fitness dashboard.',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        background_color: '#fafafa',
        theme_color: '#2563eb',
        icons: [
            { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
            { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
        ],
    };
}
