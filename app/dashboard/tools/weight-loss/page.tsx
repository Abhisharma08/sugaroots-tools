import WeightLossPlanner from '@/components/WeightLossPlanner';
import MobileBackButton from '@/components/MobileBackButton';

export default function WeightLossPage() {
    return (
        <div>
            <MobileBackButton fallbackHref="/dashboard/tools" />
            <WeightLossPlanner />
        </div>
    );
}
