'use client';

import HabitTracker from '@/components/HabitTracker';
import MobileBackButton from '@/components/MobileBackButton';

export default function HabitsPage() {
    return (
        <div>
            <MobileBackButton fallbackHref="/dashboard" />
            <div className="pt-2 pb-12">
                <HabitTracker />
            </div>
        </div>
    );
}
