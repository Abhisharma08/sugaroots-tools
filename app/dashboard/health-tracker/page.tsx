'use client';

import React, { useState, useEffect } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { useHealthTrackerStore } from '@/store/useHealthTrackerStore';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import SummaryTab from '@/components/health-tracker/SummaryTab';
import VitalsTab from '@/components/health-tracker/VitalsTab';
import GlucoseTab from '@/components/health-tracker/GlucoseTab';
import FoodLogTab from '@/components/health-tracker/FoodLogTab';
import WorkoutTab from '@/components/health-tracker/WorkoutTab';
import LifestyleTab from '@/components/health-tracker/LifestyleTab';

const TABS = ['Summary', 'Vitals', 'Glucose', 'Food Log', 'Workout', 'Lifestyle'];

export default function HealthTrackerPage() {
  const [mounted, setMounted] = useState(false);
  const currentDate = useHealthTrackerStore((s) => s.currentDate);
  const setCurrentDate = useHealthTrackerStore((s) => s.setCurrentDate);
  const hydrated = useHealthTrackerStore((s) => s._hydrated);
  const saveLogNow = useHealthTrackerStore((s) => s.saveLogNow);
  const syncError = useHealthTrackerStore((s) => s.syncError);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Edits auto-save to Firestore (debounced); this button forces an immediate save.
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveLogNow(currentDate);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch {
      // syncError banner surfaces the failure
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevDay = () => {
    const prev = subDays(new Date(currentDate), 1);
    setCurrentDate(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(new Date(currentDate), 1);
    setCurrentDate(format(next, 'yyyy-MM-dd'));
  };

  // Wait for both React mount and Zustand persist hydration
  if (!mounted || !hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 relative">
      
      {/* Header & Date Picker */}
      <header className="mb-6">
        <div className="mb-5 border-b border-cyan-100 pb-5 dark:border-zinc-800">
          <p className="mb-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">DAILY CHECK-IN</p>
          <h1 className="sr-page-title">Health Tracker</h1>
          <p className="sr-page-copy">Keep your daily health picture current, one entry at a time.</p>
        </div>

        {syncError && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-400">
            {syncError}
          </div>
        )}

        <div className="flex items-center justify-between sr-surface p-3 sm:p-4">
          <button onClick={handlePrevDay} className="grid size-11 place-items-center hover:bg-cyan-50 dark:hover:bg-zinc-800 rounded-lg transition-colors" aria-label="Previous day">
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          
          <div className="text-center">
            <p className="text-xs font-semibold text-cyan-800/60 uppercase">Date</p>
            <input
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-lg font-bold bg-transparent outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer"
            />
          </div>
          
          <button onClick={handleNextDay} className="grid size-11 place-items-center hover:bg-cyan-50 dark:hover:bg-zinc-800 rounded-lg transition-colors" aria-label="Next day">
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-40 bg-cyan-50/95 dark:bg-zinc-950/95 backdrop-blur-md pt-4 pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-11 px-4 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab 
                ? 'bg-cyan-800 text-white border-transparent'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-cyan-100 dark:border-zinc-800 hover:bg-cyan-50 dark:hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="min-h-[50vh]">
        <ErrorBoundary>
          {activeTab === 'Summary' && <SummaryTab />}
          {activeTab === 'Vitals' && <VitalsTab />}
          {activeTab === 'Glucose' && <GlucoseTab />}
          {activeTab === 'Food Log' && <FoodLogTab />}
          {activeTab === 'Workout' && <WorkoutTab />}
          {activeTab === 'Lifestyle' && <LifestyleTab />}
        </ErrorBoundary>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50">
        {showSaveToast && (
          <div className="absolute bottom-full right-0 mb-4 px-4 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Daily Log Saved!
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex min-h-12 items-center gap-2 bg-cyan-800 hover:bg-cyan-900 text-white px-5 py-3 rounded-lg shadow-lg shadow-cyan-950/20 font-semibold transition-colors disabled:opacity-70"
        >
          <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />
          {isSaving ? 'Saving…' : 'Save Day'}
        </button>
      </div>

    </div>
  );
}
