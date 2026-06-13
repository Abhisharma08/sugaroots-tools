import React, { useState } from 'react';
import { useHealthTrackerStore, selectCurrentLog, selectCalculatedMetrics } from '@/store/useHealthTrackerStore';
import { Dumbbell, Plus, Trash2, Activity } from 'lucide-react';

const EXERCISES = [
  { name: 'Post-meal Walk', met: 3.5 },
  { name: 'Brisk Walk', met: 4.5 },
  { name: 'Yoga', met: 3.0 },
  { name: 'Resistance Training', met: 5.0 },
  { name: 'Bodyweight Circuit', met: 6.0 },
  { name: 'Swimming', met: 6.0 },
  { name: 'Cycling', met: 6.0 },
  { name: 'HIIT', met: 8.0 },
  { name: 'Stair Climbing', met: 8.5 },
  { name: 'Other', met: 4.0 },
];

export default function WorkoutTab() {
  const { addWorkoutEntry, removeWorkoutEntry } = useHealthTrackerStore();
  const log = useHealthTrackerStore(selectCurrentLog);
  const metrics = selectCalculatedMetrics(log);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    exerciseIndex: 0,
    durationMinutes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMins = parseInt(formData.durationMinutes);
    if (isNaN(durationMins) || durationMins <= 0) return;

    const exercise = EXERCISES[formData.exerciseIndex];

    addWorkoutEntry({
      exercise: exercise.name,
      met: exercise.met,
      durationHours: durationMins / 60,
    });

    setFormData({ exerciseIndex: 0, durationMinutes: '' });
    setIsAdding(false);
  };

  const currentWeight = log.weight || 80;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Overview Card */}
      <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <Dumbbell className="w-48 h-48 -mr-10 -mt-10" />
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-blue-200 font-medium mb-1">Total Workout Burn</p>
            <p className="text-5xl font-bold">{metrics.workoutCalories} <span className="text-2xl font-medium text-blue-200">kcal</span></p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm mb-1">Total Sessions</p>
            <p className="text-2xl font-bold">{log.workouts.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Daily Workouts</h3>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Workout
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-900/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Exercise Type</label>
                <select 
                  value={formData.exerciseIndex} 
                  onChange={e => setFormData({...formData, exerciseIndex: parseInt(e.target.value)})} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500"
                >
                  {EXERCISES.map((ex, idx) => (
                    <option key={ex.name} value={idx}>{ex.name} (MET: {ex.met})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Duration (minutes) *</label>
                <input 
                  type="number" 
                  required 
                  value={formData.durationMinutes} 
                  onChange={e => setFormData({...formData, durationMinutes: e.target.value})} 
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" 
                  placeholder="e.g. 45" 
                />
              </div>
            </div>
            
            {/* Live Preview of Calculation */}
            {formData.durationMinutes && !isNaN(parseInt(formData.durationMinutes)) && (
              <div className="mb-4 text-sm text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg flex items-center justify-between">
                <span>Est. Burn: <strong>{Math.round(EXERCISES[formData.exerciseIndex].met * currentWeight * (parseInt(formData.durationMinutes) / 60))} kcal</strong></span>
                <span className="text-xs opacity-75">Calculation: {EXERCISES[formData.exerciseIndex].met} MET × {currentWeight} kg × {(parseInt(formData.durationMinutes) / 60).toFixed(2)} hrs</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-zinc-500 font-medium hover:text-zinc-800">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Save Workout</button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div>
          {log.workouts.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <Dumbbell className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p>No workouts logged yet today.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {log.workouts.map((entry) => {
                const estCals = Math.round(entry.met * currentWeight * entry.durationHours);
                return (
                  <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">{entry.exercise}</div>
                      <div className="text-sm text-zinc-500 flex gap-3 mt-1">
                        <span>{Math.round(entry.durationHours * 60)} minutes</span>
                        <span>•</span>
                        <span>{entry.met} MET</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{estCals}</span>
                        <span className="text-sm font-medium text-zinc-400 ml-1">kcal</span>
                      </div>
                      <button 
                        onClick={() => removeWorkoutEntry(entry.id)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
