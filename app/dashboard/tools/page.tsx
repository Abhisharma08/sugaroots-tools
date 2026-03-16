'use client';

import BMRCalculator from '@/components/BMRCalculator';
import WeightLossPlanner from '@/components/WeightLossPlanner';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { Activity, Target, ListChecks } from 'lucide-react';

export default function ToolsPage() {
    const toolsTabs: TabItem[] = [
        { label: 'BMR Calculator', icon: Activity, children: <BMRCalculator /> },
        { label: 'Weight Loss Planner', icon: Target, children: <WeightLossPlanner /> },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Fitness Tools
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Health calculators and planners to power your fitness journey.
                </p>
            </header>

            <div className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <Tabs tabs={toolsTabs} />
            </div>
        </div>
    );
}
