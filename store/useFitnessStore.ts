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
  dailyCalorieTarget: number;
  dailyExerciseBurnTarget: number;
  macros: Macros;
}

export interface UserInfo {
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

  // 3. Calculate Daily Calorie Target
  let calorieAdjustment = 0;
  if (goals.pace === 'mild') calorieAdjustment = 250;
  if (goals.pace === 'moderate') calorieAdjustment = 500;
  if (goals.pace === 'aggressive') calorieAdjustment = 1000;

  // Determine if losing or gaining weight based on target vs current weight
  const isLosing = profile.weight > goals.targetWeight;
  const isGaining = profile.weight < goals.targetWeight;

  let dailyCalorieTarget = tdee;
  if (isLosing) {
    dailyCalorieTarget = tdee - calorieAdjustment;
  } else if (isGaining) {
    dailyCalorieTarget = tdee + calorieAdjustment;
  }

  // 4. Calculate Daily Exercise Burn Target
  const dailyExerciseBurnTarget = Math.max(0, tdee - bmr);

  // 5. Calculate Macros (Standard Split: 30% Protein, 40% Carbs, 30% Fats)
  const macros = {
    protein: Math.round((dailyCalorieTarget * 0.3) / 4),
    carbs: Math.round((dailyCalorieTarget * 0.4) / 4),
    fats: Math.round((dailyCalorieTarget * 0.3) / 9),
  };

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalorieTarget: Math.round(dailyCalorieTarget),
    dailyExerciseBurnTarget: Math.round(dailyExerciseBurnTarget),
    macros,
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
