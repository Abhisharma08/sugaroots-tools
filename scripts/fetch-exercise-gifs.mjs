#!/usr/bin/env node
/**
 * Downloads animated exercise GIFs from ExerciseDB (RapidAPI) into
 * public/exercises/, using the filenames that lib/workout-plans.ts
 * already references in its `media` fields.
 *
 * Usage:
 *   1. Create a free account at https://rapidapi.com and subscribe to
 *      the ExerciseDB API (free tier).
 *   2. Run:  EXERCISEDB_KEY=your-rapidapi-key node scripts/fetch-exercise-gifs.mjs
 *
 * The script is idempotent: already-downloaded files are skipped, and any
 * exercise it can't find simply keeps its emoji fallback in the app.
 */

import { writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.EXERCISEDB_KEY;
const HOST = 'exercisedb.p.rapidapi.com';
const OUT_DIR = path.join(process.cwd(), 'public', 'exercises');
const DELAY_MS = 400; // stay well inside the free-tier rate limit

if (!KEY) {
    console.error('Missing EXERCISEDB_KEY environment variable.');
    console.error('Usage: EXERCISEDB_KEY=your-rapidapi-key node scripts/fetch-exercise-gifs.mjs');
    process.exit(1);
}

// slug = output filename (must match `media` in lib/workout-plans.ts)
// id   = exact ExerciseDB exercise id (skips searching)
// terms = ExerciseDB search terms, tried in order until one matches
const EXERCISES = [
    // Steps + Home Workout (Free Hand)
    { slug: 'jumping-jacks', id: '3224' }, // jack jump
    { slug: 'bodyweight-squats', terms: ['jump squat', 'sissy squat'], preferEquipment: 'body weight' },
    { slug: 'push-ups', id: '0662' }, // push-up
    { slug: 'walking-lunges', terms: ['walking lunge', 'lunge'] },
    { slug: 'mountain-climbers', terms: ['mountain climber'] },
    { slug: 'plank-hold', id: '2135' }, // weighted front plank (plain hold visual)
    { slug: 'burpees', terms: ['burpee'] },

    // Steps + Home Workout Dumbbell
    { slug: 'goblet-squats', terms: ['dumbbell goblet squat', 'goblet squat'] },
    { slug: 'dumbbell-shoulder-press', terms: ['dumbbell shoulder press', 'dumbbell seated shoulder press'] },
    { slug: 'bent-over-dumbbell-rows', terms: ['dumbbell bent over row', 'dumbbell row'] },
    { slug: 'dumbbell-lunges', terms: ['dumbbell lunge'] },
    { slug: 'dumbbell-romanian-deadlifts', terms: ['dumbbell romanian deadlift', 'dumbbell straight leg deadlift'] },
    { slug: 'dumbbell-bicep-curls', terms: ['dumbbell biceps curl', 'dumbbell curl'] },
    { slug: 'dumbbell-russian-twists', terms: ['russian twist'] },

    // Steps + Upper Body
    { slug: 'barbell-bench-press', terms: ['barbell bench press'] },
    { slug: 'lat-pulldown', terms: ['cable pulldown', 'lat pulldown', 'pulldown'] },
    { slug: 'seated-cable-row', terms: ['cable seated row', 'seated row'] },
    { slug: 'cable-chest-fly', terms: ['cable middle fly', 'cable fly', 'cable standing fly'] },
    { slug: 'tricep-rope-pushdown', terms: ['cable pushdown', 'triceps pushdown'] },
    { slug: 'ez-bar-curls', terms: ['ez barbell curl', 'ez bar curl'] },
    { slug: 'face-pulls', terms: ['face pull', 'cable rear delt row'] },

    // Steps + Lower Body
    { slug: 'barbell-back-squats', terms: ['barbell full squat', 'barbell squat'] },
    { slug: 'leg-press', terms: ['sled 45° leg press', 'leg press'] },
    { slug: 'romanian-deadlifts', terms: ['barbell romanian deadlift', 'romanian deadlift'] },
    { slug: 'leg-extensions', terms: ['lever leg extension', 'leg extension'] },
    { slug: 'lying-leg-curls', terms: ['lever lying leg curl', 'lying leg curl'] },
    { slug: 'standing-calf-raises', terms: ['standing calf raise', 'calf raise'] },

    // Steps + Abs / Core
    { slug: 'hanging-knee-raises', id: '0011' }, // assisted hanging knee raise
    { slug: 'cable-crunches', terms: ['cable kneeling crunch', 'cable crunch'] },
    { slug: 'leg-raises', id: '0620' }, // lying leg raise flat bench
    { slug: 'side-plank', id: '3544' }, // bodyweight incline side plank
    { slug: 'bicycle-crunches', terms: ['air bike', 'bicycle crunch'] },

    // Cardio Options
    { slug: 'incline-treadmill-walk', id: '3666' }, // walking on incline treadmill
    { slug: 'stationary-cycling', terms: ['stationary bike run', 'stationary bike', 'cycle'] },
    { slug: 'rowing-machine', terms: ['rowing machine', 'rowing', 'rower'] }, // not in ExerciseDB as of writing
    { slug: 'stair-climber', terms: ['walking on stepmill', 'stair climber', 'stepmill'] },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fileExists(p) {
    try {
        await access(p);
        return true;
    } catch {
        return false;
    }
}

async function searchExercises(term) {
    const url = `https://${HOST}/exercises/name/${encodeURIComponent(term)}?limit=25`;
    const res = await fetch(url, {
        headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST },
    });
    if (res.status === 429) throw new Error('Rate limited by ExerciseDB — wait a minute and re-run.');
    if (!res.ok) throw new Error(`Search "${term}" failed: HTTP ${res.status}`);
    return res.json();
}

function pickBest(results, term, preferEquipment) {
    if (!Array.isArray(results) || results.length === 0) return null;
    const pool = preferEquipment
        ? results.filter((r) => r.equipment === preferEquipment)
        : results;
    if (pool.length === 0) return null;
    const exact = pool.find((r) => r.name?.toLowerCase() === term.toLowerCase());
    return exact ?? pool[0];
}

// Exercise objects no longer carry a gifUrl; GIFs are served by the
// separate /image endpoint keyed on the exercise id.
async function downloadGif(exerciseId) {
    const url = `https://${HOST}/image?exerciseId=${encodeURIComponent(exerciseId)}&resolution=360`;
    const res = await fetch(url, {
        headers: { 'X-RapidAPI-Key': KEY, 'X-RapidAPI-Host': HOST },
    });
    if (!res.ok) throw new Error(`GIF download failed: HTTP ${res.status}`);
    const type = res.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) throw new Error(`Unexpected content-type: ${type}`);
    return Buffer.from(await res.arrayBuffer());
}

async function main() {
    await mkdir(OUT_DIR, { recursive: true });
    let done = 0;
    let skipped = 0;
    const failed = [];

    for (const { slug, id, terms, preferEquipment } of EXERCISES) {
        const outPath = path.join(OUT_DIR, `${slug}.gif`);
        if (await fileExists(outPath)) {
            console.log(`✓ ${slug} (already downloaded)`);
            skipped++;
            continue;
        }

        let matchId = id ?? null;
        let matchLabel = id ? `id ${id}` : null;
        if (!matchId) {
            for (const term of terms ?? []) {
                try {
                    const results = await searchExercises(term);
                    const match = pickBest(results, term, preferEquipment);
                    if (match?.id) {
                        matchId = match.id;
                        matchLabel = `"${match.name}" (term: "${term}")`;
                        break;
                    }
                } catch (err) {
                    console.warn(`  search "${term}" for ${slug}: ${err.message}`);
                }
                await sleep(DELAY_MS);
            }
        }

        if (!matchId) {
            console.warn(`✗ ${slug} — no match found (emoji fallback will be used)`);
            failed.push(slug);
            continue;
        }

        try {
            const gif = await downloadGif(matchId);
            await writeFile(outPath, gif);
            console.log(`✓ ${slug} ← ${matchLabel} (${(gif.length / 1024).toFixed(0)} KB)`);
            done++;
        } catch (err) {
            console.warn(`✗ ${slug} — ${err.message} (emoji fallback will be used)`);
            failed.push(slug);
        }
        await sleep(DELAY_MS);
    }

    console.log(`\nDone: ${done} downloaded, ${skipped} already present, ${failed.length} failed.`);
    if (failed.length > 0) {
        console.log(`Failed (emoji fallback stays): ${failed.join(', ')}`);
        console.log('You can re-run the script — existing files are skipped.');
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
