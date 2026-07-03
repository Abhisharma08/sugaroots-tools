'use client';

import WorkoutPlanner from '@/components/WorkoutPlanner';

export default function WorkoutPlannerPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Workout Planner
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Pick the plan that fits your lifestyle — each one targets a burn of about 400 kcal a day.
                </p>
            </header>

            <WorkoutPlanner />
        </div>
    );
}
