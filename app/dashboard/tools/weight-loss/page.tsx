import WeightLossPlanner from '@/components/WeightLossPlanner';

export default function WeightLossPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">Weight Loss Plan</h1>
                <p className="mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Set a realistic goal and get daily nutrition and activity targets.</p>
            </header>
            <WeightLossPlanner />
        </div>
    );
}
