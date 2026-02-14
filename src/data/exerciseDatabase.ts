import type { ExerciseInfo, MuscleGroup } from '../types';

export const EXERCISE_DATABASE: ExerciseInfo[] = [
  // ─────────────────────────────────────────────
  // CHEST
  // ─────────────────────────────────────────────
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    isCompound: true,
    equipment: 'Barbell, Flat Bench',
    defaultWeight: 135,
    category: 'barbell',
  },
  {
    id: 'incline-barbell-press',
    name: 'Incline Barbell Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    isCompound: true,
    equipment: 'Barbell, Incline Bench',
    defaultWeight: 115,
    category: 'barbell',
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    isCompound: true,
    equipment: 'Barbell, Decline Bench',
    defaultWeight: 135,
    category: 'barbell',
  },
  {
    id: 'dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    isCompound: true,
    equipment: 'Dumbbells, Flat Bench',
    defaultWeight: 50,
    category: 'dumbbell',
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    isCompound: true,
    equipment: 'Dumbbells, Incline Bench',
    defaultWeight: 45,
    category: 'dumbbell',
  },
  {
    id: 'dumbbell-fly',
    name: 'Dumbbell Fly',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    isCompound: false,
    equipment: 'Dumbbells, Flat Bench',
    defaultWeight: 30,
    category: 'dumbbell',
  },
  {
    id: 'cable-crossover',
    name: 'Cable Crossover',
    muscleGroup: 'chest',
    secondaryMuscles: ['shoulders'],
    isCompound: false,
    equipment: 'Cable Machine',
    defaultWeight: 25,
    category: 'cable',
  },
  {
    id: 'chest-dip',
    name: 'Chest Dip',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    isCompound: true,
    equipment: 'Dip Station',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders', 'abs'],
    isCompound: true,
    equipment: 'None',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    isCompound: true,
    equipment: 'Chest Press Machine',
    defaultWeight: 100,
    category: 'machine',
  },

  // ─────────────────────────────────────────────
  // BACK
  // ─────────────────────────────────────────────
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'shoulders', 'forearms'],
    isCompound: true,
    equipment: 'Barbell',
    defaultWeight: 135,
    category: 'barbell',
  },
  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    isCompound: true,
    equipment: 'Dumbbell, Flat Bench',
    defaultWeight: 50,
    category: 'dumbbell',
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms', 'shoulders'],
    isCompound: true,
    equipment: 'Pull-Up Bar',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms'],
    isCompound: true,
    equipment: 'Lat Pulldown Machine',
    defaultWeight: 100,
    category: 'cable',
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms', 'traps'],
    isCompound: true,
    equipment: 'Cable Row Machine',
    defaultWeight: 100,
    category: 'cable',
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps', 'forearms', 'traps'],
    isCompound: true,
    equipment: 'T-Bar Row Station',
    defaultWeight: 90,
    category: 'barbell',
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'back',
    secondaryMuscles: ['shoulders', 'traps'],
    isCompound: true,
    equipment: 'Cable Machine, Rope Attachment',
    defaultWeight: 40,
    category: 'cable',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    secondaryMuscles: ['hamstrings', 'glutes', 'forearms', 'traps'],
    isCompound: true,
    equipment: 'Barbell',
    defaultWeight: 185,
    category: 'barbell',
  },
  {
    id: 'rack-pull',
    name: 'Rack Pull',
    muscleGroup: 'back',
    secondaryMuscles: ['hamstrings', 'glutes', 'forearms', 'traps'],
    isCompound: true,
    equipment: 'Barbell, Power Rack',
    defaultWeight: 225,
    category: 'barbell',
  },

  // ─────────────────────────────────────────────
  // SHOULDERS
  // ─────────────────────────────────────────────
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'traps'],
    isCompound: true,
    equipment: 'Barbell',
    defaultWeight: 95,
    category: 'barbell',
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'traps'],
    isCompound: true,
    equipment: 'Dumbbells',
    defaultWeight: 40,
    category: 'dumbbell',
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['traps'],
    isCompound: false,
    equipment: 'Dumbbells',
    defaultWeight: 15,
    category: 'dumbbell',
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['chest'],
    isCompound: false,
    equipment: 'Dumbbells',
    defaultWeight: 15,
    category: 'dumbbell',
  },
  {
    id: 'reverse-fly',
    name: 'Reverse Fly',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['back', 'traps'],
    isCompound: false,
    equipment: 'Dumbbells',
    defaultWeight: 15,
    category: 'dumbbell',
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps', 'traps'],
    isCompound: true,
    equipment: 'Dumbbells',
    defaultWeight: 35,
    category: 'dumbbell',
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['traps', 'biceps'],
    isCompound: true,
    equipment: 'Barbell',
    defaultWeight: 65,
    category: 'barbell',
  },
  {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['traps'],
    isCompound: false,
    equipment: 'Cable Machine',
    defaultWeight: 15,
    category: 'cable',
  },

  // ─────────────────────────────────────────────
  // BICEPS
  // ─────────────────────────────────────────────
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Barbell',
    defaultWeight: 65,
    category: 'barbell',
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Dumbbells',
    defaultWeight: 25,
    category: 'dumbbell',
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Dumbbells',
    defaultWeight: 25,
    category: 'dumbbell',
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'EZ Bar, Preacher Bench',
    defaultWeight: 50,
    category: 'barbell',
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Dumbbell',
    defaultWeight: 20,
    category: 'dumbbell',
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Cable Machine',
    defaultWeight: 40,
    category: 'cable',
  },
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Dumbbells, Incline Bench',
    defaultWeight: 20,
    category: 'dumbbell',
  },

  // ─────────────────────────────────────────────
  // TRICEPS
  // ─────────────────────────────────────────────
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Cable Machine, V-Bar or Rope',
    defaultWeight: 50,
    category: 'cable',
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Dumbbell',
    defaultWeight: 35,
    category: 'dumbbell',
  },
  {
    id: 'skull-crusher',
    name: 'Skull Crusher',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest'],
    isCompound: false,
    equipment: 'EZ Bar, Flat Bench',
    defaultWeight: 55,
    category: 'barbell',
  },
  {
    id: 'close-grip-bench-press',
    name: 'Close-Grip Bench Press',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    isCompound: true,
    equipment: 'Barbell, Flat Bench',
    defaultWeight: 115,
    category: 'barbell',
  },
  {
    id: 'dips',
    name: 'Dips',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    isCompound: true,
    equipment: 'Dip Station',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'cable-kickback',
    name: 'Cable Kickback',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Cable Machine',
    defaultWeight: 20,
    category: 'cable',
  },

  // ─────────────────────────────────────────────
  // QUADS
  // ─────────────────────────────────────────────
  {
    id: 'barbell-squat',
    name: 'Barbell Squat',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings', 'abs'],
    isCompound: true,
    equipment: 'Barbell, Squat Rack',
    defaultWeight: 185,
    category: 'barbell',
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'abs'],
    isCompound: true,
    equipment: 'Barbell, Squat Rack',
    defaultWeight: 135,
    category: 'barbell',
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    isCompound: true,
    equipment: 'Leg Press Machine',
    defaultWeight: 270,
    category: 'machine',
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    muscleGroup: 'quads',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Leg Extension Machine',
    defaultWeight: 80,
    category: 'machine',
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    isCompound: true,
    equipment: 'Dumbbells, Bench',
    defaultWeight: 30,
    category: 'dumbbell',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    isCompound: true,
    equipment: 'Dumbbells',
    defaultWeight: 30,
    category: 'dumbbell',
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'abs'],
    isCompound: true,
    equipment: 'Kettlebell or Dumbbell',
    defaultWeight: 35,
    category: 'kettlebell',
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    muscleGroup: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    isCompound: true,
    equipment: 'Hack Squat Machine',
    defaultWeight: 180,
    category: 'machine',
  },

  // ─────────────────────────────────────────────
  // HAMSTRINGS
  // ─────────────────────────────────────────────
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['calves'],
    isCompound: false,
    equipment: 'Leg Curl Machine',
    defaultWeight: 70,
    category: 'machine',
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    isCompound: true,
    equipment: 'Barbell',
    defaultWeight: 135,
    category: 'barbell',
  },

  // ─────────────────────────────────────────────
  // GLUTES
  // ─────────────────────────────────────────────
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'glutes',
    secondaryMuscles: ['hamstrings', 'quads'],
    isCompound: true,
    equipment: 'Barbell, Bench',
    defaultWeight: 135,
    category: 'barbell',
  },

  // ─────────────────────────────────────────────
  // CALVES
  // ─────────────────────────────────────────────
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Calf Raise Machine or Smith Machine',
    defaultWeight: 135,
    category: 'machine',
  },
  {
    id: 'seated-calf-raise',
    name: 'Seated Calf Raise',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Seated Calf Raise Machine',
    defaultWeight: 90,
    category: 'machine',
  },

  // ─────────────────────────────────────────────
  // ABS
  // ─────────────────────────────────────────────
  {
    id: 'crunch',
    name: 'Crunch',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'None',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'abs',
    secondaryMuscles: ['shoulders', 'glutes'],
    isCompound: false,
    equipment: 'None',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'abs',
    secondaryMuscles: ['forearms'],
    isCompound: false,
    equipment: 'Pull-Up Bar',
    defaultWeight: 0,
    category: 'bodyweight',
  },
  {
    id: 'cable-crunch',
    name: 'Cable Crunch',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Cable Machine, Rope Attachment',
    defaultWeight: 60,
    category: 'cable',
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    isCompound: false,
    equipment: 'Dumbbell or Medicine Ball',
    defaultWeight: 15,
    category: 'dumbbell',
  },
  {
    id: 'ab-rollout',
    name: 'Ab Rollout',
    muscleGroup: 'abs',
    secondaryMuscles: ['shoulders'],
    isCompound: false,
    equipment: 'Ab Wheel',
    defaultWeight: 0,
    category: 'bodyweight',
  },

  // ─────────────────────────────────────────────
  // TRAPS
  // ─────────────────────────────────────────────
  {
    id: 'barbell-shrug',
    name: 'Barbell Shrug',
    muscleGroup: 'traps',
    secondaryMuscles: ['shoulders', 'forearms'],
    isCompound: false,
    equipment: 'Barbell',
    defaultWeight: 155,
    category: 'barbell',
  },
  {
    id: 'dumbbell-shrug',
    name: 'Dumbbell Shrug',
    muscleGroup: 'traps',
    secondaryMuscles: ['shoulders', 'forearms'],
    isCompound: false,
    equipment: 'Dumbbells',
    defaultWeight: 55,
    category: 'dumbbell',
  },
  {
    id: 'face-pull-traps',
    name: 'Face Pull',
    muscleGroup: 'traps',
    secondaryMuscles: ['shoulders', 'back'],
    isCompound: true,
    equipment: 'Cable Machine, Rope Attachment',
    defaultWeight: 40,
    category: 'cable',
  },
];

/**
 * Returns all exercises that target the given primary muscle group.
 */
export function getExercisesByMuscle(muscle: MuscleGroup): ExerciseInfo[] {
  return EXERCISE_DATABASE.filter(
    (exercise) => exercise.muscleGroup === muscle
  );
}

/**
 * Returns all compound exercises that target the given primary muscle group.
 */
export function getCompoundExercises(muscle: MuscleGroup): ExerciseInfo[] {
  return EXERCISE_DATABASE.filter(
    (exercise) => exercise.muscleGroup === muscle && exercise.isCompound
  );
}

/**
 * Returns all isolation exercises that target the given primary muscle group.
 */
export function getIsolationExercises(muscle: MuscleGroup): ExerciseInfo[] {
  return EXERCISE_DATABASE.filter(
    (exercise) => exercise.muscleGroup === muscle && !exercise.isCompound
  );
}

/**
 * Finds and returns a single exercise by its unique ID.
 * Returns undefined if no exercise with the given ID exists.
 */
export function getExerciseById(id: string): ExerciseInfo | undefined {
  return EXERCISE_DATABASE.find((exercise) => exercise.id === id);
}
