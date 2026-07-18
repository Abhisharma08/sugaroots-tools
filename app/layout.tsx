import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PwaServiceWorker } from '@/components/PwaServiceWorker';

export const metadata: Metadata = {
    title: {
        default: 'SugaRoots Tools — Your Personal Fitness Hub',
        template: '%s | SugaRoots Tools',
    },
    description:
        'Track your goals, calculate your macros, and crush your fitness targets. BMR calculator, TDEE estimator, and weight loss planner in one place — exclusively for SugaRoots subscribers.',
    metadataBase: new URL('https://sugaroots-tools.vercel.app'),
    openGraph: {
        title: 'SugaRoots Tools',
        description: 'Your personal fitness hub — BMR, TDEE, weight loss planning and more.',
        type: 'website',
    },
    manifest: '/manifest.webmanifest',
    applicationName: 'SugaRoots Tools',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'SugaRoots',
    },
    icons: {
        apple: '/icon-192.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="antialiased" suppressHydrationWarning>
            <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <PwaServiceWorker />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
