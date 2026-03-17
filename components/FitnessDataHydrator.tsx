'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useFitnessStore } from '@/store/useFitnessStore';

export function FitnessDataHydrator({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { loadFromFirestore, firestoreLoaded } = useFitnessStore();

    useEffect(() => {
        if (user?.uid) {
            loadFromFirestore(user.uid);
        }
    }, [user?.uid, loadFromFirestore]);

    // Optional: Could return null or a generic spinner if !firestoreLoaded
    // But returning children directly allows the UI to render while fetching
    return <>{children}</>;
}
