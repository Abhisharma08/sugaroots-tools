'use server';

import { cookies } from 'next/headers';

export async function loginAction(prevState: any, formData: FormData) {
    const loginId = formData.get('login_id');

    if (!loginId || typeof loginId !== 'string') {
        return { error: 'Please enter a valid email or mobile number.' };
    }

    try {
        // Replace this URL with your actual WordPress site URL
        const wpUrl = process.env.NEXT_PUBLIC_WP_URL || 'https://theSugaRootss.com';

        const res = await fetch(`${wpUrl}/wp-json/fitness-app/v1/verify-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login_id: loginId }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('WP API Error Response:', data); // Added logging to catch debug output
            return {
                error: data.message || 'Verification failed. Please check your credentials or subscription.'
            };
        }

        // Success! The user has an active PMPro subscription.
        // Set a secure, HTTP-only cookie to establish the session.
        // In production, ensure 'secure: true' is set (requires HTTPS).
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'fitness_auth_session',
            value: String(data.data.user_id), // Store the User ID or a JWT secure token
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 Week
        });

        return { success: true };

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'An unexpected error occurred. Please try again later.' };
    }
}
