import BreathingExercise from '@/components/BreathingExercise';

export const metadata = {
    title: 'Stress Relief | TheSugaRoots',
};

export default function StressReliefPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="sr-page-title">
                    Stress Relief
                </h1>
                <p className="sr-page-copy">
                    Take a moment to center yourself with these mindfulness exercises.
                </p>
            </header>

            <BreathingExercise />
        </div>
    );
}
