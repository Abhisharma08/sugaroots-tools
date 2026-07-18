import BMRCalculator from '@/components/BMRCalculator';
import MobileBackButton from '@/components/MobileBackButton';

export default function BmrPage() {
    return (
        <div>
            <MobileBackButton fallbackHref="/dashboard/tools" />
            <BMRCalculator />
        </div>
    );
}
