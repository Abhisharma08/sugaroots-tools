import BreathingExercise from '@/components/BreathingExercise';
import MobileBackButton from '@/components/MobileBackButton';

export const metadata = {
    title: 'Stress Relief | SugaRoots',
};

export default function StressReliefPage() {
    return (
        <div>
            <MobileBackButton fallbackHref="/dashboard" />
            <BreathingExercise />
        </div>
    );
}
