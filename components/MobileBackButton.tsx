'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MobileBackButton({ fallbackHref = '/dashboard' }: { fallbackHref?: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => {
                if (window.history.length > 2) {
                    router.back();
                } else {
                    router.push(fallbackHref);
                }
            }}
            className="lg:hidden flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-4 transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            Back
        </button>
    );
}
