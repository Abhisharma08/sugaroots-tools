'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ExerciseMedia } from '@/components/ExerciseMedia';
import { getUserData, saveWorkoutSelection } from '@/lib/firestore';
import {
    WORKOUT_PLANS,
    getPlanTotal,
    type Audience,
    type WorkoutPlan,
} from '@/lib/workout-plans';
import {
    Home,
    Briefcase,
    Dumbbell,
    Footprints,
    Flame,
    Check,
    ChevronLeft,
    Target,
} from 'lucide-react';

export default function WorkoutPlanner() {
    const { user } = useAuth();

    const [audience, setAudience] = useState<Audience | null>(null);
    const [hasGym, setHasGym] = useState<boolean | null>(null);
    const [planId, setPlanId] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Load the saved selection from Firestore
    useEffect(() => {
        if (!user?.uid) return;
        let cancelled = false;
        getUserData(user.uid)
            .then((data) => {
                if (cancelled) return;
                const saved = data?.workoutPlanner;
                if (saved) {
                    setAudience(saved.audience ?? null);
                    setHasGym(typeof saved.hasGym === 'boolean' ? saved.hasGym : null);
                    setPlanId(saved.planId ?? null);
                }
            })
            .catch((err) => console.error('Failed to load workout selection:', err))
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => {
            cancelled = true;
        };
    }, [user?.uid]);

    const persist = (next: { audience: Audience | null; hasGym: boolean | null; planId: string | null }) => {
        if (user?.uid && next.audience !== null && next.hasGym !== null) {
            saveWorkoutSelection(user.uid, {
                audience: next.audience,
                hasGym: next.hasGym,
                planId: next.planId,
            }).catch((err) => console.error('Failed to save workout selection:', err));
        }
    };

    const chooseAudience = (a: Audience) => {
        // Home makers train without a gym (per programme design)
        const gym = a === 'home-maker' ? false : null;
        setAudience(a);
        setHasGym(gym);
        setPlanId(null);
        persist({ audience: a, hasGym: gym, planId: null });
    };

    const chooseGym = (gym: boolean) => {
        setHasGym(gym);
        setPlanId(null);
        persist({ audience, hasGym: gym, planId: null });
    };

    const choosePlan = (id: string) => {
        setPlanId(id);
        persist({ audience, hasGym, planId: id });
    };

    const availablePlans = hasGym === null ? [] : WORKOUT_PLANS.filter((p) => p.requiresGym === hasGym);
    const selectedPlan = WORKOUT_PLANS.find((p) => p.id === planId) ?? null;

    if (!loaded && user) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Step 1 — Audience */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    Who is this plan for?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AudienceCard
                        label="Home Maker"
                        description="Flexible routines you can do at home, around your day."
                        icon={Home}
                        selected={audience === 'home-maker'}
                        onClick={() => chooseAudience('home-maker')}
                    />
                    <AudienceCard
                        label="Working Professional / Business Person"
                        description="Time-efficient plans that fit a busy schedule."
                        icon={Briefcase}
                        selected={audience === 'professional'}
                        onClick={() => chooseAudience('professional')}
                    />
                </div>
            </section>

            {/* Step 2 — Gym access (professionals only) */}
            {audience === 'professional' && (
                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                        Do you have gym access?
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { value: true, label: 'Yes, I go to a gym' },
                            { value: false, label: 'No, I train at home' },
                        ].map((opt) => (
                            <button
                                key={String(opt.value)}
                                onClick={() => chooseGym(opt.value)}
                                className={`px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                                    hasGym === opt.value
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-400'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Step 3 — Pick a plan */}
            {hasGym !== null && !selectedPlan && (
                <section className="animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 pl-1">
                        {hasGym ? 'Choose your focus area' : 'Choose your plan'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availablePlans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => choosePlan(plan.id)}
                                className="text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    {plan.steps ? (
                                        <Footprints className="w-5 h-5 text-orange-500" />
                                    ) : (
                                        <Flame className="w-5 h-5 text-rose-500" />
                                    )}
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                        ≈ {getPlanTotal(plan)} kcal
                                    </span>
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {plan.title}
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{plan.subtitle}</p>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Step 4 — Plan detail */}
            {selectedPlan && (
                <PlanDetail
                    plan={selectedPlan}
                    onBack={() => {
                        setPlanId(null);
                        persist({ audience, hasGym, planId: null });
                    }}
                />
            )}
        </div>
    );
}

function AudienceCard({
    label,
    description,
    icon: Icon,
    selected,
    onClick,
}: {
    label: string;
    description: string;
    icon: React.ElementType;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`text-left p-5 rounded-2xl border transition-all ${
                selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/50'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-blue-300'
            }`}
        >
            <div className="flex items-center gap-3 mb-2">
                <div
                    className={`p-2 rounded-xl ${
                        selected ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-500'
                    }`}
                >
                    <Icon className="w-5 h-5" />
                </div>
                <span
                    className={`font-bold ${
                        selected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                >
                    {label}
                </span>
                {selected && <Check className="w-5 h-5 text-blue-600 ml-auto" />}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </button>
    );
}

function PlanDetail({ plan, onBack }: { plan: WorkoutPlan; onBack: () => void }) {
    const total = getPlanTotal(plan);

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
                <ChevronLeft className="w-4 h-4" />
                Change plan
            </button>

            {/* Plan header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-1">{plan.title}</h2>
                        <p className="text-blue-100 text-sm max-w-xl">{plan.subtitle}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end text-blue-100 text-sm font-medium mb-1">
                            <Target className="w-4 h-4" /> Daily burn target
                        </div>
                        <p className="text-4xl font-bold">
                            ≈ {total} <span className="text-xl font-medium text-blue-100">kcal</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Steps block */}
            {plan.steps && (
                <div className="bg-orange-50 dark:bg-orange-900/15 border border-orange-200 dark:border-orange-900/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-900/40 flex items-center justify-center text-3xl">
                            🚶
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Daily Steps</h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {plan.steps.count.toLocaleString()} steps through the day
                            </p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full text-sm font-bold">
                        <Flame className="w-4 h-4" /> ≈ {plan.steps.calories} kcal
                    </span>
                </div>
            )}

            {/* Exercise list */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Dumbbell className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                        {plan.id === 'steps-yoga' ? 'Yoga Sequence' : 'Exercises'}
                    </h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {plan.exercises.map((ex) => (
                        <div
                            key={ex.name}
                            className="p-4 sm:p-5 flex flex-wrap items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-3xl sm:text-4xl overflow-hidden">
                                <ExerciseMedia media={ex.media} fallback={ex.image} alt={ex.name} />
                            </div>
                            <div className="flex-1 min-w-[10rem]">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{ex.name}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{ex.detail}</p>
                            </div>
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full text-sm font-bold whitespace-nowrap">
                                <Flame className="w-4 h-4" /> ≈ {ex.calories} kcal
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center px-4">
                Calorie values are estimates for a ~75 kg adult and vary with body weight, pace and intensity.
                Consult your doctor before starting a new exercise programme.
                {plan.id === 'steps-yoga' && (
                    <>
                        {' '}
                        Yoga imagery: Kennguru &amp; lululemon athletica (CC BY), Camino (CC BY-SA) via Wikimedia Commons.
                    </>
                )}
            </p>
        </section>
    );
}
