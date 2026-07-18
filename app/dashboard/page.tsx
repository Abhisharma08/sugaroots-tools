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
    Scale,
    Ruler,
    Move,
    HeartPulse,
    Droplet,
    Moon,
    Footprints,
    Dumbbell,
    Calculator,
} from 'lucide-react';

function getGreeting(): { text: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'GOOD MORNING', emoji: '☀️' };
    if (hour < 17) return { text: 'GOOD AFTERNOON', emoji: '🌤️' };
    return { text: 'GOOD EVENING', emoji: '🌙' };
}

export default function DashboardPage() {
    const { profile, derived, goals, userInfo } = useFitnessStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const todayIso = format(new Date(), 'yyyy-MM-dd');
    const todayLog = useHealthTrackerStore((s) => s.logs[todayIso]);
    const getLog = useHealthTrackerStore((s) => s.getLog);
    const log = mounted && todayLog ? getLog(todayIso) : getCachedEmptyLog(todayIso);

    const greeting = getGreeting();
    const firstName = userInfo?.firstName || 'there';
    const isLosingWeight = profile.weight > goals.targetWeight;

    return (
        <div className="space-y-5 max-w-lg mx-auto lg:max-w-none">

            {/* ── Greeting Header ── */}
            <section className="sr-fade-up flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" style={{ animationDelay: '0ms' }}>
                <div>
                    <p className="text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-400 mb-1">
                        {greeting.text} {greeting.emoji}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-cyan-950 dark:text-cyan-50" style={{ fontFamily: 'Georgia, serif' }}>
                        Hello, {firstName} 👋
                    </h1>
                    <p className="mt-1 text-sm text-cyan-800/65 dark:text-cyan-100/60 leading-relaxed">
                        You&apos;re doing great! Keep going to reach your goals.
                    </p>
                </div>
                <Link
                    href="/dashboard/health-tracker"
                    className="flex items-center justify-center gap-2 w-full lg:w-auto min-h-12 px-6 rounded-xl bg-cyan-900 dark:bg-cyan-800 text-white font-semibold text-sm shadow-lg shadow-cyan-900/20 hover:bg-cyan-950 dark:hover:bg-cyan-700 transition-colors whitespace-nowrap"
                >
                    <HeartPulse className="w-4 h-4" />
                    Update today
                </Link>
            </section>

            {/* ── Metric Cards 2×2 (mobile) / 4-col (desktop) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sr-fade-up" style={{ animationDelay: '100ms' }}>
                {/* BMR */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-cyan-100 dark:bg-cyan-950">
                            <Activity className="size-4 text-cyan-700 dark:text-cyan-300" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-cyan-900/50 dark:text-cyan-100/50 uppercase">BMR</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.bmr.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-cyan-800/55 dark:text-cyan-100/50">kcal/day at rest</p>
                </div>

                {/* TDEE */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                            <TrendingUp className="size-4 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-cyan-900/50 dark:text-cyan-100/50 uppercase">TDEE</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.tdee.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-cyan-800/55 dark:text-cyan-100/50">total daily energy</p>
                </div>

                {/* Target */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-teal-100 dark:bg-teal-950">
                            <Target className="size-4 text-teal-700 dark:text-teal-300" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-cyan-900/50 dark:text-cyan-100/50 uppercase">Target</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.recommendedDailyCalories.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-cyan-800/55 dark:text-cyan-100/50">
                        {goals.pace} {isLosingWeight ? 'Deficit' : 'Surplus'}
                    </p>
                </div>

                {/* Burn */}
                <div className="sr-surface p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-rose-100 dark:bg-rose-950">
                            <Move className="size-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-[11px] font-bold tracking-wider text-cyan-900/50 dark:text-cyan-100/50 uppercase">Burn</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums text-cyan-950 dark:text-cyan-50">
                        {derived.exerciseBurn.toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs text-cyan-800/55 dark:text-cyan-100/50">active burn target</p>
                </div>
            </div>

            {/* ── Two Column Layout: Health Snapshot + Profile ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sr-fade-up" style={{ animationDelay: '150ms' }}>
                {/* Today's Health Snapshot */}
                <section className="lg:col-span-3 sr-surface p-5 flex flex-col">
                    <h2 className="text-base lg:text-lg font-semibold text-cyan-950 dark:text-cyan-50 mb-4 flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        Today&apos;s Health Snapshot
                    </h2>
                    <div className="grid grid-cols-3 gap-3 flex-1">
                        {/* Steps */}
                        <div className="flex flex-col items-center justify-center py-4 px-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
                            <Footprints className="w-5 h-5 text-amber-500 mb-2" />
                            <p className="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-300">
                                {log.steps.toLocaleString()}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">Steps</p>
                        </div>
                        {/* Water */}
                        <div className="flex flex-col items-center justify-center py-4 px-2 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-100 dark:border-cyan-900/50">
                            <Droplet className="w-5 h-5 text-cyan-500 mb-2" />
                            <p className="text-lg font-bold tabular-nums text-cyan-700 dark:text-cyan-300">
                                {log.water} <span className="text-sm opacity-50">/ 8</span>
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">Glasses</p>
                        </div>
                        {/* Sleep */}
                        <div className="flex flex-col items-center justify-center py-4 px-2 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-100 dark:border-violet-900/50">
                            <Moon className="w-5 h-5 text-violet-500 mb-2" />
                            <p className="text-lg font-bold tabular-nums text-violet-700 dark:text-violet-300">
                                {log.sleep.durationHours.toFixed(1)} <span className="text-sm opacity-50">hrs</span>
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">Sleep</p>
                        </div>
                    </div>
                </section>

                {/* Your Profile */}
                <section className="lg:col-span-2 sr-surface p-5">
                    <h2 className="text-base lg:text-lg font-semibold text-cyan-950 dark:text-cyan-50 mb-3 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                        Your Profile
                    </h2>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Scale className="w-4 h-4" /> Weight
                            </span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{profile.weight} kg</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> Height
                            </span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{profile.height} cm</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Goal
                            </span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{goals.targetWeight} kg</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Age / Gender</span>
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                                {profile.age} Yrs / {profile.gender}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Pace</span>
                            <span className="text-sm font-bold capitalize px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                {goals.pace}
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── CTA Banner ── */}
            <section
                className="sr-fade-up rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-4 lg:p-5"
                style={{ animationDelay: '250ms' }}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="hidden lg:grid size-10 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0 mt-0.5">
                            <Calculator className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm lg:text-base font-semibold text-emerald-950 dark:text-emerald-100">
                                Ready to update your stats?
                            </p>
                            <p className="hidden lg:block text-sm text-emerald-900/70 dark:text-emerald-100/60 mt-0.5">
                                Use the fitness tools to recalculate your BMR, TDEE, and plan your goals.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/tools"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition-colors group whitespace-nowrap"
                    >
                        <Calculator className="w-3.5 h-3.5 lg:hidden" />
                        Open Tools
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

