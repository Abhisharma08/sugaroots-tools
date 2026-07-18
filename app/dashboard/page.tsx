'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useFitnessStore } from '@/store/useFitnessStore';
import { useHealthTrackerStore, getCachedEmptyLog } from '@/store/useHealthTrackerStore';
import {
    Activity,
    Target,
    TrendingUp,
    ArrowRight,
    Dumbbell,
    Scale,
    Ruler,
    Calculator,
    Move,
    HeartPulse,
    Droplet,
    Moon,
    Footprints,
} from 'lucide-react';

export default function DashboardPage() {
    const { profile, derived, goals, userInfo } = useFitnessStore();

    // Wait for client mount before reading persisted logs to avoid hydration mismatches
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const todayIso = format(new Date(), 'yyyy-MM-dd');
    const todayLog = useHealthTrackerStore((s) => s.logs[todayIso]);
    const getLog = useHealthTrackerStore((s) => s.getLog);
    const log = mounted && todayLog ? getLog(todayIso) : getCachedEmptyLog(todayIso);

    const isLosingWeight = profile.weight > goals.targetWeight;

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex flex-col gap-4 border-b border-cyan-100 pb-6 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">TODAY&apos;S OVERVIEW</p>
                    <h1 className="sr-page-title">
                        {userInfo?.firstName
                        ? `Hello, ${userInfo.firstName}`
                        : 'Dashboard'}
                    </h1>
                    <p className="sr-page-copy">A clear view of your energy, movement, and recovery.</p>
                </div>
                <Link href="/dashboard/health-tracker" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-cyan-900">
                    <HeartPulse className="size-4" /> Update today
                </Link>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* BMR */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="grid size-10 place-items-center rounded-lg bg-cyan-100 dark:bg-cyan-950">
                            <Activity className="size-5 text-cyan-700 dark:text-cyan-300" />
                        </div>
                        <span className="text-xs font-semibold text-cyan-900/55 uppercase">BMR</span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.bmr.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-cyan-800/65 dark:text-cyan-100/60">kcal/day at rest</p>
                </div>

                {/* TDEE */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="grid size-10 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                            <TrendingUp className="size-5 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <span className="text-xs font-semibold text-cyan-900/55 uppercase">TDEE</span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.tdee.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-cyan-800/65 dark:text-cyan-100/60">total daily energy</p>
                </div>

                {/* Daily Target */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="grid size-10 place-items-center rounded-lg bg-teal-100 dark:bg-teal-950">
                            <Target className="size-5 text-teal-700 dark:text-teal-300" />
                        </div>
                        <span className="text-xs font-semibold text-cyan-900/55 uppercase">Target</span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.recommendedDailyCalories.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm capitalize text-cyan-800/65 dark:text-cyan-100/60">
                        {goals.pace} {isLosingWeight ? 'deficit' : 'surplus'}
                    </p>
                </div>

                {/* Exercise Burn */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="grid size-10 place-items-center rounded-lg bg-amber-100 dark:bg-amber-950">
                            <Move className="size-5 text-amber-700 dark:text-amber-300" />
                        </div>
                        <span className="text-xs font-semibold text-cyan-900/55 uppercase">Burn</span>
                    </div>
                    <p className="text-2xl font-semibold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.exerciseBurn.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-cyan-800/65 dark:text-cyan-100/60">active burn target</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
                {/* Health Snapshot Panel */}
                <div className="lg:col-span-3 sr-surface p-5 sm:p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-cyan-950 dark:text-cyan-50 mb-5 flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-rose-600" />
                        Today's Health Snapshot
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 pb-1">
                        <div className="flex flex-col items-center justify-center p-5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50">
                            <Footprints className="w-6 h-6 text-amber-600 mb-3" />
                            <p className="text-2xl font-semibold tabular-nums text-amber-800 dark:text-amber-300">
                                {log.steps.toLocaleString()}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Steps</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-5 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg border border-cyan-100 dark:border-cyan-900/50">
                            <Droplet className="w-6 h-6 text-cyan-600 mb-3" />
                            <p className="text-2xl font-semibold tabular-nums text-cyan-800 dark:text-cyan-300">
                                {log.water} <span className="text-xl opacity-60">/ 8</span>
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Glasses</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-5 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-100 dark:border-violet-900/50">
                            <Moon className="w-6 h-6 text-violet-600 mb-3" />
                            <p className="text-2xl font-semibold tabular-nums text-violet-800 dark:text-violet-300">
                                {log.sleep.durationHours.toFixed(1)} <span className="text-xl opacity-60">hrs</span>
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Sleep</p>
                        </div>
                    </div>
                </div>

                {/* Profile Summary */}
                <div className="lg:col-span-2 sr-surface p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-cyan-950 dark:text-cyan-50 mb-4 flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-cyan-700" />
                        Your Profile
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Weight
                            </span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{profile.weight} kg</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> Height
                            </span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{profile.height} cm</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Goal
                            </span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{goals.targetWeight} kg</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Age / Gender</span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                                {profile.age} yrs / {profile.gender}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Pace</span>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 capitalize px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                {goals.pace}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-emerald-950 dark:text-emerald-100 mb-1">
                            Ready to update your stats?
                        </h2>
                        <p className="text-emerald-900/70 dark:text-emerald-100/70 text-sm">
                            Use the fitness tools to recalculate your BMR, TDEE, and plan your goals.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/tools"
                        className="inline-flex min-h-11 items-center gap-2 px-4 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors group whitespace-nowrap"
                    >
                        <Calculator className="w-4 h-4" />
                        Open Tools
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
