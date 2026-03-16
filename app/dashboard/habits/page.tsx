'use client';

import HabitTracker from '@/components/HabitTracker';

export default function HabitsPage() {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Habits
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Track your daily routines and build consistency over time.
                </p>
            </header>

            <div className="pt-2 pb-12">
                <HabitTracker />
            </div>
        </div>
    );
}
