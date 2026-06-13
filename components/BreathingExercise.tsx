'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, Wind } from 'lucide-react';

type Phase = 'Idle' | 'Countdown' | 'Inhale' | 'Hold' | 'Exhale' | 'HoldOut';

type Technique = {
    id: string;
    name: string;
    description: string;
    timings: {
        inhale: number;
        hold: number;
        exhale: number;
        holdOut: number;
    };
};

const TECHNIQUES: Technique[] = [
    {
        id: '4-7-8',
        name: '4-7-8 Relaxation',
        description: 'A natural tranquilizer for the nervous system. Great for sleep and severe anxiety.',
        timings: { inhale: 4, hold: 7, exhale: 8, holdOut: 0 },
    },
    {
        id: 'box',
        name: 'Box Breathing',
        description: 'Used by Navy SEALs to stay calm and focused in stressful situations.',
        timings: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
    },
    {
        id: 'coherent',
        name: 'Coherent Breathing',
        description: 'Balances the nervous system and promotes a state of calm alertness.',
        timings: { inhale: 5, hold: 0, exhale: 5, holdOut: 0 },
    }
];

export default function BreathingExercise() {
    const [selectedTechnique, setSelectedTechnique] = useState<Technique>(TECHNIQUES[0]);
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<Phase>('Idle');
    const [timeLeft, setTimeLeft] = useState(0);

    // State for the expanding/contracting circle
    const [circleScale, setCircleScale] = useState(1);

    const stopExercise = useCallback(() => {
        setIsActive(false);
        setPhase('Idle');
        setTimeLeft(0);
        setCircleScale(1);
    }, []);

    const playPhase = useCallback((currentPhase: Phase, duration: number, nextPhase: Phase, targetScale: number) => {
        if (!isActive) return;
        
        setPhase(currentPhase);
        setTimeLeft(duration);
        setCircleScale(targetScale);
        
    }, [isActive]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && phase !== 'Idle') {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Time to transition to the next phase
                        clearInterval(interval);
                        
                        // Let the effect re-run with the new phase logic below. We use a microtask or just let state settle.
                        // Actually, it's better to handle transitions directly here based on the EXPIRED phase.
                        
                        if (phase === 'Countdown') {
                            playPhase('Inhale', selectedTechnique.timings.inhale, 'Hold', 1.5);
                        } else if (phase === 'Inhale') {
                            if (selectedTechnique.timings.hold > 0) {
                                playPhase('Hold', selectedTechnique.timings.hold, 'Exhale', 1.5);
                            } else {
                                playPhase('Exhale', selectedTechnique.timings.exhale, 'HoldOut', 1);
                            }
                        } else if (phase === 'Hold') {
                            playPhase('Exhale', selectedTechnique.timings.exhale, 'HoldOut', 1);
                        } else if (phase === 'Exhale') {
                            if (selectedTechnique.timings.holdOut > 0) {
                                playPhase('HoldOut', selectedTechnique.timings.holdOut, 'Inhale', 1);
                            } else {
                                playPhase('Inhale', selectedTechnique.timings.inhale, 'Hold', 1.5);
                            }
                        } else if (phase === 'HoldOut') {
                            playPhase('Inhale', selectedTechnique.timings.inhale, 'Hold', 1.5);
                        }
                        
                        return 0; // The previous tick was 1, so now it's 0 visually before the switch
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, phase, selectedTechnique, playPhase]);


    // Initial kick-off
    useEffect(() => {
        if (isActive && phase === 'Idle') {
            playPhase('Countdown', 3, 'Inhale', 1);
        }
    }, [isActive, phase, playPhase]);



    // --- Helpers for the UI rendering ---
    const getInstructionText = () => {
        switch (phase) {
            case 'Idle': return 'Ready to breathe?';
            case 'Countdown': return 'Get Ready...';
            case 'Inhale': return 'Breathe In';
            case 'Hold': return 'Hold Breath';
            case 'Exhale': return 'Breathe Out';
            case 'HoldOut': return 'Hold Empty';
            default: return '';
        }
    };

    const getCircleColor = () => {
        switch (phase) {
            case 'Idle': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-500';
            case 'Countdown': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-500';
            case 'Inhale': return 'bg-teal-100 dark:bg-teal-900/40 text-teal-600';
            case 'Hold': return 'bg-green-100 dark:bg-green-900/40 text-green-600';
            case 'Exhale': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-600';
            case 'HoldOut': return 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600';
            default: return 'bg-blue-100 dark:bg-blue-900/40 text-blue-500';
        }
    };

    // Calculate transition duration dynamically so it exactly matches the phase timing
    const getTransitionDuration = () => {
        if (phase === 'Idle' || phase === 'Countdown' || phase === 'Hold' || phase === 'HoldOut') {
             // For holds, we want it to stay the absolute same size immediately, so no CSS transition needed, 
             // but keeping a slight easing makes it feel softer if it arrives slightly offset.
             return '1000ms'; 
        }
        // If inhaling or exhaling, the transition should take exactly the number of seconds that phase lasts
        const seconds = phase === 'Inhale' ? selectedTechnique.timings.inhale : selectedTechnique.timings.exhale;
        return `${seconds}s`;
    };


    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 lg:p-12 transition-all duration-300">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="mx-auto w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <Wind className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Mindful Breathing</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                    Take a moment to center yourself. Select a technique and follow the expanding and contracting circle.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                
                {/* Left Side: Controls */}
                <div className="md:col-span-5 space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 block">
                            Choose Technique
                        </label>
                        <div className="grid gap-3">
                            {TECHNIQUES.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => {
                                        setSelectedTechnique(tech);
                                        stopExercise();
                                    }}
                                    className={`text-left p-4 rounded-xl border transition-all ${
                                        selectedTechnique.id === tech.id
                                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 ring-1 ring-teal-500/50'
                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700 bg-white dark:bg-zinc-800/50'
                                    }`}
                                >
                                    <h3 className={`font-semibold text-sm ${
                                        selectedTechnique.id === tech.id ? 'text-teal-700 dark:text-teal-300' : 'text-zinc-800 dark:text-zinc-200'
                                    }`}>
                                        {tech.name}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                        {tech.description}
                                    </p>
                                    <div className="text-[10px] font-mono mt-2 text-zinc-400 flex gap-2">
                                        <span>In: {tech.timings.inhale}s</span>
                                        {tech.timings.hold > 0 && <span>Hold: {tech.timings.hold}s</span>}
                                        <span>Out: {tech.timings.exhale}s</span>
                                        {tech.timings.holdOut > 0 && <span>Hold: {tech.timings.holdOut}s</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-4">
                        {!isActive ? (
                            <button
                                onClick={() => setIsActive(true)}
                                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3.5 px-6 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Start Breathing
                            </button>
                        ) : (
                            <button
                                onClick={stopExercise}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3.5 px-6 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 transition-colors"
                            >
                                <Square className="w-5 h-5 fill-current" />
                                Stop
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side: The Visualizer */}
                <div className="md:col-span-7 flex flex-col items-center justify-center min-h-[400px] bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl relative overflow-hidden border border-zinc-100 dark:border-zinc-800/50">
                    
                    {/* The Breathing Circle */}
                    <div className="relative flex items-center justify-center w-full h-full p-12">
                        {/* Outer expanding halo */}
                        <div 
                            className={`absolute rounded-full transition-all ease-linear ${getCircleColor()} opacity-30`}
                            style={{
                                width: '200px',
                                height: '200px',
                                transform: `scale(${circleScale})`,
                                transitionDuration: getTransitionDuration(),
                            }}
                        />
                        {/* Inner breathing circle */}
                        <div 
                            className={`absolute rounded-full transition-all ease-linear ${getCircleColor()}`}
                            style={{
                                width: '150px',
                                height: '150px',
                                transform: `scale(${circleScale})`,
                                transitionDuration: getTransitionDuration(),
                                boxShadow: isActive ? '0 0 40px currentColor' : 'none'
                            }}
                        />

                        {/* Text Content inside the circle */}
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <h3 className={`font-bold text-xl tracking-tight transition-colors duration-500 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                {getInstructionText()}
                            </h3>
                            {isActive && phase !== 'Idle' && (
                                <p className="text-3xl font-light font-mono mt-2 text-zinc-900 dark:text-white transition-all">
                                    {timeLeft}
                                </p>
                            )}
                        </div>
                    </div>

                </div>
                
            </div>
        </div>
    );
}
