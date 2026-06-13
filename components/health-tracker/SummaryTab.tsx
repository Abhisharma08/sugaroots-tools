import React from 'react';
import { useHealthTrackerStore, selectCurrentLog, selectCalculatedMetrics } from '@/store/useHealthTrackerStore';
import { ShieldCheck, Flame, Scale, Droplet, Moon, Activity } from 'lucide-react';

export default function SummaryTab() {
  const { updateLifestyle } = useHealthTrackerStore();
  const log = useHealthTrackerStore(selectCurrentLog);
  const metrics = selectCalculatedMetrics(log);

  // Determine Net Calorie Balance Status
  // Green: Deficit achieved (-500 kcal is the target, so let's say <= -300)
  // Yellow: Near maintenance (-299 to +300)
  // Red: Surplus (> 300)
  let netCalColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  let netCalLabel = 'Maintenance';
  
  if (metrics.netCalories <= -300) {
    netCalColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    netCalLabel = 'Deficit Achieved';
  } else if (metrics.netCalories > 300) {
    netCalColor = 'bg-red-100 text-red-800 border-red-200';
    netCalLabel = 'Surplus';
  }

  // Score color
  const scorePct = (metrics.healthScore / 6) * 100;
  const scoreColor = scorePct >= 80 ? 'text-emerald-500' : scorePct >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Top Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Score */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Daily Score</h3>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-bold ${scoreColor}`}>{metrics.healthScore}</span>
              <span className="text-xl font-medium text-zinc-400 mb-1">/ 6</span>
            </div>
            <p className="text-sm text-zinc-500 mt-2">Based on steps, water, sleep, exercise, deficit, & glucose.</p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * scorePct) / 100}
                className={`transition-all duration-1000 ease-out ${scoreColor}`}
              />
            </svg>
            <ShieldCheck className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 ${scoreColor}`} />
          </div>
        </div>

        {/* Net Calorie Balance */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Net Calorie Balance</h3>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">{metrics.netCalories > 0 ? '+' : ''}{metrics.netCalories}</span>
                <span className="text-xl font-medium text-zinc-400 mb-1">kcal</span>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm ${netCalColor}`}>
              {netCalLabel}
            </div>
          </div>

          {/* Calorie Math Breakdown */}
          <div className="grid grid-cols-3 gap-4 relative z-10">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Consumed</span>
              <span className="text-xl font-bold text-rose-600">{metrics.foodCalories}</span>
            </div>
            <div className="flex items-center justify-center text-zinc-300 font-bold text-2xl">-</div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500 block mb-1">Burned (Steps + Wkt)</span>
              <span className="text-xl font-bold text-blue-600">{metrics.totalBurned}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Grid */}
      <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 pl-2 pt-4">Daily Snapshot</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Activity className="w-6 h-6 text-orange-500 mb-2" />
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{log.steps}</span>
          <span className="text-xs text-zinc-500 font-medium">Steps</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Droplet className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{log.water}/8</span>
          <span className="text-xs text-zinc-500 font-medium">Glasses Water</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Moon className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{log.sleep.durationHours.toFixed(1)}</span>
          <span className="text-xs text-zinc-500 font-medium">Hours Sleep</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Flame className="w-6 h-6 text-rose-500 mb-2" />
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{log.glucose.postMeal || '-'}</span>
          <span className="text-xs text-zinc-500 font-medium">Post-Meal Glucose</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Scale className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{log.weight || '-'}</span>
          <span className="text-xs text-zinc-500 font-medium">Weight (kg)</span>
        </div>
      </div>

      {/* Notes / Mood Field */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm mt-6">
        <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 mb-4">Mood & Notes</h3>
        <textarea
          value={log.notes}
          onChange={(e) => updateLifestyle({ notes: e.target.value })}
          placeholder="How are you feeling today? Any symptoms or general notes?"
          className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl resize-none outline-none focus:border-blue-500 transition-colors"
        />
      </div>

    </div>
  );
}
