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
        <div className="space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {userInfo?.firstName
                        ? `Hi, ${userInfo.firstName}! 👋`
                        : 'Dashboard'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Your fitness overview at a glance.
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* BMR */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">BMR</span>
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {derived.bmr.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">kcal/day at rest</p>
                </div>

                {/* TDEE */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">TDEE</span>
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {derived.tdee.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">total daily energy</p>
                </div>

                {/* Daily Target */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Target</span>
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {derived.recommendedDailyCalories.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 capitalize">
                        {goals.pace} {isLosingWeight ? 'deficit' : 'surplus'}
                    </p>
                </div>

                {/* Exercise Burn */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <Move className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Burn</span>
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                        {derived.exerciseBurn.toLocaleString()}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">active burn target</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Health Snapshot Panel */}
                <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-5 flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 text-rose-500" />
                        Today's Health Snapshot
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 pb-1">
                        <div className="flex flex-col items-center justify-center p-6 bg-orange-50 dark:bg-orange-900/15 rounded-xl border border-orange-100 dark:border-orange-900/30 transition-transform hover:scale-[1.02]">
                            <Footprints className="w-8 h-8 text-orange-500 mb-3" />
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {log.steps.toLocaleString()}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Steps</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/15 rounded-xl border border-blue-100 dark:border-blue-900/30 transition-transform hover:scale-[1.02]">
                            <Droplet className="w-8 h-8 text-blue-500 mb-3" />
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {log.water} <span className="text-xl opacity-60">/ 8</span>
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Glasses</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/15 rounded-xl border border-indigo-100 dark:border-indigo-900/30 transition-transform hover:scale-[1.02]">
                            <Moon className="w-8 h-8 text-indigo-500 mb-3" />
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                {log.sleep.durationHours.toFixed(1)} <span className="text-xl opacity-60">hrs</span>
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Sleep</p>
                        </div>
                    </div>
                </div>

                {/* Profile Summary */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-5 flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-blue-500" />
                        Your Profile
                    </h3>
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
            <div className="bg-gradient-to-r from-blue-500 to-green-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                            Ready to update your stats?
                        </h3>
                        <p className="text-blue-100 text-sm">
                            Use the fitness tools to recalculate your BMR, TDEE, and plan your goals.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/tools"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-blue-50 transition-all group whitespace-nowrap"
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
