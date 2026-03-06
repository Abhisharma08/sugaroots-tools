import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';

// POST: Create a session cookie from a Firebase ID token
export async function POST(request: Request) {
    try {
        const { idToken } = await request.json();
        const adminAuth = getAdminAuth();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token.' }, { status: 400 });
        }

        // Session cookie expires in 7 days (matches previous fitness_auth_session)
        const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days in ms

        // Create a session cookie using Firebase Admin
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        // Set the HTTP-only session cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: '__session',
            value: sessionCookie,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Session creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create session.' },
            { status: 401 }
        );
    }
}

// DELETE: Clear the session cookie (logout)
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('__session')?.value;
        const adminAuth = getAdminAuth();

        // Optionally revoke the session on Firebase side
        if (sessionCookie) {
            try {
                const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
                await adminAuth.revokeRefreshTokens(decodedClaims.sub);
            } catch {
                // Session might already be expired/invalid — that's fine
            }
        }

        // Clear the cookie
        cookieStore.set({
            name: '__session',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0, // Expire immediately
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed.' }, { status: 500 });
    }
}
