import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if trying to access the dashboard or tools
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        // Check for the Firebase session cookie
        const sessionCookie = request.cookies.get('__session');

        // If no session cookie, redirect to login page
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Note: Full session verification happens in API routes using Firebase Admin SDK.
        // Middleware only does a quick cookie existence check for performance.
    }

    // If already logged in and trying to access the login page, redirect to dashboard
    if (request.nextUrl.pathname === '/login') {
        const sessionCookie = request.cookies.get('__session');
        if (sessionCookie) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

// Ensure the middleware only runs on specific paths
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
