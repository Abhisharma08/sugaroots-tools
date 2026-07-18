'use client';

import WorkoutPlanner from '@/components/WorkoutPlanner';

export default function WorkoutPlannerPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="sr-page-title">
                    Workout Planner
                </h1>
                <p className="sr-page-copy">
                    Pick the plan that fits your lifestyle — each one targets a burn of about 400 kcal a day.
                </p>
            </header>

            <WorkoutPlanner />
        </div>
    );
}
