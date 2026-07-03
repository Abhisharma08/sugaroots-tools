// ─── Workout Planner data ────────────────────────────────────
// Every plan targets a total burn of ~400 kcal (steps + exercises).
// Calorie figures are estimates for a ~75 kg adult.
//
// Visuals: `image` is the emoji fallback (always required).
// `media` points to an animation asset under /public:
//   - Animated GIF:      '/exercises/name.gif'
//     → downloaded in bulk by `scripts/fetch-exercise-gifs.mjs` (ExerciseDB)
//   - Lottie animation:  '/animations/name.json'
//     → downloaded manually from lottiefiles.com into public/animations/
// Until the file exists (or if it fails to load), the emoji is shown.

export type Audience = 'home-maker' | 'professional';

export interface PlanExercise {
    name: string;
    image: string; // emoji fallback
    media?: string; // optional Lottie JSON or GIF/image path under /public
    detail: string; // reps / sets / duration reference
    calories: number;
}

export interface WorkoutPlan {
    id: string;
    title: string;
    subtitle: string;
    requiresGym: boolean;
    steps?: { count: number; calories: number };
    exercises: PlanExercise[];
}

export const TARGET_BURN = 400;

export const WORKOUT_PLANS: WorkoutPlan[] = [
    // ─── No-gym plans (Home Maker & Professionals without gym) ───
    {
        id: 'steps-yoga',
        title: 'Steps + Yoga Plan',
        subtitle: 'Daily walking combined with a calming yoga sequence.',
        requiresGym: false,
        steps: { count: 5000, calories: 200 },
        exercises: [
            // Yoga poses are not in ExerciseDB — add Lottie files to
            // public/animations/ and set media: '/animations/<name>.json'
            { name: 'Surya Namaskar (Sun Salutation)', image: '🌅', detail: '12 rounds', calories: 90 },
            { name: 'Utkatasana (Chair Pose)', image: '🧘', detail: '3 holds × 30 sec', calories: 20 },
            { name: 'Virabhadrasana II (Warrior II)', image: '🤸', detail: '3 holds × 30 sec per side', calories: 25 },
            { name: 'Bhujangasana (Cobra Pose)', image: '🐍', detail: '3 holds × 10 breaths', calories: 15 },
            { name: 'Setu Bandhasana (Bridge Pose)', image: '🌉', detail: '3 sets × 12 lifts', calories: 25 },
            { name: 'Phalakasana (Plank Pose)', image: '🛶', detail: '3 holds × 30 sec', calories: 25 },
        ],
    },
    {
        id: 'steps-freehand',
        title: 'Steps + Home Workout (Free Hand) Plan',
        subtitle: 'No equipment needed — bodyweight only.',
        requiresGym: false,
        steps: { count: 5000, calories: 200 },
        exercises: [
            { name: 'Jumping Jacks', image: '🤾', media: '/exercises/jumping-jacks.gif', detail: '3 sets × 30 reps', calories: 30 },
            { name: 'Bodyweight Squats', image: '🏋️', media: '/exercises/bodyweight-squats.gif', detail: '3 sets × 15 reps', calories: 35 },
            { name: 'Push-ups', image: '💪', media: '/exercises/push-ups.gif', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Walking Lunges', image: '🚶', media: '/exercises/walking-lunges.gif', detail: '3 sets × 10 reps per leg', calories: 30 },
            { name: 'Mountain Climbers', image: '⛰️', media: '/exercises/mountain-climbers.gif', detail: '3 sets × 20 reps', calories: 30 },
            { name: 'Plank Hold', image: '🛶', media: '/exercises/plank-hold.gif', detail: '3 holds × 40 sec', calories: 20 },
            { name: 'Burpees', image: '🔥', media: '/exercises/burpees.gif', detail: '2 sets × 10 reps', calories: 30 },
        ],
    },
    {
        id: 'steps-dumbbell',
        title: 'Steps + Home Workout Dumbbell Plan',
        subtitle: 'Strength at home with a pair of dumbbells.',
        requiresGym: false,
        steps: { count: 5000, calories: 200 },
        exercises: [
            { name: 'Goblet Squats', image: '🏋️', media: '/exercises/goblet-squats.gif', detail: '3 sets × 12 reps', calories: 35 },
            { name: 'Dumbbell Shoulder Press', image: '💪', media: '/exercises/dumbbell-shoulder-press.gif', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Bent-over Dumbbell Rows', image: '🚣', media: '/exercises/bent-over-dumbbell-rows.gif', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Dumbbell Lunges', image: '🚶', media: '/exercises/dumbbell-lunges.gif', detail: '3 sets × 10 reps per leg', calories: 30 },
            { name: 'Dumbbell Romanian Deadlifts', image: '🏗️', media: '/exercises/dumbbell-romanian-deadlifts.gif', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Dumbbell Bicep Curls', image: '💪', media: '/exercises/dumbbell-bicep-curls.gif', detail: '3 sets × 15 reps', calories: 20 },
            { name: 'Dumbbell Russian Twists', image: '🌀', media: '/exercises/dumbbell-russian-twists.gif', detail: '3 sets × 20 reps', calories: 30 },
        ],
    },

    // ─── Gym plans (Professionals with gym access) ───
    {
        id: 'upper-body',
        title: 'Steps + Upper Body Plan',
        subtitle: 'Chest, back, shoulders and arms.',
        requiresGym: true,
        steps: { count: 4000, calories: 160 },
        exercises: [
            { name: 'Barbell Bench Press', image: '🏋️', media: '/exercises/barbell-bench-press.gif', detail: '4 sets × 10 reps', calories: 40 },
            { name: 'Lat Pulldown', image: '🧗', media: '/exercises/lat-pulldown.gif', detail: '4 sets × 10 reps', calories: 35 },
            { name: 'Seated Cable Row', image: '🚣', media: '/exercises/seated-cable-row.gif', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Dumbbell Shoulder Press', image: '💪', media: '/exercises/dumbbell-shoulder-press.gif', detail: '3 sets × 10 reps', calories: 30 },
            { name: 'Cable Chest Fly', image: '🦅', media: '/exercises/cable-chest-fly.gif', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Tricep Rope Pushdown', image: '🪢', media: '/exercises/tricep-rope-pushdown.gif', detail: '3 sets × 12 reps', calories: 20 },
            { name: 'EZ-Bar Curls', image: '💪', media: '/exercises/ez-bar-curls.gif', detail: '3 sets × 12 reps', calories: 20 },
            { name: 'Face Pulls', image: '🎯', media: '/exercises/face-pulls.gif', detail: '3 sets × 15 reps', calories: 20 },
        ],
    },
    {
        id: 'lower-body',
        title: 'Steps + Lower Body Plan',
        subtitle: 'Quads, hamstrings, glutes and calves.',
        requiresGym: true,
        steps: { count: 4000, calories: 160 },
        exercises: [
            { name: 'Barbell Back Squats', image: '🏋️', media: '/exercises/barbell-back-squats.gif', detail: '4 sets × 10 reps', calories: 50 },
            { name: 'Leg Press', image: '🦵', media: '/exercises/leg-press.gif', detail: '4 sets × 12 reps', calories: 45 },
            { name: 'Romanian Deadlifts', image: '🏗️', media: '/exercises/romanian-deadlifts.gif', detail: '3 sets × 10 reps', calories: 40 },
            { name: 'Walking Lunges', image: '🚶', media: '/exercises/walking-lunges.gif', detail: '3 sets × 12 reps per leg', calories: 35 },
            { name: 'Leg Extensions', image: '🦵', media: '/exercises/leg-extensions.gif', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Lying Leg Curls', image: '🦵', media: '/exercises/lying-leg-curls.gif', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Standing Calf Raises', image: '🧍', media: '/exercises/standing-calf-raises.gif', detail: '4 sets × 15 reps', calories: 20 },
        ],
    },
    {
        id: 'abs-core',
        title: 'Steps + Abs / Core Plan',
        subtitle: 'A complete core and midsection session.',
        requiresGym: true,
        steps: { count: 5000, calories: 200 },
        exercises: [
            { name: 'Hanging Knee Raises', image: '🙆', media: '/exercises/hanging-knee-raises.gif', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Cable Crunches', image: '🪢', media: '/exercises/cable-crunches.gif', detail: '3 sets × 15 reps', calories: 30 },
            { name: 'Plank Hold', image: '🛶', media: '/exercises/plank-hold.gif', detail: '3 holds × 40 sec', calories: 30 },
            { name: 'Russian Twists', image: '🌀', media: '/exercises/dumbbell-russian-twists.gif', detail: '3 sets × 20 reps', calories: 30 },
            { name: 'Leg Raises', image: '🦵', media: '/exercises/leg-raises.gif', detail: '3 sets × 15 reps', calories: 30 },
            { name: 'Side Plank', image: '📐', media: '/exercises/side-plank.gif', detail: '3 holds × 30 sec per side', calories: 25 },
            { name: 'Bicycle Crunches', image: '🚴', media: '/exercises/bicycle-crunches.gif', detail: '3 sets × 20 reps', calories: 25 },
        ],
    },
    {
        id: 'cardio',
        title: 'Cardio Options Plan',
        subtitle: 'Machine cardio circuit — do all four, or mix your favourites to reach the target.',
        requiresGym: true,
        exercises: [
            { name: 'Incline Treadmill Walk', image: '🏃', media: '/exercises/incline-treadmill-walk.gif', detail: '20 minutes (moderate incline)', calories: 150 },
            { name: 'Stationary Cycling', image: '🚴', media: '/exercises/stationary-cycling.gif', detail: '15 minutes (steady pace)', calories: 120 },
            { name: 'Rowing Machine', image: '🚣', media: '/exercises/rowing-machine.gif', detail: '10 minutes (steady pace)', calories: 90 },
            { name: 'Stair Climber', image: '🪜', media: '/exercises/stair-climber.gif', detail: '5 minutes', calories: 40 },
        ],
    },
];

export function getPlanTotal(plan: WorkoutPlan): number {
    const exerciseTotal = plan.exercises.reduce((sum, ex) => sum + ex.calories, 0);
    return exerciseTotal + (plan.steps?.calories ?? 0);
}
