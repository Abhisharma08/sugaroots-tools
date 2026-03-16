import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const { login_id, otp } = await request.json();
        const adminAuth = getAdminAuth();

        if (!login_id || typeof login_id !== 'string') {
            return NextResponse.json(
                { error: 'Please enter a valid email or mobile number.' },
                { status: 400 }
            );
        }

        if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
            return NextResponse.json(
                { error: 'Please enter the 6-digit OTP.' },
                { status: 400 }
            );
        }

        // Step 1: Verify OTP via WordPress
        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || 'https://thesugaroots.com';
        const apiKey = process.env.FITNESS_APP_SECRET_KEY || 'yoursupersecrettestkey123';
        
        const wpRes = await fetch(`${wpUrl}/wp-json/fitness-app/v1/verify-otp`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-fitness-api-key': apiKey
            },
            body: JSON.stringify({ login_id, otp }),
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
                uid: firebaseUid,
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
