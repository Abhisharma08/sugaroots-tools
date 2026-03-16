import { create } from 'zustand';
import {
    getHabits,
    addHabit,
    deleteHabit,
    toggleHabitCompletion,
    type FirestoreHabit,
} from '@/lib/firestore';

interface HabitState {
    habits: FirestoreHabit[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchHabits: (uid: string) => Promise<void>;
    createNewHabit: (uid: string, title: string, category?: string) => Promise<void>;
    removeHabit: (uid: string, habitId: string) => Promise<void>;
    toggleHabit: (uid: string, habitId: string, dateStr: string, isCompleted: boolean) => Promise<void>;
    clearHabits: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
    habits: [],
    isLoading: false,
    error: null,

    fetchHabits: async (uid: string) => {
        set({ isLoading: true, error: null });
        try {
            const habits = await getHabits(uid);
            set({ habits, isLoading: false });
        } catch (error: any) {
            console.error('Error fetching habits:', error);
            set({ error: error.message || 'Failed to fetch habits', isLoading: false });
        }
    },

    createNewHabit: async (uid: string, title: string, category?: string) => {
        try {
            // Optimistic UI
            const newId = await addHabit(uid, title, category);
            const newHabit: FirestoreHabit = {
                id: newId,
                title,
                ...(category ? { category } : {}),
                completedDates: [],
                // createdAt is serverTimestamp, won't have it exactly locally, but it's fine for UI
            };
            set((state) => ({ habits: [...state.habits, newHabit] }));
        } catch (error: any) {
            console.error('Error adding habit:', error);
            set({ error: error.message || 'Failed to add habit' });
        }
    },

    removeHabit: async (uid: string, habitId: string) => {
        // Optimistic delete
        const previousHabits = get().habits;
        set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) }));
        
        try {
            await deleteHabit(uid, habitId);
        } catch (error: any) {
            console.error('Error deleting habit:', error);
            // Revert on failure
            set({ habits: previousHabits, error: error.message || 'Failed to delete habit' });
        }
    },

    toggleHabit: async (uid: string, habitId: string, dateStr: string, isCompleted: boolean) => {
        const previousHabits = get().habits;
        
        // Optimistic update
        set((state) => ({
            habits: state.habits.map((habit) => {
                if (habit.id === habitId) {
                    const newDates = isCompleted
                        ? [...habit.completedDates, dateStr]
                        : habit.completedDates.filter((d) => d !== dateStr);
                    return { ...habit, completedDates: newDates };
                }
                return habit;
            }),
        }));

        try {
            await toggleHabitCompletion(uid, habitId, dateStr, isCompleted);
        } catch (error: any) {
            console.error('Error toggling habit:', error);
            // Revert on failure
            set({ habits: previousHabits, error: error.message || 'Failed to update habit' });
        }
    },

    clearHabits: () => {
        set({ habits: [], isLoading: false, error: null });
    },
}));
