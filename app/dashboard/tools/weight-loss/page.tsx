import WeightLossPlanner from '@/components/WeightLossPlanner';

export default function WeightLossPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="sr-page-title">Weight Loss Plan</h1>
                <p className="sr-page-copy">Set a realistic goal and get daily nutrition and activity targets.</p>
            </header>
            <WeightLossPlanner />
        </div>
    );
}
