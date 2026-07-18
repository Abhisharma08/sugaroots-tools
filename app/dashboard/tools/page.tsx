import Link from 'next/link';
import { Activity, ArrowRight, Target } from 'lucide-react';

export default function ToolsPage() {
    return (
        <div className="max-w-5xl">
            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/dashboard/tools/bmr" className="group border border-zinc-200 bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20 rounded-lg">
                    <div className="flex items-start gap-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"><Activity className="size-5" /></span>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">BMR & TDEE</h2>
                            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Estimate your resting and daily energy needs.</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-400">Open calculator <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                        </div>
                    </div>
                </Link>
                <Link href="/dashboard/tools/weight-loss" className="group border border-zinc-200 bg-white p-5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20 rounded-lg">
                    <div className="flex items-start gap-4">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"><Target className="size-5" /></span>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Weight Loss Plan</h2>
                            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Set a target and see a practical calorie plan.</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">Open planner <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
