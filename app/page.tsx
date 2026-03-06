import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-zinc-50 dark:bg-zinc-950">
            <h1 className="text-5xl font-extrabold text-indigo-600 mb-6">SugaRoot Tools</h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12">
                Track your goals, calculate your macros, and crush your fitness targets all in one place.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/login"
                    className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-2xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all"
                >
                    Sign In
                </Link>
                <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium rounded-2xl shadow border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
