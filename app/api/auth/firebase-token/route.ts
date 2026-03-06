import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { login_id } = await request.json();
        const adminAuth = getAdminAuth();

        if (!login_id || typeof login_id !== 'string') {
            return NextResponse.json(
                { error: 'Please enter a valid email or mobile number.' },
                { status: 400 }
            );
        }

        // Step 1: Verify subscription via WordPress
        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || 'https://theSugaRootss.com';
        const wpRes = await fetch(`${wpUrl}/wp-json/fitness-app/v1/verify-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_id }),
        });

        const wpData = await wpRes.json();

        if (!wpRes.ok) {
            return NextResponse.json(
                { error: wpData.message || 'Subscription verification failed.' },
                { status: wpRes.status }
            );
        }

        // Step 2: WordPress verified → generate Firebase custom token
        const wpUser = wpData.data;
        const firebaseUid = `wp_${wpUser.user_id}`;

        const firebaseToken = await adminAuth.createCustomToken(firebaseUid, {
            wpUserId: wpUser.user_id,
            loginId: login_id,
        });

        return NextResponse.json({
            firebaseToken,
            userId: firebaseUid,
            user: {
                displayName: wpUser.display_name || '',
                email: wpUser.email || login_id,
                firstName: wpUser.first_name || '',
                lastName: wpUser.last_name || '',
            },
        });
    } catch (error) {
        console.error('Firebase token generation error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
