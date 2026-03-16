import { create } from 'zustand';
import { getUserData, saveUserProfile, saveDerivedData } from '@/lib/firestore';

export type Gender = 'male' | 'female';
export type Pace = 'mild' | 'moderate' | 'aggressive';

export interface UserProfile {
  age: number;
  gender: Gender;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: number; // e.g., 1.2 for sedentary, 1.55 for moderate, etc.
}

export interface Goals {
  targetWeight: number; // in kg
  pace: Pace;
}

export interface Macros {
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
}

export interface DerivedState {
  bmr: number;
  tdee: number;
  macros: Macros;
  // New Weight Loss Calculator fields
  fatToLose: number;
  totalCalorieDeficit: number;
  weeklyWeightLoss: number;
  weeklyCalorieDeficit: number;
  dailyCalorieDeficit: number;
  foodDeficit: number;
  exerciseBurn: number;
  recommendedDailyCalories: number;
  weeksRequired: number;
  daysRequired: number;
}

export interface UserInfo {
  uid: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface FitnessStore {
  profile: UserProfile;
  goals: Goals;
  derived: DerivedState;
  firestoreLoaded: boolean;
  userInfo: UserInfo | null;

  updateProfile: (profile: Partial<UserProfile>) => void;
  updateGoals: (goals: Partial<Goals>) => void;
  setUserInfo: (info: UserInfo) => void;
  loadFromFirestore: (uid: string) => Promise<void>;
  saveToFirestore: (uid: string) => Promise<void>;
}

const calculateDerivedState = (profile: UserProfile, goals: Goals): DerivedState => {
  // 1. Calculate BMR using Mifflin-St Jeor Equation
  const bmrBase = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  const bmr = profile.gender === 'male' ? bmrBase + 5 : bmrBase - 161;

  // 2. Calculate TDEE
  const tdee = bmr * profile.activityLevel;

  // === Weight Loss Calculator Logic (Steps 1-10) ===

  // Step 1 - Fat to Lose
  // Prevent negative fat to lose, but let UI handle the error state
  const fatToLose = Math.max(0, profile.weight - goals.targetWeight);

  // Step 2 - Total Calories to Burn
  const totalCalorieDeficit = fatToLose * 7700;

  // Step 3 - Weekly Fat Loss Based on Speed
  let weeklyWeightLoss = 0.50; // default moderate
  if (goals.pace === 'mild') weeklyWeightLoss = 0.25; // steady
  if (goals.pace === 'moderate') weeklyWeightLoss = 0.50;
  if (goals.pace === 'aggressive') weeklyWeightLoss = 0.75;

  // Step 4 - Weekly Calorie Deficit
  const weeklyCalorieDeficit = weeklyWeightLoss * 7700;

  // Step 5 - Daily Calorie Deficit
  const baseDailyCalorieDeficit = weeklyCalorieDeficit / 7;

  // Step 6 - Food Deficit and Exercise Burn (70/30 split)
  let foodDeficit = baseDailyCalorieDeficit * 0.70;
  let exerciseBurn = baseDailyCalorieDeficit * 0.30;

  // Step 7 - Recommended Daily Calories
  let recommendedDailyCalories = tdee - foodDeficit;

  // Step 8 - Safety Check (BMR Rule)
  // System must enforce: recommended_daily_calories >= BMR
  if (recommendedDailyCalories < bmr) {
    // Option 1: Reduce daily deficit from food to match BMR exactly
    const maxSafeFoodDeficit = tdee - bmr;
    foodDeficit = Math.max(0, maxSafeFoodDeficit); // Ensure it doesn't go negative if TDEE < BMR (rare edge case)
    recommendedDailyCalories = tdee - foodDeficit;

    // We adjust exercise burn to try and make up the difference to reach the target deficit,
    // Note: The spec said "reduce_daily_deficit" as preferred action.
    // If we simply cap foodDeficit and leave exerciseBurn alone, the daily deficit naturally reduces.
    // So we don't inflate exerciseBurn, we just accept a slower pace.
  }

  // Calculate actual effective daily deficit after safety adjustments
  const actualDailyCalorieDeficit = foodDeficit + exerciseBurn;

  // Recalculate weeks based on the actual daily deficit instead of the theoretical one
  const actualWeeklyDeficit = actualDailyCalorieDeficit * 7;
  const actualWeeklyWeightLoss = actualWeeklyDeficit / 7700;

  // Step 9 - Weeks Required to Reach Goal
  const weeksRequired = actualWeeklyWeightLoss > 0 ? fatToLose / actualWeeklyWeightLoss : 0;

  // Step 10 - Days Required
  const daysRequired = weeksRequired * 7;

  // 5. Calculate Macros (Standard Split: 30% Protein, 40% Carbs, 30% Fats)
  // Using the new recommendedDailyCalories which respects the BMR safety check
  const macros = {
    protein: Math.round((recommendedDailyCalories * 0.3) / 4),
    carbs: Math.round((recommendedDailyCalories * 0.4) / 4),
    fats: Math.round((recommendedDailyCalories * 0.3) / 9),
  };

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    macros,
    fatToLose: Number(fatToLose.toFixed(2)),
    totalCalorieDeficit: Math.round(totalCalorieDeficit),
    weeklyWeightLoss: Number(actualWeeklyWeightLoss.toFixed(2)),
    weeklyCalorieDeficit: Math.round(actualWeeklyDeficit),
    dailyCalorieDeficit: Math.round(actualDailyCalorieDeficit),
    foodDeficit: Math.round(foodDeficit),
    exerciseBurn: Math.round(exerciseBurn),
    recommendedDailyCalories: Math.round(recommendedDailyCalories),
    weeksRequired: Math.ceil(weeksRequired),
    daysRequired: Math.ceil(daysRequired),
  };
};

// Default initial state
const initialProfile: UserProfile = {
  age: 30,
  gender: 'male',
  weight: 80,
  height: 175,
  activityLevel: 1.55, // Moderate activity
};

const initialGoals: Goals = {
  targetWeight: 75,
  pace: 'moderate',
};

export const useFitnessStore = create<FitnessStore>((set, get) => ({
  profile: initialProfile,
  goals: initialGoals,
  derived: calculateDerivedState(initialProfile, initialGoals),
  firestoreLoaded: false,
  userInfo: typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('SugaRoots_user_info') || 'null')
    : null,

  setUserInfo: (info: UserInfo) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('SugaRoots_user_info', JSON.stringify(info));
    }
    set({ userInfo: info });
  },

  updateProfile: (newProfile) =>
    set((state) => {
      const updatedProfile = { ...state.profile, ...newProfile };
      return {
        profile: updatedProfile,
        derived: calculateDerivedState(updatedProfile, state.goals),
      };
    }),

  updateGoals: (newGoals) =>
    set((state) => {
      const updatedGoals = { ...state.goals, ...newGoals };
      return {
        goals: updatedGoals,
        derived: calculateDerivedState(state.profile, updatedGoals),
      };
    }),

  loadFromFirestore: async (uid: string) => {
    try {
      const data = await getUserData(uid);
      if (data?.profile) {
        const profile: UserProfile = {
          age: data.profile.age ?? initialProfile.age,
          gender: data.profile.gender ?? initialProfile.gender,
          weight: data.profile.weight ?? initialProfile.weight,
          height: data.profile.height ?? initialProfile.height,
          activityLevel: data.profile.activityLevel ?? initialProfile.activityLevel,
        };
        const goals: Goals = {
          targetWeight: data.profile.targetWeight ?? initialGoals.targetWeight,
          pace: data.profile.pace ?? initialGoals.pace,
        };
        set({
          profile,
          goals,
          derived: calculateDerivedState(profile, goals),
          firestoreLoaded: true,
        });
      } else {
        set({ firestoreLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load from Firestore:', error);
      set({ firestoreLoaded: true });
    }
  },

  saveToFirestore: async (uid: string) => {
    try {
      const { profile, goals, derived } = get();
      await saveUserProfile(uid, {
        ...profile,
        targetWeight: goals.targetWeight,
        pace: goals.pace,
      });
      await saveDerivedData(uid, derived);
    } catch (error) {
      console.error('Failed to save to Firestore:', error);
    }
  },
}));
