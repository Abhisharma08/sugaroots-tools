// ─── Workout Planner data ────────────────────────────────────
// Every plan targets a total burn of ~400 kcal (steps + exercises).
// Calorie figures are estimates for a ~75 kg adult.
// The `image` field is an emoji visual; replace with a /public image
// path (e.g. '/exercises/squat.jpg') to show real photos.

export type Audience = 'home-maker' | 'professional';

export interface PlanExercise {
    name: string;
    image: string;
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
            { name: 'Jumping Jacks', image: '🤾', detail: '3 sets × 30 reps', calories: 30 },
            { name: 'Bodyweight Squats', image: '🏋️', detail: '3 sets × 15 reps', calories: 35 },
            { name: 'Push-ups', image: '💪', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Walking Lunges', image: '🚶', detail: '3 sets × 10 reps per leg', calories: 30 },
            { name: 'Mountain Climbers', image: '⛰️', detail: '3 sets × 20 reps', calories: 30 },
            { name: 'Plank Hold', image: '🛶', detail: '3 holds × 40 sec', calories: 20 },
            { name: 'Burpees', image: '🔥', detail: '2 sets × 10 reps', calories: 30 },
        ],
    },
    {
        id: 'steps-dumbbell',
        title: 'Steps + Home Workout Dumbbell Plan',
        subtitle: 'Strength at home with a pair of dumbbells.',
        requiresGym: false,
        steps: { count: 5000, calories: 200 },
        exercises: [
            { name: 'Goblet Squats', image: '🏋️', detail: '3 sets × 12 reps', calories: 35 },
            { name: 'Dumbbell Shoulder Press', image: '💪', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Bent-over Dumbbell Rows', image: '🚣', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Dumbbell Lunges', image: '🚶', detail: '3 sets × 10 reps per leg', calories: 30 },
            { name: 'Dumbbell Romanian Deadlifts', image: '🏗️', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Dumbbell Bicep Curls', image: '💪', detail: '3 sets × 15 reps', calories: 20 },
            { name: 'Dumbbell Russian Twists', image: '🌀', detail: '3 sets × 20 reps', calories: 30 },
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
            { name: 'Barbell Bench Press', image: '🏋️', detail: '4 sets × 10 reps', calories: 40 },
            { name: 'Lat Pulldown', image: '🧗', detail: '4 sets × 10 reps', calories: 35 },
            { name: 'Seated Cable Row', image: '🚣', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Dumbbell Shoulder Press', image: '💪', detail: '3 sets × 10 reps', calories: 30 },
            { name: 'Cable Chest Fly', image: '🦅', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Tricep Rope Pushdown', image: '🪢', detail: '3 sets × 12 reps', calories: 20 },
            { name: 'EZ-Bar Curls', image: '💪', detail: '3 sets × 12 reps', calories: 20 },
            { name: 'Face Pulls', image: '🎯', detail: '3 sets × 15 reps', calories: 20 },
        ],
    },
    {
        id: 'lower-body',
        title: 'Steps + Lower Body Plan',
        subtitle: 'Quads, hamstrings, glutes and calves.',
        requiresGym: true,
        steps: { count: 4000, calories: 160 },
        exercises: [
            { name: 'Barbell Back Squats', image: '🏋️', detail: '4 sets × 10 reps', calories: 50 },
            { name: 'Leg Press', image: '🦵', detail: '4 sets × 12 reps', calories: 45 },
            { name: 'Romanian Deadlifts', image: '🏗️', detail: '3 sets × 10 reps', calories: 40 },
            { name: 'Walking Lunges', image: '🚶', detail: '3 sets × 12 reps per leg', calories: 35 },
            { name: 'Leg Extensions', image: '🦵', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Lying Leg Curls', image: '🦵', detail: '3 sets × 12 reps', calories: 25 },
            { name: 'Standing Calf Raises', image: '🧍', detail: '4 sets × 15 reps', calories: 20 },
        ],
    },
    {
        id: 'abs-core',
        title: 'Steps + Abs / Core Plan',
        subtitle: 'A complete core and midsection session.',
        requiresGym: true,
        steps: { count: 5000, calories: 200 },
        exercises: [
            { name: 'Hanging Knee Raises', image: '🙆', detail: '3 sets × 12 reps', calories: 30 },
            { name: 'Cable Crunches', image: '🪢', detail: '3 sets × 15 reps', calories: 30 },
            { name: 'Plank Hold', image: '🛶', detail: '3 holds × 40 sec', calories: 30 },
            { name: 'Russian Twists', image: '🌀', detail: '3 sets × 20 reps', calories: 30 },
            { name: 'Leg Raises', image: '🦵', detail: '3 sets × 15 reps', calories: 30 },
            { name: 'Side Plank', image: '📐', detail: '3 holds × 30 sec per side', calories: 25 },
            { name: 'Bicycle Crunches', image: '🚴', detail: '3 sets × 20 reps', calories: 25 },
        ],
    },
    {
        id: 'cardio',
        title: 'Cardio Options Plan',
        subtitle: 'Machine cardio circuit — do all four, or mix your favourites to reach the target.',
        requiresGym: true,
        exercises: [
            { name: 'Incline Treadmill Walk', image: '🏃', detail: '20 minutes (moderate incline)', calories: 150 },
            { name: 'Stationary Cycling', image: '🚴', detail: '15 minutes (steady pace)', calories: 120 },
            { name: 'Rowing Machine', image: '🚣', detail: '10 minutes (steady pace)', calories: 90 },
            { name: 'Stair Climber', image: '🪜', detail: '5 minutes', calories: 40 },
        ],
    },
];

export function getPlanTotal(plan: WorkoutPlan): number {
    const exerciseTotal = plan.exercises.reduce((sum, ex) => sum + ex.calories, 0);
    return exerciseTotal + (plan.steps?.calories ?? 0);
}
