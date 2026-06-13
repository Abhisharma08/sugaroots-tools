'use client';

import React, { useState, useEffect } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { useHealthTrackerStore } from '@/store/useHealthTrackerStore';

import SummaryTab from '@/components/health-tracker/SummaryTab';
import VitalsTab from '@/components/health-tracker/VitalsTab';
import GlucoseTab from '@/components/health-tracker/GlucoseTab';
import FoodLogTab from '@/components/health-tracker/FoodLogTab';
import WorkoutTab from '@/components/health-tracker/WorkoutTab';
import LifestyleTab from '@/components/health-tracker/LifestyleTab';

const TABS = ['Summary', 'Vitals', 'Glucose', 'Food Log', 'Workout', 'Lifestyle'];

export default function HealthTrackerPage() {
  const [mounted, setMounted] = useState(false);
  const { currentDate, setCurrentDate } = useHealthTrackerStore();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [showSaveToast, setShowSaveToast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // We rely on Zustand's persist middleware for auto-saving, 
  // but we add a manual save button for UX reassurance as requested.
  const handleSave = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handlePrevDay = () => {
    const prev = subDays(new Date(currentDate), 1);
    setCurrentDate(format(prev, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const next = addDays(new Date(currentDate), 1);
    setCurrentDate(format(next, 'yyyy-MM-dd'));
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 font-sans relative">
      
      {/* Header & Date Picker */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">Sugar Roots Health Tracker</h1>
        
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
          
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Date</p>
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-lg font-bold bg-transparent outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer"
            />
          </div>
          
          <button onClick={handleNextDay} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </header>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-40 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md pt-4 pb-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                activeTab === tab 
                ? 'bg-blue-600 text-white border-transparent' 
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="min-h-[50vh]">
        {activeTab === 'Summary' && <SummaryTab />}
        {activeTab === 'Vitals' && <VitalsTab />}
        {activeTab === 'Glucose' && <GlucoseTab />}
        {activeTab === 'Food Log' && <FoodLogTab />}
        {activeTab === 'Workout' && <WorkoutTab />}
        {activeTab === 'Lifestyle' && <LifestyleTab />}
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {showSaveToast && (
          <div className="absolute bottom-full right-0 mb-4 px-4 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Daily Log Saved!
          </div>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl shadow-xl shadow-blue-600/30 font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Save className="w-5 h-5" />
          Save Day
        </button>
      </div>

    </div>
  );
}
