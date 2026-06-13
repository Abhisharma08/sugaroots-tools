'use client';

import Link from 'next/link';
import { useFitnessStore } from '@/store/useFitnessStore';
import {
    Activity,
    Target,
    TrendingUp,
    ArrowRight,
    Flame,
    Dumbbell,
    Scale,
    Ruler,
    Calculator,
    Move,
} from 'lucide-react';

export default function DashboardPage() {
    const { profile, derived, goals, userInfo } = useFitnessStore();

    const isLosingWeight = profile.weight > goals.targetWeight;

    // Progress bar for macro targets
    const totalMacroCals =
        derived.macros.protein * 4 + derived.macros.carbs * 4 + derived.macros.fats * 9;
    const proteinPct = Math.round(((derived.macros.protein * 4) / totalMacroCals) * 100);
    const carbsPct = Math.round(((derived.macros.carbs * 4) / totalMacroCals) * 100);
    const fatsPct = 100 - proteinPct - carbsPct;

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
                {/* Macros Panel - wider */}
                <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-5 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Daily Macro Targets
                    </h3>

                    {/* Stacked bar */}
                    <div className="h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex mb-6">
                        <div
                            className="bg-blue-500 transition-all duration-500"
                            style={{ width: `${proteinPct}%` }}
                        />
                        <div
                            className="bg-amber-400 transition-all duration-500"
                            style={{ width: `${carbsPct}%` }}
                        />
                        <div
                            className="bg-rose-400 transition-all duration-500"
                            style={{ width: `${fatsPct}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/15 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {derived.macros.protein}g
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Protein</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{proteinPct}% of calories</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/15 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                {derived.macros.carbs}g
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Carbs</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{carbsPct}% of calories</p>
                        </div>
                        <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/15 rounded-xl border border-rose-100 dark:border-rose-900/30">
                            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                                {derived.macros.fats}g
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Fats</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{fatsPct}% of calories</p>
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
