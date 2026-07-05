import BreathingExercise from '@/components/BreathingExercise';

export const metadata = {
    title: 'Stress Relief | TheSugaRoots',
};

export default function StressReliefPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Stress Relief
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Take a moment to center yourself with these mindfulness exercises.
                </p>
            </header>

            <BreathingExercise />
        </div>
    );
}
