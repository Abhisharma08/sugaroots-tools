'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFitnessStore } from '../store/useFitnessStore';
import { useAuth } from '@/components/AuthProvider';
import { Activity, User, Ruler, Weight, Flame, AlertCircle, CheckCircle2 } from 'lucide-react';

const bmrSchema = z.object({
    age: z
        .number({ invalid_type_error: 'Enter a valid age' })
        .min(1, 'Must be at least 1')
        .max(120, 'Must be under 120'),
    gender: z.enum(['male', 'female'], { message: 'Select a gender' }),
    weight: z
        .number({ invalid_type_error: 'Enter a valid weight' })
        .min(20, 'Must be at least 20 kg')
        .max(300, 'Must be under 300 kg'),
    height: z
        .number({ invalid_type_error: 'Enter a valid height' })
        .min(50, 'Must be at least 50 cm')
        .max(250, 'Must be under 250 cm'),
    activityLevel: z.number(),
});

type BMRFormValues = z.infer<typeof bmrSchema>;

// Helper: input class based on error state
function inputCls(hasError: boolean) {
    return `w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border rounded-xl transition-all outline-none text-zinc-900 dark:text-zinc-100 ${hasError
            ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-400'
            : 'border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
        }`;
}

export default function BMRCalculator() {
    const { profile, derived, updateProfile, saveToFirestore } = useFitnessStore();
    const { user } = useAuth();
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const {
        register,
        watch,
        formState: { errors, isValid },
    } = useForm<BMRFormValues>({
        resolver: zodResolver(bmrSchema),
        defaultValues: {
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            activityLevel: profile.activityLevel,
        },
        mode: 'onChange',
    });

    const hasErrors = Object.keys(errors).length > 0;

    // Watch for changes — only update store when valid
    React.useEffect(() => {
        const subscription = watch((value) => {
            const parsed = bmrSchema.safeParse(value);
            if (parsed.success) {
                updateProfile(parsed.data);
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
    }, [watch, updateProfile, saveToFirestore, user]);

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Form Section */}
                <div className="p-8 lg:p-10">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 font-sans tracking-tight">
                                BMR & TDEE Calculator
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Fill in your details for accurate results
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            {/* Age */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                    <User className="w-4 h-4 text-zinc-400" />
                                    Age <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('age', { valueAsNumber: true })}
                                    className={inputCls(!!errors.age)}
                                    placeholder="e.g. 25"
                                    min={1}
                                    max={120}
                                    step={1}
                                />
                                {errors.age && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        {errors.age.message}
                                    </p>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                    <User className="w-4 h-4 text-zinc-400" />
                                    Gender <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        {...register('gender')}
                                        className={`${inputCls(!!errors.gender)} appearance-none pr-10`}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.gender && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {/* Weight */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                    <Weight className="w-4 h-4 text-zinc-400" />
                                    Weight (kg) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('weight', { valueAsNumber: true })}
                                    className={inputCls(!!errors.weight)}
                                    placeholder="e.g. 70"
                                    min={20}
                                    max={300}
                                    step={0.1}
                                />
                                {errors.weight && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        {errors.weight.message}
                                    </p>
                                )}
                            </div>

                            {/* Height */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-zinc-400" />
                                    Height (cm) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('height', { valueAsNumber: true })}
                                    className={inputCls(!!errors.height)}
                                    placeholder="e.g. 170"
                                    min={50}
                                    max={250}
                                    step={0.1}
                                />
                                {errors.height && (
                                    <p className="text-red-500 text-xs flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        {errors.height.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Activity Level */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-zinc-400" />
                                Activity Level
                            </label>
                            <div className="relative">
                                <select
                                    {...register('activityLevel', { valueAsNumber: true })}
                                    className={`${inputCls(false)} appearance-none pr-10`}
                                >
                                    <option value={1.2}>Sedentary (Little to no exercise)</option>
                                    <option value={1.375}>Light Active (Exercise 1-3 days/wk)</option>
                                    <option value={1.55}>Moderate Active (Exercise 3-5 days/wk)</option>
                                    <option value={1.725}>Very Active (Hard exercise 6-7 days/wk)</option>
                                    <option value={1.9}>Extra Active (Very hard exercise/physical job)</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-zinc-400">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
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
                </div>

                {/* Results Section */}
                <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden text-white transition-opacity duration-300 ${hasErrors ? 'opacity-50' : ''}`}>
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-white/10 rounded-full blur-2xl mix-blend-overlay pointer-events-none" />

                    <div className="relative z-10 space-y-8">
                        <div>
                            <p className="text-indigo-100 font-medium text-sm tracking-wider uppercase mb-2">
                                Basal Metabolic Rate
                            </p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-5xl font-bold tracking-tight">{derived.bmr.toLocaleString()}</span>
                                <span className="text-indigo-200 font-medium">kcal/day</span>
                            </div>
                            <p className="text-indigo-100 text-sm mt-3 opacity-90 leading-relaxed max-w-sm">
                                The minimum calories required to keep your body functioning at rest.
                            </p>
                        </div>

                        <div className="h-px bg-white/20 w-full rounded" />

                        <div>
                            <p className="text-purple-100 font-medium text-sm tracking-wider uppercase mb-2">
                                Total Daily Energy Expenditure
                            </p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-5xl font-bold tracking-tight">{derived.tdee.toLocaleString()}</span>
                                <span className="text-purple-200 font-medium">kcal/day</span>
                            </div>
                            <p className="text-purple-100 text-sm mt-3 opacity-90 leading-relaxed max-w-sm">
                                Your maintenance calories, including your daily activity and exercise levels.
                            </p>
                        </div>

                        {hasErrors && (
                            <div className="text-center py-2 px-4 bg-white/10 rounded-xl">
                                <p className="text-sm text-white/80">
                                    ⚠️ Fix form errors for accurate results.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
