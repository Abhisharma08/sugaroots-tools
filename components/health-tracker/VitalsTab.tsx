import React from 'react';
import { useHealthTrackerStore, selectCurrentLog, selectCalculatedMetrics } from '@/store/useHealthTrackerStore';
import { Activity, Scale, Target, Flame } from 'lucide-react';

export default function VitalsTab() {
  const { updateVitals } = useHealthTrackerStore();
  const log = useHealthTrackerStore(selectCurrentLog);
  const metrics = selectCalculatedMetrics(log);

  const stepProgress10k = Math.min((log.steps / 10000) * 100, 100);
  const stepProgress7k = Math.min((log.steps / 7000) * 100, 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weight Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Body Weight</h3>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="number"
              value={log.weight || ''}
              onChange={(e) => updateVitals({ weight: parseFloat(e.target.value) || 0 })}
              placeholder="Enter weight"
              className="w-full text-4xl font-bold bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-blue-500 outline-none pb-2 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
            <span className="absolute right-0 bottom-4 text-zinc-400 font-medium">kg</span>
          </div>
          <p className="text-sm text-zinc-500 mt-3">Used to calculate your BMR and workout calorie burn.</p>
        </div>

        {/* Steps Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Daily Steps</h3>
            </div>
            <div className="flex items-center gap-1.5 text-orange-600 font-semibold bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full text-sm">
              <Flame className="w-4 h-4" />
              {metrics.stepCalories} kcal
            </div>
          </div>

          <div className="relative mb-6">
            <input
              type="number"
              value={log.steps || ''}
              onChange={(e) => updateVitals({ steps: parseInt(e.target.value, 10) || 0 })}
              placeholder="0"
              className="w-full text-4xl font-bold bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-orange-500 outline-none pb-2 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
            <span className="absolute right-0 bottom-4 text-zinc-400 font-medium">steps</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-zinc-500">7,000 Step Goal</span>
                <span className="text-orange-600">{Math.round(stepProgress7k)}%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 transition-all duration-500"
                  style={{ width: `${stepProgress7k}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-zinc-500">10,000 Step Goal</span>
                <span className="text-emerald-600">{Math.round(stepProgress10k)}%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stepProgress10k}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
