import React, { useEffect } from 'react';
import { useHealthTrackerStore, selectCurrentLog } from '@/store/useHealthTrackerStore';
import { GlassWater, Moon, BedDouble, Sun } from 'lucide-react';

export default function LifestyleTab() {
  const { updateLifestyle } = useHealthTrackerStore();
  const log = useHealthTrackerStore(selectCurrentLog);
  const { water, sleep } = log;

  // Render water glasses
  const maxGlasses = 8;
  const renderGlasses = () => {
    const glasses = [];
    for (let i = 1; i <= maxGlasses; i++) {
      const isFilled = i <= water;
      glasses.push(
        <button
          key={i}
          onClick={() => updateLifestyle({ water: isFilled && water === i ? i - 1 : i })}
          className={`relative p-3 rounded-2xl transition-all duration-300 ${
            isFilled 
            ? 'bg-blue-100 text-blue-600 scale-110 shadow-sm border border-blue-200' 
            : 'bg-zinc-100 text-zinc-400 hover:bg-blue-50 hover:text-blue-400 border border-transparent'
          }`}
        >
          <GlassWater className="w-8 h-8" />
        </button>
      );
    }
    return glasses;
  };

  // Calculate sleep duration automatically
  useEffect(() => {
    if (sleep.bedtime && sleep.wakeTime) {
      const bedParts = sleep.bedtime.split(':').map(Number);
      const wakeParts = sleep.wakeTime.split(':').map(Number);
      
      if (bedParts.length === 2 && wakeParts.length === 2) {
        let bedHours = bedParts[0] + bedParts[1] / 60;
        let wakeHours = wakeParts[0] + wakeParts[1] / 60;
        
        // If wake is before bedtime (numerically), assume next day
        if (wakeHours < bedHours) {
          wakeHours += 24;
        }
        
        const diff = wakeHours - bedHours;
        
        // Only update if it changed significantly to avoid infinite loops
        if (Math.abs(diff - sleep.durationHours) > 0.01) {
          updateLifestyle({ sleep: { durationHours: diff } });
        }
      }
    }
  }, [sleep.bedtime, sleep.wakeTime, sleep.durationHours, updateLifestyle]);

  const sleepGoalProgress = Math.min((sleep.durationHours / 7) * 100, 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hydration Tracker */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <GlassWater className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Hydration</h3>
                <p className="text-sm text-zinc-500">Goal: 8 glasses</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">{water}</span>
              <span className="text-zinc-400 font-medium ml-1">/ 8</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center py-4">
            {renderGlasses()}
          </div>
          
          <div className="mt-4">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min((water / 8) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Moon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Sleep Quality</h3>
                <p className="text-sm text-zinc-500">Target: 7+ hours</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">{sleep.durationHours.toFixed(1)}</span>
              <span className="text-zinc-400 font-medium ml-1">hrs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                <BedDouble className="w-4 h-4" /> Bedtime
              </label>
              <input
                type="time"
                value={sleep.bedtime}
                onChange={(e) => updateLifestyle({ sleep: { bedtime: e.target.value } })}
                className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                <Sun className="w-4 h-4" /> Wake Time
              </label>
              <input
                type="time"
                value={sleep.wakeTime}
                onChange={(e) => updateLifestyle({ sleep: { wakeTime: e.target.value } })}
                className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-zinc-100 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-zinc-500">Progress to 7 Hours</span>
              <span className={sleep.durationHours >= 7 ? "text-emerald-600" : "text-blue-600"}>
                {Math.round(sleepGoalProgress)}%
              </span>
            </div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${sleep.durationHours >= 7 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${sleepGoalProgress}%` }}
              />
            </div>
            {sleep.durationHours > 0 && sleep.durationHours < 7 && (
              <p className="text-sm text-red-500 mt-3 font-medium flex items-center gap-1.5">
                <Moon className="w-4 h-4" />
                Try getting a bit more rest tonight!
              </p>
            )}
            {sleep.durationHours >= 7 && (
              <p className="text-sm text-emerald-600 mt-3 font-medium flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                Great job hitting your sleep target!
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
