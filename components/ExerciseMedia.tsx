'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// lottie-web touches browser globals, so load it client-side only
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface ExerciseMediaProps {
    /**
     * Optional media asset for the exercise:
     * - '/animations/name.json'  → Lottie animation (from LottieFiles)
     * - '/exercises/name.gif'    → animated GIF / image (e.g. from ExerciseDB)
     * Falls back to the emoji when absent or when loading fails.
     */
    media?: string;
    /** Emoji fallback shown when no media is set or it fails to load */
    fallback: string;
    alt: string;
}

const IMAGE_RE = /\.(gif|png|jpe?g|webp|svg)$/i;

export function ExerciseMedia({ media, fallback, alt }: ExerciseMediaProps) {
    const isLottie = !!media && media.toLowerCase().endsWith('.json');
    const isImage = !!media && IMAGE_RE.test(media);

    const [lottieData, setLottieData] = useState<object | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
        setLottieData(null);
        if (!isLottie || !media) return;

        let cancelled = false;
        fetch(media)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setLottieData(data);
            })
            .catch((err) => {
                console.error(`Failed to load animation ${media}:`, err);
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [media, isLottie]);

    if (!failed && isLottie && lottieData) {
        return (
            <Lottie
                animationData={lottieData}
                loop
                aria-label={alt}
                className="w-full h-full"
            />
        );
    }

    if (!failed && isImage && media) {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- animated GIFs bypass next/image optimization
            <img
                src={media}
                alt={alt}
                loading="lazy"
                onError={() => setFailed(true)}
                className="w-full h-full object-cover"
            />
        );
    }

    // Emoji fallback (also shown while a Lottie file is still loading)
    return (
        <span role="img" aria-label={alt}>
            {fallback}
        </span>
    );
}
