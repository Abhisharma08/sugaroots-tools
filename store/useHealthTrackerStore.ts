import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setCurrentDate: (date: string) => void;
  updateLog: (date: string, partial: Partial<DailyLog>) => void;
  getLog: (date: string) => DailyLog;
  
  // Specific quick actions for the current date
  updateVitals: (vitals: Partial<{ weight: number; steps: number }>) => void;
  updateGlucose: (glucose: Partial<DailyLog['glucose']>) => void;
  updateLifestyle: (lifestyle: Partial<{ water: number; sleep: Partial<DailyLog['sleep']>; notes: string }>) => void;
  
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => void;
  removeFoodEntry: (id: string) => void;
  
  addWorkoutEntry: (entry: Omit<WorkoutEntry, 'id'>) => void;
  removeWorkoutEntry: (id: string) => void;
}

export const useHealthTrackerStore = create<HealthTrackerState>()(
  persist(
    (set, get) => ({
      logs: {},
      currentDate: new Date().toISOString().split('T')[0],
      
      setCurrentDate: (date) => set({ currentDate: date }),
      
      getLog: (date) => {
        const existing = get().logs[date];
        if (!existing) return createEmptyLog(date);
        return {
          ...createEmptyLog(date),
          ...existing,
          sleep: { ...createEmptyLog(date).sleep, ...(existing.sleep || {}) },
          glucose: { ...createEmptyLog(date).glucose, ...(existing.glucose || {}) },
          food: existing.food || [],
          workouts: existing.workouts || [],
        };
      },
      
      updateLog: (date, partial) => set((state) => {
        const log = state.getLog ? state.getLog(date) : (state.logs[date] || createEmptyLog(date));
        return {
          logs: {
            ...state.logs,
            [date]: { ...log, ...partial },
          },
        };
      }),
      
      updateVitals: (vitals) => {
        const date = get().currentDate;
        const log = get().getLog(date);
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
    }),
    {
      name: 'SugaRoots_health_tracker',
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
