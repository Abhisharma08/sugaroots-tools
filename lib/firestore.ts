import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    deleteDoc,
    type DocumentData,
} from 'firebase/firestore';
import { getClientDb } from './firebase';

// ─── User Profile ───────────────────────────────────────────

export interface FirestoreUserProfile {
    age: number;
    gender: 'male' | 'female';
    weight: number;
    height: number;
    activityLevel: number;
    targetWeight: number;
    pace: 'mild' | 'moderate' | 'aggressive';
    updatedAt?: any;
}

export interface FirestoreDerivedData {
    bmr: number;
    tdee: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
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
    updatedAt?: any;
}

/**
 * Save or update the user's profile in Firestore
 */
export async function saveUserProfile(uid: string, profile: Partial<FirestoreUserProfile>) {
    const ref = doc(getClientDb(), 'users', uid);
    await setDoc(ref, { profile: { ...profile, updatedAt: serverTimestamp() } }, { merge: true });
}

/**
 * Save the derived/calculated data (BMR, TDEE, macros, etc.)
 */
export async function saveDerivedData(uid: string, derived: FirestoreDerivedData) {
    const ref = doc(getClientDb(), 'users', uid);
    await setDoc(ref, { derived: { ...derived, updatedAt: serverTimestamp() } }, { merge: true });
}

/**
 * Get the full user document (profile + derived)
 */
export async function getUserData(uid: string) {
    const ref = doc(getClientDb(), 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
}

// ─── Calculation History ────────────────────────────────────

export interface CalculationEntry {
    type: 'bmr' | 'weight-plan';
    inputs: DocumentData;
    results: DocumentData;
    createdAt?: any;
}

/**
 * Save a calculation to the user's history subcollection
 */
export async function saveCalculation(uid: string, entry: CalculationEntry) {
    const colRef = collection(getClientDb(), 'users', uid, 'calculations');
    await addDoc(colRef, { ...entry, createdAt: serverTimestamp() });
}

/**
 * Get calculation history for a user, optionally filtered by type
 */
export async function getCalculationHistory(uid: string, type?: 'bmr' | 'weight-plan') {
    const colRef = collection(getClientDb(), 'users', uid, 'calculations');
    const q = type
        ? query(colRef, where('type', '==', type), orderBy('createdAt', 'desc'))
        : query(colRef, orderBy('createdAt', 'desc'));

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Habits Tracker ──────────────────────────────────────────

export interface FirestoreHabit {
    id?: string;
    title: string;
    category?: string; // e.g. 'Health', 'Work', 'Family'
    completedDates: string[]; // YYYY-MM-DD format
    createdAt?: any;
}

/**
 * Fetch all habits for a user
 */
export async function getHabits(uid: string): Promise<FirestoreHabit[]> {
    const colRef = collection(getClientDb(), 'users', uid, 'habits');
    const q = query(colRef, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreHabit));
}

/**
 * Add a new habit for a user
 */
export async function addHabit(uid: string, title: string, category?: string): Promise<string> {
    const colRef = collection(getClientDb(), 'users', uid, 'habits');
    const docRef = await addDoc(colRef, {
        title,
        ...(category ? { category } : {}),
        completedDates: [],
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Delete a habit
 */
export async function deleteHabit(uid: string, habitId: string): Promise<void> {
    const ref = doc(getClientDb(), 'users', uid, 'habits', habitId);
    await deleteDoc(ref);
}

/**
 * Toggle a specific date in a habit's completed list
 */
export async function toggleHabitCompletion(
    uid: string,
    habitId: string,
    dateStr: string,
    isCompleted: boolean
): Promise<void> {
    const ref = doc(getClientDb(), 'users', uid, 'habits', habitId);
    await setDoc(
        ref,
        {
            completedDates: isCompleted ? arrayUnion(dateStr) : arrayRemove(dateStr),
        },
        { merge: true }
    );
}
