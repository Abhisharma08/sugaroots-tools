import React from 'react';
import { useHealthTrackerStore, selectCurrentLog } from '@/store/useHealthTrackerStore';
import { Droplet, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';

export default function GlucoseTab() {
  const { updateGlucose } = useHealthTrackerStore();
  const log = useHealthTrackerStore(selectCurrentLog);
  const { glucose } = log;

  // Helper to get badge details based on metric and value
  const getInterpretation = (metric: 'fasting' | 'postMeal' | 'hba1c', valueStr: string) => {
    const value = parseFloat(valueStr);
    if (isNaN(value)) return null;

    if (metric === 'fasting') {
      if (value < 70) return { label: 'Low', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
      if (value <= 100) return { label: 'Normal', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 };
      if (value <= 125) return { label: 'Pre-Diabetes', color: 'bg-orange-100 text-orange-800', icon: AlertCircle };
      return { label: 'Doctor Consultation', color: 'bg-red-100 text-red-800', icon: Stethoscope };
    }
    
    if (metric === 'postMeal') {
      if (value < 140) return { label: 'Normal', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 };
      if (value <= 199) return { label: 'Pre-Diabetes', color: 'bg-orange-100 text-orange-800', icon: AlertCircle };
      return { label: 'Doctor Consultation', color: 'bg-red-100 text-red-800', icon: Stethoscope };
    }
    
    if (metric === 'hba1c') {
      if (value < 5.7) return { label: 'Normal', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 };
      if (value <= 6.4) return { label: 'Pre-Diabetes', color: 'bg-orange-100 text-orange-800', icon: AlertCircle };
      return { label: 'Doctor Consultation', color: 'bg-red-100 text-red-800', icon: Stethoscope };
    }

    return null;
  };

  const renderInput = (
    label: string, 
    field: keyof typeof glucose, 
    placeholder: string, 
    unit: string, 
    metricType?: 'fasting' | 'postMeal' | 'hba1c'
  ) => {
    const interpretation = metricType ? getInterpretation(metricType, glucose[field]) : null;
    const Icon = interpretation?.icon;

    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">{label}</label>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-1">
            <input
              type={metricType ? "number" : "text"}
              step={metricType === 'hba1c' ? '0.1' : '1'}
              value={glucose[field]}
              onChange={(e) => updateGlucose({ [field]: e.target.value })}
              placeholder={placeholder}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:border-red-500 transition-colors"
            />
            {unit && <span className="absolute right-4 top-3 text-zinc-400 font-medium">{unit}</span>}
          </div>
          {interpretation && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${interpretation.color}`}>
              {Icon && <Icon className="w-4 h-4" />}
              {interpretation.label}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
          <Droplet className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Blood Glucose Log</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderInput('Fasting Glucose (Morning)', 'fasting', 'e.g. 95', 'mg/dL', 'fasting')}
          {renderInput('Post-Meal Glucose (2 hours after)', 'postMeal', 'e.g. 135', 'mg/dL', 'postMeal')}
          {renderInput('HbA1c (If tested today)', 'hba1c', 'e.g. 5.6', '%', 'hba1c')}
        </div>
        <div className="space-y-6">
          {renderInput('Symptoms', 'symptoms', 'e.g. fatigue, blurry vision...', '')}
          {renderInput('Action Taken', 'action', 'e.g. drank water, took walk...', '')}
          
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Reference Ranges</h4>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Normal Fasting:</span> <span className="font-medium text-emerald-600">70–100 mg/dL</span></li>
              <li className="flex justify-between"><span>Normal Post-Meal:</span> <span className="font-medium text-emerald-600">&lt;140 mg/dL</span></li>
              <li className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2"><span>Pre-Diabetes Fasting:</span> <span className="font-medium text-orange-600">100–125 mg/dL</span></li>
              <li className="flex justify-between"><span>Pre-Diabetes Post-Meal:</span> <span className="font-medium text-orange-600">140–199 mg/dL</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
