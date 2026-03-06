'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFitnessStore } from '../store/useFitnessStore';
import { useAuth } from '@/components/AuthProvider';
import { Target, TrendingDown, Clock, Move, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

const plannerSchema = z.object({
    targetWeight: z
        .number({ invalid_type_error: 'Enter a valid weight' })
        .min(20, 'Must be at least 20 kg')
        .max(300, 'Must be under 300 kg'),
    pace: z.enum(['mild', 'moderate', 'aggressive'], {
        message: 'Select a pace',
    }),
});

type PlannerFormValues = z.infer<typeof plannerSchema>;

function inputCls(hasError: boolean, accent: string = 'emerald') {
    return `w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border rounded-xl transition-all outline-none text-zinc-900 dark:text-zinc-100 ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-400'
            : `border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-${accent}-500 focus:border-${accent}-500`
        }`;
}

export default function WeightLossPlanner() {
    const { profile, goals, derived, updateGoals, saveToFirestore } = useFitnessStore();
    const { user } = useAuth();
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const {
        register,
        watch,
        formState: { errors, isValid },
    } = useForm<PlannerFormValues>({
        resolver: zodResolver(plannerSchema),
        defaultValues: {
            targetWeight: goals.targetWeight,
            pace: goals.pace,
        },
        mode: 'onChange',
    });

    const hasErrors = Object.keys(errors).length > 0;

    // Watch for changes — only update store when valid
    React.useEffect(() => {
        const subscription = watch((value) => {
            const parsed = plannerSchema.safeParse(value);
            if (parsed.success) {
                updateGoals(parsed.data);
                if (user?.uid) {
                    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = setTimeout(() => {
                        saveToFirestore(user.uid);
                    }, 1000);
                }
            }
        });
        return () => {
            subscription.unsubscribe();
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [watch, updateGoals, saveToFirestore, user]);

    // Timeline calculation
    const calculateTimeline = () => {
        const weightDifference = profile.weight - goals.targetWeight;
        if (weightDifference <= 0) return null;

        let weeklyDeficitKcal = 0;
        if (goals.pace === 'mild') weeklyDeficitKcal = 250 * 7;
        if (goals.pace === 'moderate') weeklyDeficitKcal = 500 * 7;
        if (goals.pace === 'aggressive') weeklyDeficitKcal = 1000 * 7;

        const kgPerWeek = weeklyDeficitKcal / 7700;
        const weeksToGoal = Math.ceil(weightDifference / kgPerWeek);
        const estimatedDate = addDays(new Date(), weeksToGoal * 7);

        return {
            weeks: weeksToGoal,
            date: format(estimatedDate, 'MMMM d, yyyy'),
            rate: kgPerWeek.toFixed(2),
        };
    };

    const timeline = calculateTimeline();
    const isLosingWeight = profile.weight > goals.targetWeight;

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Input Section */}
                <div className="p-8 lg:p-10 border-r border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 font-sans tracking-tight leading-tight">
                                Weight Goal Planner
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                Set your target weight and preferred pace.
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5">
                        {/* Target Weight */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-zinc-400" />
                                    Goal Weight (kg) <span className="text-red-400">*</span>
                                </span>
                                <span className="text-xs text-zinc-500 font-normal">Current: {profile.weight} kg</span>
                            </label>
                            <input
                                type="number"
                                {...register('targetWeight', { valueAsNumber: true })}
                                className={inputCls(!!errors.targetWeight)}
                                placeholder="e.g. 65"
                                min={20}
                                max={300}
                                step={0.1}
                            />
                            {errors.targetWeight && (
                                <p className="text-red-500 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                    {errors.targetWeight.message}
                                </p>
                            )}
                        </div>

                        {/* Pace */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-zinc-400" />
                                Pace of Change <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    {...register('pace')}
                                    className={`${inputCls(!!errors.pace)} appearance-none pr-10`}
                                >
                                    <option value="mild">Mild (±0.25 kg/wk)</option>
                                    <option value="moderate">Moderate (±0.5 kg/wk)</option>
                                    <option value="aggressive">Aggressive (±1.0 kg/wk)</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                            {errors.pace && (
                                <p className="text-red-500 text-xs flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                    {errors.pace.message}
                                </p>
                            )}
                        </div>

                        {/* Validation Status */}
                        {hasErrors && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    Please fix the errors above before results can update.
                                </p>
                            </div>
                        )}
                        {!hasErrors && isValid && (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    All inputs valid — results are up to date.
                                </p>
                            </div>
                        )}
                    </form>

                    {/* Contextual Info Box */}
                    <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                        Based on your TDEE of <strong className="text-emerald-600 dark:text-emerald-400">{derived.tdee} kcal</strong>.
                        Adjust inputs above to see how they impact your daily targets.
                    </div>
                </div>

                {/* Actionable Summary Section */}
                <div className={`p-8 lg:p-10 flex flex-col justify-center space-y-8 bg-zinc-50/50 dark:bg-zinc-900/50 relative transition-opacity duration-300 ${hasErrors ? 'opacity-50 pointer-events-none' : ''}`}>

                    {/* Target Calories */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">
                                    Daily Calorie Target
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                                        {derived.dailyCalorieTarget}
                                    </span>
                                    <span className="text-zinc-500 font-medium">kcal</span>
                                </div>
                            </div>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-sm mt-3 text-zinc-500 leading-relaxed">
                            Based on a {goals.pace} {isLosingWeight ? 'deficit' : 'surplus'} from your TDEE.
                        </p>
                    </div>

                    {/* Exercise Target */}
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">
                                    Active Burn Target
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                                        {derived.dailyExerciseBurnTarget}
                                    </span>
                                    <span className="text-zinc-500 font-medium">kcal</span>
                                </div>
                            </div>
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <Move className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-sm mt-3 text-zinc-500 leading-relaxed">
                            Calories burned through daily activity and exercise.
                        </p>
                    </div>

                    {/* Timeline Estimate */}
                    {timeline ? (
                        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-black rounded-2xl p-6 shadow-md border border-zinc-700 relative overflow-hidden text-white">
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-emerald-400" />
                                    <h3 className="font-medium tracking-wide">Estimated Timeline</h3>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-3xl font-bold text-white">
                                        ~{timeline.weeks} Weeks
                                    </p>
                                    <p className="text-zinc-400 text-sm">
                                        Reaching goal by <span className="text-zinc-200 font-medium">{timeline.date}</span>
                                    </p>
                                </div>
                                <div className="mt-4 text-xs text-zinc-500">
                                    Losing roughly {timeline.rate}kg per week based on pace.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 text-center flex flex-col items-center justify-center">
                            <Target className="w-8 h-8 text-zinc-400 mb-2 opacity-50" />
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                Set a goal weight lower than your current weight to see the estimated timeline.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
