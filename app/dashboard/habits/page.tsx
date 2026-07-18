'use client';

import HabitTracker from '@/components/HabitTracker';

export default function HabitsPage() {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="sr-page-title">
                    Habits
                </h1>
                <p className="sr-page-copy">
                    Track your daily routines and build consistency over time.
                </p>
            </header>

            <div className="pt-2 pb-12">
                <HabitTracker />
            </div>
        </div>
    );
}
