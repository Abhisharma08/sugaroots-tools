import React, { useState } from 'react';
import { useHealthTrackerStore, selectCurrentLog, selectCalculatedMetrics } from '@/store/useHealthTrackerStore';
import { Utensils, Plus, Trash2, PieChart } from 'lucide-react';

const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'];

export default function FoodLogTab() {
  const { addFoodEntry, removeFoodEntry } = useHealthTrackerStore();
  const log = useHealthTrackerStore(selectCurrentLog);
  const metrics = selectCalculatedMetrics(log);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: MEAL_CATEGORIES[0],
    quantity: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.calories) return;

    addFoodEntry({
      name: formData.name,
      category: formData.category,
      quantity: formData.quantity,
      calories: parseFloat(formData.calories) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      protein: parseFloat(formData.protein) || 0,
      fat: parseFloat(formData.fat) || 0,
    });

    setFormData({
      name: '',
      category: formData.category, // Keep last category selected
      quantity: '',
      calories: '',
      carbs: '',
      protein: '',
      fat: '',
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Cals</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{metrics.foodCalories}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Protein</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.foodMacros.protein}g</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Carbs</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{metrics.foodMacros.carbs}g</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Fat</p>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{metrics.foodMacros.fat}g</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Utensils className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Daily Log</h3>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Food
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-900/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Food Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" placeholder="e.g. Oatmeal" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500">
                  {MEAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Quantity</label>
                <input type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" placeholder="1 bowl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Calories *</label>
                <input type="number" required value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" placeholder="kcal" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Protein (g)</label>
                <input type="number" value={formData.protein} onChange={e => setFormData({...formData, protein: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Carbs (g)</label>
                <input type="number" value={formData.carbs} onChange={e => setFormData({...formData, carbs: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Fat (g)</label>
                <input type="number" value={formData.fat} onChange={e => setFormData({...formData, fat: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border rounded-lg text-sm outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-zinc-500 font-medium hover:text-zinc-800">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Save Entry</button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div>
          {log.food.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <PieChart className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p>No food logged yet today.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {log.food.map((entry) => (
                <div key={entry.id} className="p-4 flex flex-wrap items-center justify-between gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase tracking-wider">{entry.category}</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">{entry.name}</span>
                    </div>
                    <div className="text-sm text-zinc-500 flex flex-wrap gap-x-3 gap-y-1">
                      {entry.quantity && <span>{entry.quantity}</span>}
                      <span>P: {entry.protein}g</span>
                      <span>C: {entry.carbs}g</span>
                      <span>F: {entry.fat}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{entry.calories} <span className="text-sm font-medium text-zinc-400">kcal</span></span>
                    <button 
                      onClick={() => removeFoodEntry(entry.id)}
                      className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
