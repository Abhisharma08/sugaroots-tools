import BMRCalculator from '@/components/BMRCalculator';

export default function BmrPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">BMR & TDEE Calculator</h1>
                <p className="mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Use your profile details to estimate your daily energy needs.</p>
            </header>
            <BMRCalculator />
        </div>
    );
}
