'use client';

import WorkoutPlanner from '@/components/WorkoutPlanner';
import MobileBackButton from '@/components/MobileBackButton';

export default function WorkoutPlannerPage() {
    return (
        <div>
            <MobileBackButton fallbackHref="/dashboard" />
            <WorkoutPlanner />
        </div>
    );
}
