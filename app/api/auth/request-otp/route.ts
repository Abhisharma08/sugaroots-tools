import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
    interval: 10 * 60 * 1000, // 10 minutes
    uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const isAllowed = limiter.check(5, ip);
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Too many OTP requests. Please try again in 10 minutes.' },
                { status: 429 }
            );
        }

        const { login_id } = await request.json();

        if (!login_id || typeof login_id !== 'string') {
            return NextResponse.json(
                { error: 'Please enter a valid email or mobile number.' },
                { status: 400 }
            );
        }

        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || 'https://thesugaroots.com';
        const apiKey = process.env.FITNESS_APP_SECRET_KEY;

        if (!apiKey) {
            console.error('FITNESS_APP_SECRET_KEY is not defined in environment variables.');
            return NextResponse.json(
                { error: 'Internal configuration error.' },
                { status: 500 }
            );
        }

        const wpRes = await fetch(`${wpUrl}/wp-json/fitness-app/v1/request-otp`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-fitness-api-key': apiKey
            },
            body: JSON.stringify({ login_id }),
        });

        const wpData = await wpRes.json();

        if (!wpRes.ok) {
            return NextResponse.json(
                { error: wpData.message || 'Failed to request OTP.' },
                { status: wpRes.status }
            );
        }

        return NextResponse.json({ success: true, message: wpData.message });
    } catch (error) {
        console.error('OTP request error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
