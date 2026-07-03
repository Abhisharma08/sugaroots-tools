import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { saveHealthLog, getHealthLogs } from '@/lib/firestore';

export interface FoodEntry {
  id: string;
  name: string;
  category: string;
  quantity: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface WorkoutEntry {
  id: string;
  exercise: string;
  met: number;
  durationHours: number;
}

export interface DailyLog {
  date: string;
  weight: number;
  steps: number;
  water: number;
  sleep: {
    bedtime: string;
    wakeTime: string;
    durationHours: number;
  };
  glucose: {
    fasting: string;
    postMeal: string;
    hba1c: string;
    symptoms: string;
    action: string;
  };
  food: FoodEntry[];
  workouts: WorkoutEntry[];
  notes: string;
}

export const createEmptyLog = (date: string): DailyLog => ({
  date,
  weight: 0,
  steps: 0,
  water: 0,
  sleep: { bedtime: '', wakeTime: '', durationHours: 0 },
  glucose: { fasting: '', postMeal: '', hba1c: '', symptoms: '', action: '' },
  food: [],
  workouts: [],
  notes: '',
});

interface HealthTrackerState {
  logs: Record<string, DailyLog>; // map of date YYYY-MM-DD to DailyLog
  currentDate: string; // YYYY-MM-DD
  _hydrated: boolean; // whether persist storage has been loaded
  syncError: string | null; // last Firestore save/load failure, if any
  setCurrentDate: (date: string) => void;
  updateLog: (date: string, partial: Partial<DailyLog>) => void;
  getLog: (date: string) => DailyLog;
  startFirestoreSync: (uid: string) => Promise<void>;
  saveLogNow: (date: string) => Promise<void>;
  
  // Specific quick actions for the current date
  updateVitals: (vitals: Partial<{ weight: number; steps: number }>) => void;
  updateGlucose: (glucose: Partial<DailyLog['glucose']>) => void;
  updateLifestyle: (lifestyle: Partial<{ water: number; sleep: Partial<DailyLog['sleep']>; notes: string }>) => void;
  
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => void;
  removeFoodEntry: (id: string) => void;
  
  addWorkoutEntry: (entry: Omit<WorkoutEntry, 'id'>) => void;
  removeWorkoutEntry: (id: string) => void;
}

const emptyLogsCache: Record<string, DailyLog> = {};

export const getCachedEmptyLog = (date: string): DailyLog => {
  if (!emptyLogsCache[date]) {
    emptyLogsCache[date] = createEmptyLog(date);
  }
  return emptyLogsCache[date];
};

const mergedLogCache = new WeakMap<object, DailyLog>();

// Firestore sync state (module-level; not part of the reactive store)
let syncUid: string | null = null;
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useHealthTrackerStore = create<HealthTrackerState>()(
  persist(
    (set, get) => {
      // Debounced per-date write-through to Firestore
      const scheduleSave = (date: string) => {
        if (!syncUid) return;
        const uid = syncUid;
        const existing = saveTimers.get(date);
        if (existing) clearTimeout(existing);
        saveTimers.set(
          date,
          setTimeout(() => {
            saveTimers.delete(date);
            saveHealthLog(uid, get().getLog(date)).then(
              () => set({ syncError: null }),
              (err) => {
                console.error('Failed to save health log to Firestore:', err);
                set({ syncError: 'Could not save to the cloud. Changes are kept on this device.' });
              }
            );
          }, 1000)
        );
      };

      return {
      logs: {},
      currentDate: format(new Date(), 'yyyy-MM-dd'),
      _hydrated: false,
      syncError: null,

      startFirestoreSync: async (uid) => {
        syncUid = uid;
        try {
          const remote = await getHealthLogs(uid);
          // Remote is the source of truth across devices; merge over local cache
          set((state) => ({ logs: { ...state.logs, ...remote }, syncError: null }));
        } catch (err) {
          console.error('Failed to load health logs from Firestore:', err);
          set({ syncError: 'Could not load your cloud data. Showing local data only.' });
        }
      },

      saveLogNow: async (date) => {
        const timer = saveTimers.get(date);
        if (timer) {
          clearTimeout(timer);
          saveTimers.delete(date);
        }
        if (!syncUid) return;
        try {
          await saveHealthLog(syncUid, get().getLog(date));
          set({ syncError: null });
        } catch (err) {
          console.error('Failed to save health log to Firestore:', err);
          set({ syncError: 'Could not save to the cloud. Changes are kept on this device.' });
          throw err;
        }
      },

      setCurrentDate: (date) => set({ currentDate: date }),
      
      getLog: (date) => {
        const existing = get().logs[date];
        if (!existing) return getCachedEmptyLog(date);
        
        // Fast path: if the log has all required nested objects, return it directly.
        if (existing.sleep && existing.glucose && existing.food && existing.workouts) {
          return existing;
        }

        // If it's missing fields (e.g. from older persisted state), merge it.
        // Cache the merged result using WeakMap to ensure stable references.
        if (mergedLogCache.has(existing)) {
          return mergedLogCache.get(existing)!;
        }

        const emptyLog = getCachedEmptyLog(date);
        const merged: DailyLog = {
          ...emptyLog,
          ...existing,
          sleep: { ...emptyLog.sleep, ...(existing.sleep || {}) },
          glucose: { ...emptyLog.glucose, ...(existing.glucose || {}) },
          food: existing.food || [],
          workouts: existing.workouts || [],
        };
        
        mergedLogCache.set(existing, merged);
        return merged;
      },
      
      updateLog: (date, partial) => {
        set((state) => {
          // Use getLog from the store closure (get()) instead of state to avoid issues
          const log = get().getLog(date);
          return {
            logs: {
              ...state.logs,
              [date]: { ...log, ...partial },
            },
          };
        });
        scheduleSave(date);
      },
      
      updateVitals: (vitals) => {
        const date = get().currentDate;
        get().updateLog(date, { ...vitals });
      },
      
      updateGlucose: (glucose) => {
        const date = get().currentDate;
        const log = get().getLog(date);
        get().updateLog(date, { glucose: { ...log.glucose, ...glucose } });
      },
      
      updateLifestyle: (lifestyle) => {
        const date = get().currentDate;
        const log = get().getLog(date);
        const updates: Partial<DailyLog> = {};
        if (lifestyle.water !== undefined) updates.water = lifestyle.water;
        if (lifestyle.notes !== undefined) updates.notes = lifestyle.notes;
        if (lifestyle.sleep !== undefined) updates.sleep = { ...log.sleep, ...lifestyle.sleep };
        get().updateLog(date, updates);
      },
      
      addFoodEntry: (entry) => {
        const date = get().currentDate;
        const log = get().getLog(date);
        const newEntry: FoodEntry = { ...entry, id: Math.random().toString(36).substr(2, 9) };
        get().updateLog(date, { food: [...log.food, newEntry] });
      },
      
      removeFoodEntry: (id) => {
        const date = get().currentDate;
        const log = get().getLog(date);
        get().updateLog(date, { food: log.food.filter(f => f.id !== id) });
      },
      
      addWorkoutEntry: (entry) => {
        const date = get().currentDate;
        const log = get().getLog(date);
        const newEntry: WorkoutEntry = { ...entry, id: Math.random().toString(36).substr(2, 9) };
        get().updateLog(date, { workouts: [...log.workouts, newEntry] });
      },
      
      removeWorkoutEntry: (id) => {
        const date = get().currentDate;
        const log = get().getLog(date);
        get().updateLog(date, { workouts: log.workouts.filter(w => w.id !== id) });
      },
      };
    },
    {
      name: 'SugaRoots_health_tracker',
      // Exclude internal flags from persistence
      partialize: (state) => ({
        logs: state.logs,
        currentDate: state.currentDate,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state._hydrated = true;
          }
        };
      },
    }
  )
);

// Derived Selectors
export const selectCurrentLog = (state: HealthTrackerState) => state.getLog(state.currentDate);

export const selectCalculatedMetrics = (log: DailyLog) => {
  const stepCalories = (log?.steps || 0) * 0.04;
  
  const defaultWeight = 80;
  const weight = log?.weight || defaultWeight;
  
  const workouts = log?.workouts || [];
  const workoutCalories = workouts.reduce((acc, w) => {
    return acc + (w.met * weight * w.durationHours);
  }, 0);
  
  const foods = log?.food || [];
  const foodCalories = foods.reduce((acc, f) => acc + f.calories, 0);
  const foodCarbs = foods.reduce((acc, f) => acc + f.carbs, 0);
  const foodProtein = foods.reduce((acc, f) => acc + f.protein, 0);
  const foodFat = foods.reduce((acc, f) => acc + f.fat, 0);
  
  const netCalories = foodCalories - (stepCalories + workoutCalories);
  
  // Health score calculation (simple 0-6 logic)
  let healthScore = 0;
  if ((log?.steps || 0) >= 7000) healthScore++;
  if ((log?.water || 0) >= 8) healthScore++;
  
  const sleepHours = log?.sleep?.durationHours || 0;
  if (sleepHours >= 7 && sleepHours <= 9) healthScore++;
  if (workouts.length > 0) healthScore++;
  if (netCalories <= -300) healthScore++; // Assuming weight loss goal, or adjust logic
  
  // Try parsing glucose string to check if it's within target
  const pmGlucose = parseInt(log?.glucose?.postMeal || '');
  if (!isNaN(pmGlucose) && pmGlucose < 140) healthScore++;

  return {
    stepCalories: Math.round(stepCalories),
    workoutCalories: Math.round(workoutCalories),
    totalBurned: Math.round(stepCalories + workoutCalories),
    foodCalories: Math.round(foodCalories),
    foodMacros: { carbs: Math.round(foodCarbs), protein: Math.round(foodProtein), fat: Math.round(foodFat) },
    netCalories: Math.round(netCalories),
    healthScore,
  };
};
