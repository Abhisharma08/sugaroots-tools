'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { useAuth } from '@/components/AuthProvider';
import { Gauge, Plus, Zap, Loader2, LayoutGrid, Users, HeartPulse, Briefcase, Hash } from 'lucide-react';
import { format, subDays, isToday } from 'date-fns';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    'All': LayoutGrid,
    'Family': Users,
    'Health': HeartPulse,
    'Work': Briefcase,
};

export default function HabitTracker() {
    const { user } = useAuth();
    const { habits, isLoading, fetchHabits, toggleHabit, createNewHabit } = useHabitStore();
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Create new habit state
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('');

    // Create new category state
    const [localCategories, setLocalCategories] = useState<string[]>([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Compute dynamic categories based on existing habits
    const dynamicCategories = useMemo(() => {
        const uniqueCats = new Set<string>(localCategories);
        habits.forEach(h => {
            if (h.category) uniqueCats.add(h.category);
        });
        return ['All', ...Array.from(uniqueCats).sort()];
    }, [habits, localCategories]);

    useEffect(() => {
        if (user?.uid) {
            fetchHabits(user.uid);
        }
    }, [user?.uid, fetchHabits]);

    // Generate the last 5 days (including today), putting today FIRST for mobile visibility
    const dateColumns = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => {
            const date = subDays(new Date(), i); // [today, 1 day ago, 2, 3, 4]
            return {
                date,
                isoString: format(date, 'yyyy-MM-dd'),
                dayStr: format(date, 'eee'), // e.g. "Thu"
                dateNum: format(date, 'dd'),  // e.g. "12"
                isToday: isToday(date),
            };
        });
    }, []);

    // Filter habits by category chips
    const filteredHabits = habits.filter(h => 
        selectedCategory === 'All' ? true : h.category === selectedCategory
    );

    // Calculate Today's completion percentage
    const todayIso = format(new Date(), 'yyyy-MM-dd');
    const totalTodayHabits = habits.length;
    const completedToday = habits.filter(h => h.completedDates.includes(todayIso)).length;
    const completionPercentage = totalTodayHabits === 0 ? 0 : Math.round((completedToday / totalTodayHabits) * 100);

    const handleToggle = (habitId: string | undefined, dateStr: string, completedDates: string[]) => {
        if (!user?.uid || !habitId) return;

        // Prevent marking future dates
        const todayIso = format(new Date(), 'yyyy-MM-dd');
        if (dateStr > todayIso) return;

        const isCompleted = completedDates.includes(dateStr);
        toggleHabit(user.uid, habitId, dateStr, !isCompleted);
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid || !newTitle.trim() || !newCategory.trim()) return;
        
        await createNewHabit(user.uid, newTitle.trim(), newCategory.trim());
        setNewTitle('');
        setNewCategory('');
        setIsAdding(false);
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const cat = newCategoryName.trim();
        if (cat && !dynamicCategories.includes(cat)) {
            setLocalCategories(prev => [...prev, cat]);
            setSelectedCategory(cat);
        }
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    if (isLoading && habits.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl p-4 sm:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl mx-auto font-sans">
            
            {/* TOP HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-baseline gap-2">
                    Today, <span className="text-zinc-400 font-medium">{format(new Date(), 'do MMM')}</span>
                </h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full font-semibold text-sm">
                        <Gauge className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        <span className="text-zinc-800 dark:text-zinc-200">{completionPercentage.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

                {/* FILTER CHIPS */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {dynamicCategories.map((catName) => {
                        const Icon = CATEGORY_ICONS[catName] || Hash;
                        return (
                            <button
                                key={catName}
                                onClick={() => setSelectedCategory(catName)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-colors text-sm font-medium ${
                                    selectedCategory === catName 
                                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100' 
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                                }`}
                            >
                                {selectedCategory === catName && <Icon className="w-4 h-4" />}
                                {catName}
                            </button>
                        );
                    })}
                    {isAddingCategory ? (
                        <form onSubmit={handleAddCategory} className="flex items-center gap-2 shrink-0">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New Category"
                                className="w-32 sm:w-40 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-sm outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                                autoFocus
                            />
                            <button type="submit" className="text-xs font-semibold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                                Save
                            </button>
                            <button type="button" onClick={() => setIsAddingCategory(false)} className="text-xs px-2 py-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingCategory(true)}
                            className="flex items-center gap-1 px-4 py-2 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Category
                        </button>
                    )}
                </div>

            {/* QUICK ADD INLINE ROW (Optional expanded state) */}
            {isAdding && (
                <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
                    <input 
                        type="text" 
                        placeholder="e.g. Read 10 pages" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 w-full px-3 py-2.5 sm:py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                        autoFocus
                        required
                    />
                    <div className="flex gap-2 sm:gap-3">
                        <input 
                            type="text" 
                            placeholder="Category" 
                            value={newCategory} 
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="flex-1 sm:w-32 sm:flex-none px-3 py-2.5 sm:py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 placeholder:text-zinc-400"
                            list="category-suggestions"
                            required
                        />
                        <datalist id="category-suggestions">
                            {dynamicCategories.filter(c => c !== 'All').map(c => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                        <button type="submit" className="px-5 py-2.5 sm:py-2 sm:px-4 bg-yellow-400 text-yellow-950 font-bold rounded-xl text-sm hover:bg-yellow-500 transition whitespace-nowrap">Add</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2.5 sm:py-2 text-zinc-400 text-sm hover:text-zinc-700 whitespace-nowrap">Cancel</button>
                    </div>
                </form>
            )}

            {/* MATRIX GRID OVERVIEW */}
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[500px]">
                    {/* Header Row (Dates) */}
                    <div className="flex mb-4">
                        <div className="w-40 shrink-0">
                            {/* Empty top-left cell */}
                        </div>
                        <div className="flex-1 flex justify-between gap-2 px-2">
                            {dateColumns.map((col, idx) => (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                    <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 ${col.isToday ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                                        {col.dayStr}
                                    </span>
                                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                        col.isToday 
                                        ? 'border-yellow-400/50 relative' 
                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}>
                                        {col.isToday && (
                                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full -mt-0.5 -mr-0.5" />
                                        )}
                                        <span className={col.isToday ? 'text-zinc-900 dark:text-zinc-100' : ''}>{col.dateNum}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Habits Rows */}
                    <div className="space-y-3">
                        {/* Title Row spanning names */}
                        <div className="flex items-center">
                            <div className="w-40 shrink-0">
                                <button 
                                    onClick={() => {
                                        setIsAdding(!isAdding);
                                        if (!isAdding && selectedCategory !== 'All') {
                                            setNewCategory(selectedCategory);
                                        }
                                    }}
                                    className="bg-yellow-400 text-yellow-950 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 shadow-sm hover:bg-yellow-500 transition-colors w-full"
                                >
                                    Habits <Plus className="w-4 h-4 ml-auto" />
                                </button>
                            </div>
                            <div className="flex-1" />
                        </div>

                        {filteredHabits.length === 0 ? (
                            <div className="text-center py-8 text-sm text-zinc-500">
                                No habits found in this category. Let's build a new one!
                            </div>
                        ) : (
                            filteredHabits.map((habit) => (
                                <div key={habit.id} className="flex items-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-1 -m-1 rounded-xl transition-colors">
                                    <div className="w-40 shrink-0 pr-4">
                                        <div className="px-3 py-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            {habit.title}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex justify-between gap-2 px-2">
                                        {dateColumns.map((col, idx) => {
                                            const isCompleted = habit.completedDates.includes(col.isoString);
                                            return (
                                                <div key={idx} className="flex-1 flex justify-center">
                                                    <button
                                                        onClick={() => handleToggle(habit.id, col.isoString, habit.completedDates)}
                                                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all duration-300 transform active:scale-90 ${
                                                            isCompleted 
                                                            ? 'bg-lime-500 shadow-sm shadow-lime-500/20 text-white' 
                                                            : 'bg-lime-100/50 dark:bg-lime-900/10 hover:bg-lime-200/50 dark:hover:bg-lime-900/30'
                                                        }`}
                                                        aria-label={`Toggle ${habit.title} on ${col.date}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
