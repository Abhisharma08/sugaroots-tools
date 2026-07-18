'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, HeartPulse, Dumbbell, ListChecks, MoreHorizontal } from 'lucide-react';

const tabs = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Health Tracker', href: '/dashboard/health-tracker', icon: HeartPulse },
    { name: 'Workout', href: '/dashboard/workout-planner', icon: Dumbbell },
    { name: 'Habits', href: '/dashboard/habits', icon: ListChecks },
];

interface BottomNavProps {
    onMoreClick: () => void;
}

export default function BottomNav({ onMoreClick }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-cyan-100 dark:border-zinc-800 pb-safe lg:hidden"
            aria-label="Mobile navigation"
        >
            <div className="flex items-stretch justify-around h-16">
                {tabs.map((tab) => {
                    const isActive =
                        tab.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center flex-1 gap-0.5 text-[11px] font-medium transition-colors ${
                                isActive
                                    ? 'text-cyan-700 dark:text-cyan-400'
                                    : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                        >
                            <tab.icon
                                className={`w-5 h-5 transition-colors ${
                                    isActive
                                        ? 'text-cyan-700 dark:text-cyan-400'
                                        : 'text-zinc-400 dark:text-zinc-500'
                                }`}
                                aria-hidden="true"
                            />
                            <span>{tab.name}</span>
                        </Link>
                    );
                })}
                <button
                    type="button"
                    onClick={onMoreClick}
                    className="flex flex-col items-center justify-center flex-1 gap-0.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 transition-colors"
                >
                    <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                    <span>More</span>
                </button>
            </div>
        </nav>
    );
}
