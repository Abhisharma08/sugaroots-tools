import BMRCalculator from '@/components/BMRCalculator';

export default function BmrPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="sr-page-title">BMR & TDEE Calculator</h1>
                <p className="sr-page-copy">Use your profile details to estimate your daily energy needs.</p>
            </header>
            <BMRCalculator />
        </div>
    );
}
