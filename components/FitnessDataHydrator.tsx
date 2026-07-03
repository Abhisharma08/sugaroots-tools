'use client';

import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useFitnessStore } from '@/store/useFitnessStore';
import { useHealthTrackerStore } from '@/store/useHealthTrackerStore';

export function FitnessDataHydrator({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { loadFromFirestore, hydrateUserInfo } = useFitnessStore();
    const startHealthSync = useHealthTrackerStore((s) => s.startFirestoreSync);

    useEffect(() => {
        hydrateUserInfo();
    }, [hydrateUserInfo]);

    useEffect(() => {
        if (user?.uid) {
            // Explicitly catch at call site to prevent unhandled rejection in React 19
            loadFromFirestore(user.uid).catch((err) => {
                console.error('FitnessDataHydrator: Failed to load data:', err);
            });
            startHealthSync(user.uid).catch((err) => {
                console.error('FitnessDataHydrator: Failed to sync health logs:', err);
            });
        }
    }, [user?.uid, loadFromFirestore, startHealthSync]);

    // Optional: Could return null or a generic spinner if !firestoreLoaded
    // But returning children directly allows the UI to render while fetching
    return <>{children}</>;
}

