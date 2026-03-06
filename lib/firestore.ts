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
    dailyCalorieTarget: number;
    dailyExerciseBurnTarget: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
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
