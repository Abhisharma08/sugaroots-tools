'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase';
import { useFitnessStore } from '@/store/useFitnessStore';
import { User, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = React.useState<string | null>(null);
    const setUserInfo = useFitnessStore((s) => s.setUserInfo);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const loginId = formData.get('login_id');

        if (!loginId || String(loginId).trim() === '') {
            setError('Please enter your email or mobile number.');
            return;
        }

        startTransition(async () => {
            try {
                // Step 1: Verify subscription via WordPress & get Firebase custom token
                const tokenRes = await fetch('/api/auth/firebase-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login_id: String(loginId).trim() }),
                });

                const tokenData = await tokenRes.json();

                if (!tokenRes.ok) {
                    setError(tokenData.error || 'Verification failed.');
                    return;
                }

                // Save user info from WordPress response
                if (tokenData.user) {
                    setUserInfo(tokenData.user);
                }

                // Step 2: Sign into Firebase with the custom token
                const userCredential = await signInWithCustomToken(getClientAuth(), tokenData.firebaseToken);

                // Step 3: Get the ID token and create a server-side session cookie
                const idToken = await userCredential.user.getIdToken();
                const sessionRes = await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                if (!sessionRes.ok) {
                    setError('Failed to create session. Please try again.');
                    return;
                }

                // Step 4: Redirect to dashboard
                router.push('/dashboard');
                router.refresh();
            } catch (err) {
                console.error('Login error:', err);
                setError('An unexpected error occurred. Please try again.');
            }
        });
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your email or mobile number to access your fitness tools.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="login_id"
                                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Email or Mobile Number
                            </label>
                            <div className="mt-2 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="login_id"
                                    name="login_id"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    placeholder="john@example.com or +1 555-0000"
                                    className="block w-full pl-10 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 transition-all outline-none sm:text-sm"
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Sign in to Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                        <p>You must have an active Paid Memberships Pro subscription to login.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
