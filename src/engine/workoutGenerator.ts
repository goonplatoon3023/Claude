import type {
  UserProfile,
  FitnessGoals,
  CurrentLifts,
  WorkoutPlan,
  WorkoutDay,
  PlannedExercise,
  CardioSession,
  PrimaryGoal,
  MuscleGroup,
  ExperienceLevel,
  CardioType,
} from '../types';

import {
  getExercisesByMuscle,
  getCompoundExercises,
  getIsolationExercises,
  EXERCISE_DATABASE,
} from '../data/exerciseDatabase';

import { estimate1RM, calculateWorkingWeight } from '../utils/calculations';

// ── Split Definitions ──────────────────────────────────────────────────────────

type SplitType = 'full_body' | 'upper_lower' | 'ppl_upper_lower' | 'ppl_x2';

interface DaySplit {
  focus: string;
  muscleGroups: MuscleGroup[];
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const FULL_BODY_SPLIT: DaySplit = {
  focus: 'Full Body',
  muscleGroups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'biceps', 'triceps', 'abs'],
};

const UPPER_SPLIT: DaySplit = {
  focus: 'Upper Body',
  muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'traps', 'forearms'],
};

const LOWER_SPLIT: DaySplit = {
  focus: 'Lower Body',
  muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
};

const PUSH_SPLIT: DaySplit = {
  focus: 'Push (Chest, Shoulders & Triceps)',
  muscleGroups: ['chest', 'shoulders', 'triceps'],
};

const PULL_SPLIT: DaySplit = {
  focus: 'Pull (Back & Biceps)',
  muscleGroups: ['back', 'biceps', 'traps', 'forearms'],
};

const LEGS_SPLIT: DaySplit = {
  focus: 'Legs & Abs',
  muscleGroups: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
};

// ── Rep/Set/Rest Schemes ────────────────────────────────────────────────────────

interface TrainingScheme {
  setsMin: number;
  setsMax: number;
  repsMin: number;
  repsMax: number;
  intensityMin: number; // percentage of 1RM
  intensityMax: number;
  restMin: number;      // seconds
  restMax: number;
}

const TRAINING_SCHEMES: Record<PrimaryGoal, TrainingScheme> = {
  muscle_gain: {
    setsMin: 3, setsMax: 4,
    repsMin: 8, repsMax: 12,
    intensityMin: 0.65, intensityMax: 0.75,
    restMin: 60, restMax: 90,
  },
  fat_loss: {
    setsMin: 3, setsMax: 4,
    repsMin: 12, repsMax: 15,
    intensityMin: 0.55, intensityMax: 0.65,
    restMin: 30, restMax: 45,
  },
  strength: {
    setsMin: 4, setsMax: 5,
    repsMin: 3, repsMax: 6,
    intensityMin: 0.80, intensityMax: 0.90,
    restMin: 180, restMax: 300,
  },
  endurance: {
    setsMin: 2, setsMax: 3,
    repsMin: 15, repsMax: 20,
    intensityMin: 0.40, intensityMax: 0.55,
    restMin: 30, restMax: 30,
  },
  general_fitness: {
    setsMin: 3, setsMax: 3,
    repsMin: 10, repsMax: 12,
    intensityMin: 0.60, intensityMax: 0.70,
    restMin: 60, restMax: 60,
  },
  athletic_performance: {
    setsMin: 3, setsMax: 4,
    repsMin: 5, repsMax: 8,
    intensityMin: 0.70, intensityMax: 0.85,
    restMin: 60, restMax: 120,
  },
};

// ── Cardio Configuration ────────────────────────────────────────────────────────

interface CardioConfig {
  durationMinutes: number;
  intensity: CardioSession['intensity'];
  targetHeartRateZone: CardioSession['targetHeartRateZone'];
  description: string;
}

function getCardioConfig(goal: PrimaryGoal, cardioType: CardioType): CardioConfig {
  switch (goal) {
    case 'fat_loss':
      return {
        durationMinutes: cardioType === 'hiit' ? 25 : 40,
        intensity: cardioType === 'hiit' ? 'interval' : 'moderate',
        targetHeartRateZone: cardioType === 'hiit' ? 'zone4' : 'zone2',
        description: cardioType === 'hiit'
          ? 'Alternate 30s max effort / 60s recovery. Focus on burning maximum calories.'
          : 'Maintain steady-state pace in the fat-burning zone. Keep effort conversational.',
      };
    case 'muscle_gain':
      return {
        durationMinutes: 20,
        intensity: 'low',
        targetHeartRateZone: 'zone2',
        description: 'Light cardio to maintain cardiovascular health without impeding recovery. Keep it easy.',
      };
    case 'strength':
      return {
        durationMinutes: 15,
        intensity: 'low',
        targetHeartRateZone: 'zone1',
        description: 'Minimal cardio for active recovery and general health. Keep intensity very low to preserve strength gains.',
      };
    case 'endurance':
      return {
        durationMinutes: cardioType === 'hiit' ? 30 : 45,
        intensity: cardioType === 'hiit' ? 'interval' : 'high',
        targetHeartRateZone: cardioType === 'hiit' ? 'zone4' : 'zone3',
        description: cardioType === 'hiit'
          ? 'High-intensity intervals to build anaerobic capacity. Push hard on work intervals.'
          : 'Sustained effort in the aerobic zone. Build your cardiovascular base.',
      };
    case 'athletic_performance':
      return {
        durationMinutes: cardioType === 'hiit' ? 25 : 30,
        intensity: cardioType === 'hiit' ? 'interval' : 'high',
        targetHeartRateZone: cardioType === 'hiit' ? 'zone4' : 'zone3',
        description: cardioType === 'hiit'
          ? 'Sport-specific intervals. Focus on explosive bursts with active recovery.'
          : 'Moderate-to-high intensity cardio to build athletic conditioning.',
      };
    case 'general_fitness':
    default:
      return {
        durationMinutes: 30,
        intensity: 'moderate',
        targetHeartRateZone: 'zone3',
        description: 'Moderate effort cardio. You should be able to hold a conversation but feel challenged.',
      };
  }
}

// ── Helper Functions ────────────────────────────────────────────────────────────

function determineSplitType(daysPerWeek: number): SplitType {
  if (daysPerWeek <= 3) return 'full_body';
  if (daysPerWeek === 4) return 'upper_lower';
  if (daysPerWeek === 5) return 'ppl_upper_lower';
  return 'ppl_x2';
}

function getSplitLabel(splitType: SplitType): string {
  switch (splitType) {
    case 'full_body': return 'Full Body';
    case 'upper_lower': return 'Upper/Lower';
    case 'ppl_upper_lower': return 'Push/Pull/Legs + Upper/Lower';
    case 'ppl_x2': return 'Push/Pull/Legs x2';
  }
}

function getTrainingSplits(splitType: SplitType): DaySplit[] {
  switch (splitType) {
    case 'full_body':
      return [FULL_BODY_SPLIT, FULL_BODY_SPLIT, FULL_BODY_SPLIT];
    case 'upper_lower':
      return [UPPER_SPLIT, LOWER_SPLIT, UPPER_SPLIT, LOWER_SPLIT];
    case 'ppl_upper_lower':
      return [PUSH_SPLIT, PULL_SPLIT, LEGS_SPLIT, UPPER_SPLIT, LOWER_SPLIT];
    case 'ppl_x2':
      return [PUSH_SPLIT, PULL_SPLIT, LEGS_SPLIT, PUSH_SPLIT, PULL_SPLIT, LEGS_SPLIT];
  }
}

function getExerciseCountRange(level: ExperienceLevel): { min: number; max: number } {
  switch (level) {
    case 'beginner': return { min: 4, max: 6 };
    case 'intermediate': return { min: 5, max: 7 };
    case 'advanced': return { min: 6, max: 8 };
  }
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Schedules training day indices (0-based, within a 7-day week) to distribute
 * rest appropriately. Beginners never have 3 training days in a row.
 */
function scheduleTrainingDays(
  daysPerWeek: number,
  level: ExperienceLevel,
): number[] {
  // Pre-baked schedules that spread training days evenly across the week
  const schedules: Record<number, number[]> = {
    3: [0, 2, 4],            // Mon, Wed, Fri
    4: [0, 1, 3, 4],         // Mon, Tue, Thu, Fri
    5: [0, 1, 2, 4, 5],      // Mon, Tue, Wed, Fri, Sat
    6: [0, 1, 2, 3, 4, 5],   // Mon-Sat
  };

  // Beginner-safe schedules: never 3 consecutive training days
  const beginnerSchedules: Record<number, number[]> = {
    3: [0, 2, 4],            // Mon, Wed, Fri
    4: [0, 1, 3, 4],         // Mon, Tue, Thu, Fri
    5: [0, 1, 3, 4, 5],      // Mon, Tue, Thu, Fri, Sat
    6: [0, 1, 3, 4, 5, 6],   // Mon, Tue, Thu, Fri, Sat, Sun
  };

  const clamped = Math.max(3, Math.min(6, daysPerWeek));
  if (level === 'beginner') {
    return beginnerSchedules[clamped];
  }
  return schedules[clamped];
}

/**
 * Resolves the working weight for a given exercise. If the user has logged
 * a current lift for that exercise, use estimate1RM + calculateWorkingWeight.
 * Otherwise fall back to the exercise's defaultWeight scaled to intensity.
 */
function resolveWeight(
  exerciseId: string,
  currentLifts: CurrentLifts,
  targetReps: number,
  intensityMin: number,
  intensityMax: number,
): number {
  const liftEntry = currentLifts[exerciseId];
  if (liftEntry && liftEntry.weight > 0 && liftEntry.reps > 0) {
    const oneRM = estimate1RM(liftEntry.weight, liftEntry.reps);
    return calculateWorkingWeight(oneRM, targetReps);
  }

  // No lift data: look up default weight from database
  const exercise = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  const defaultWeight = exercise?.defaultWeight ?? 45;
  const midIntensity = (intensityMin + intensityMax) / 2;
  return Math.round((defaultWeight * midIntensity) / 5) * 5;
}

/**
 * Finds 1-2 alternative exercises for the given exercise from the same muscle
 * group, preferring exercises of the same compound/isolation type.
 */
function findAlternatives(exerciseId: string, muscleGroup: MuscleGroup, isCompound: boolean): string[] {
  const candidates = getExercisesByMuscle(muscleGroup)
    .filter(e => e.id !== exerciseId)
    .sort((a, b) => {
      // Prefer same type (compound/isolation)
      const aMatch = a.isCompound === isCompound ? 0 : 1;
      const bMatch = b.isCompound === isCompound ? 0 : 1;
      return aMatch - bMatch;
    });

  return candidates.slice(0, 2).map(e => e.name);
}

/**
 * Returns tempo string for muscle_gain goal, undefined otherwise.
 */
function getTempo(goal: PrimaryGoal, isCompound: boolean): string | undefined {
  if (goal !== 'muscle_gain') return undefined;
  // Compound: controlled eccentric. Isolation: slower for time under tension.
  return isCompound ? '3-1-2-0' : '3-1-2-1';
}

/**
 * Returns exercise-specific notes based on context.
 */
function getExerciseNotes(
  _exerciseName: string,
  goal: PrimaryGoal,
  isCompound: boolean,
  level: ExperienceLevel,
): string | undefined {
  const notes: string[] = [];

  if (isCompound && level === 'beginner') {
    notes.push('Focus on proper form before adding weight.');
  }

  if (goal === 'strength' && isCompound) {
    notes.push('Rest fully between sets. Each rep should be performed with maximal intent.');
  }

  if (goal === 'muscle_gain') {
    notes.push('Control the eccentric phase. Squeeze at peak contraction.');
  }

  if (goal === 'fat_loss') {
    notes.push('Keep rest periods short. Maintain elevated heart rate.');
  }

  if (goal === 'endurance') {
    notes.push('Focus on consistent tempo throughout all reps. Avoid resting at lockout.');
  }

  if (goal === 'athletic_performance' && isCompound) {
    notes.push('Explosive concentric, controlled eccentric. Prioritize power output.');
  }

  return notes.length > 0 ? notes.join(' ') : undefined;
}

/**
 * Calculates estimated workout duration in minutes based on exercises, sets,
 * reps, and rest periods.
 */
function estimateDuration(exercises: PlannedExercise[], cardio?: CardioSession): number {
  let totalSeconds = 0;

  // ~5 minutes warmup
  totalSeconds += 300;

  for (const ex of exercises) {
    const reps = parseReps(ex.reps);
    const avgReps = (reps.min + reps.max) / 2;
    // ~3 seconds per rep for time under tension
    const setTime = avgReps * 3;
    // Total time = (set execution + rest) * sets  (last set has no rest)
    totalSeconds += ex.sets * setTime + (ex.sets - 1) * ex.restSeconds;
    // ~30 seconds transition between exercises
    totalSeconds += 30;
  }

  // ~3 minutes cooldown/stretch
  totalSeconds += 180;

  let totalMinutes = Math.round(totalSeconds / 60);

  if (cardio) {
    totalMinutes += cardio.durationMinutes;
  }

  return totalMinutes;
}

function parseReps(reps: string): { min: number; max: number } {
  if (reps.includes('-')) {
    const [min, max] = reps.split('-').map(Number);
    return { min, max };
  }
  const n = Number(reps);
  return { min: n, max: n };
}

function formatReps(min: number, max: number): string {
  if (min === max) return String(min);
  return `${min}-${max}`;
}

/**
 * Builds the daily notes/tips string.
 */
function getDayNotes(
  dayType: WorkoutDay['type'],
  focus: string,
  goal: PrimaryGoal,
  level: ExperienceLevel,
): string | undefined {
  if (dayType === 'rest') {
    return 'Complete rest day. Focus on sleep, nutrition, and hydration. Light stretching is encouraged.';
  }

  if (dayType === 'active_recovery') {
    return 'Active recovery day. Consider light walking, yoga, foam rolling, or mobility work. Keep intensity very low.';
  }

  if (dayType === 'cardio') {
    return 'Cardio-focused day. Warm up for 5 minutes before hitting target intensity. Cool down and stretch afterward.';
  }

  const tips: string[] = [];
  tips.push(`Focus: ${focus}.`);

  if (level === 'beginner') {
    tips.push('Warm up with 5-10 minutes of light cardio and dynamic stretching before lifting.');
    tips.push('Start with lighter weights to nail form, then progress.');
  } else {
    tips.push('Begin with a thorough warm-up including movement-specific prep sets.');
  }

  if (goal === 'strength') {
    tips.push('Pyramid up to working weight with progressive warm-up sets.');
  }

  if (goal === 'muscle_gain') {
    tips.push('Aim for muscular failure on the last 1-2 sets of each exercise.');
  }

  if (goal === 'fat_loss') {
    tips.push('Consider supersetting exercises to keep heart rate elevated and maximize calorie burn.');
  }

  return tips.join(' ');
}

/**
 * Prioritizes muscle groups by moving focus areas to the front while keeping
 * remaining groups in their original order.
 */
function prioritizeMuscleGroups(
  muscleGroups: MuscleGroup[],
  focusAreas: MuscleGroup[],
): MuscleGroup[] {
  const focusSet = new Set(focusAreas);
  const prioritized = muscleGroups.filter(mg => focusSet.has(mg));
  const remaining = muscleGroups.filter(mg => !focusSet.has(mg));
  return [...prioritized, ...remaining];
}

// ── Main Generator ──────────────────────────────────────────────────────────────

export function generateWorkoutPlan(
  profile: UserProfile,
  goals: FitnessGoals,
  currentLifts: CurrentLifts,
): WorkoutPlan {
  const splitType = determineSplitType(goals.workoutDaysPerWeek);
  const splits = getTrainingSplits(splitType);
  const scheme = TRAINING_SCHEMES[goals.primaryGoal];
  const exerciseRange = getExerciseCountRange(goals.experienceLevel);
  const trainingDayIndices = scheduleTrainingDays(goals.workoutDaysPerWeek, goals.experienceLevel);

  // Determine which days get cardio (spread across the week)
  const cardioDayIndices = assignCardioDays(goals, trainingDayIndices);

  // Track which exercises we've used across the week to add variety for full-body splits
  const usedExerciseIds = new Set<string>();

  // Build the 7-day schedule
  const weeklySchedule: WorkoutDay[] = [];
  let splitIndex = 0;

  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const dayNumber = dayIdx + 1;
    const dayName = DAY_NAMES[dayIdx];
    const isTrainingDay = trainingDayIndices.includes(dayIdx);
    const isCardioDay = cardioDayIndices.includes(dayIdx);

    if (isTrainingDay) {
      const split = splits[splitIndex % splits.length];
      splitIndex++;

      const orderedMuscles = prioritizeMuscleGroups(split.muscleGroups, goals.focusAreas);
      const exercises = selectExercises(
        orderedMuscles,
        goals,
        scheme,
        currentLifts,
        exerciseRange,
        usedExerciseIds,
        splitType,
      );

      // Mark used exercises
      for (const ex of exercises) {
        usedExerciseIds.add(ex.exerciseId);
      }

      const cardio = isCardioDay
        ? buildCardioSession(goals)
        : undefined;

      const estimatedDuration = estimateDuration(exercises, cardio);

      weeklySchedule.push({
        dayNumber,
        dayName,
        type: 'training',
        focus: split.focus,
        exercises,
        cardio,
        estimatedDuration,
        notes: getDayNotes('training', split.focus, goals.primaryGoal, goals.experienceLevel),
      });
    } else if (isCardioDay) {
      // Cardio-only day (not a lifting day)
      const cardio = buildCardioSession(goals);

      weeklySchedule.push({
        dayNumber,
        dayName,
        type: 'cardio',
        focus: 'Cardio',
        exercises: [],
        cardio,
        estimatedDuration: cardio.durationMinutes + 10, // warmup + cooldown
        notes: getDayNotes('cardio', 'Cardio', goals.primaryGoal, goals.experienceLevel),
      });
    } else {
      // Rest or active recovery
      const isActiveRecovery = shouldBeActiveRecovery(dayIdx, trainingDayIndices, goals.experienceLevel);
      weeklySchedule.push({
        dayNumber,
        dayName,
        type: isActiveRecovery ? 'active_recovery' : 'rest',
        exercises: [],
        estimatedDuration: isActiveRecovery ? 20 : 0,
        notes: getDayNotes(
          isActiveRecovery ? 'active_recovery' : 'rest',
          '',
          goals.primaryGoal,
          goals.experienceLevel,
        ),
      });
    }
  }

  const splitLabel = getSplitLabel(splitType);
  const goalLabels: Record<PrimaryGoal, string> = {
    muscle_gain: 'Hypertrophy',
    fat_loss: 'Fat Loss',
    strength: 'Strength',
    endurance: 'Endurance',
    general_fitness: 'General Fitness',
    athletic_performance: 'Athletic Performance',
  };
  const goalLabel = goalLabels[goals.primaryGoal];

  return {
    id: crypto.randomUUID(),
    name: `${goalLabel} - ${splitLabel} (${goals.workoutDaysPerWeek} days/week)`,
    description: buildPlanDescription(goals, splitType, profile),
    weeklySchedule,
    generatedAt: new Date().toISOString(),
    basedOnGoal: goals.primaryGoal,
  };
}

// ── Exercise Selection ──────────────────────────────────────────────────────────

function selectExercises(
  muscleGroups: MuscleGroup[],
  goals: FitnessGoals,
  scheme: TrainingScheme,
  currentLifts: CurrentLifts,
  exerciseRange: { min: number; max: number },
  usedExerciseIds: Set<string>,
  splitType: SplitType,
): PlannedExercise[] {
  const targetCount = randomInRange(exerciseRange.min, exerciseRange.max);
  const exercises: PlannedExercise[] = [];
  const selectedIds = new Set<string>();

  // Determine how many exercises per muscle group
  // For full body, distribute evenly; for focused splits, allow more per group
  const isFullBody = splitType === 'full_body';
  const exercisesPerGroup = isFullBody
    ? 1
    : Math.max(1, Math.floor(targetCount / muscleGroups.length));

  // Phase 1: Add compound exercises first (one per primary muscle group)
  for (const muscle of muscleGroups) {
    if (exercises.length >= targetCount) break;

    const compounds = getCompoundExercises(muscle)
      .filter(e => !selectedIds.has(e.id));

    // Prefer exercises we haven't used this week (for full body variety)
    const sorted = compounds.sort((a, b) => {
      const aUsed = usedExerciseIds.has(a.id) ? 1 : 0;
      const bUsed = usedExerciseIds.has(b.id) ? 1 : 0;
      return aUsed - bUsed;
    });

    const pick = sorted[0];
    if (pick) {
      exercises.push(buildPlannedExercise(pick, goals, scheme, currentLifts));
      selectedIds.add(pick.id);
    }
  }

  // Phase 2: Add isolation exercises to fill up, prioritizing focus areas
  const focusSet = new Set(goals.focusAreas);
  const musclesNeedingMore = muscleGroups.filter(mg => {
    if (isFullBody) return focusSet.has(mg); // Only add isolation for focus areas in full body
    const count = exercises.filter(e => e.muscleGroup === mg).length;
    return count < exercisesPerGroup;
  });

  for (const muscle of musclesNeedingMore) {
    if (exercises.length >= targetCount) break;

    const isolations = getIsolationExercises(muscle)
      .filter(e => !selectedIds.has(e.id))
      .sort((a, b) => {
        const aUsed = usedExerciseIds.has(a.id) ? 1 : 0;
        const bUsed = usedExerciseIds.has(b.id) ? 1 : 0;
        return aUsed - bUsed;
      });

    const pick = isolations[0];
    if (pick) {
      exercises.push(buildPlannedExercise(pick, goals, scheme, currentLifts));
      selectedIds.add(pick.id);
    }
  }

  // Phase 3: If we still need more exercises, fill from any remaining in the muscle groups
  if (exercises.length < exerciseRange.min) {
    for (const muscle of muscleGroups) {
      if (exercises.length >= exerciseRange.min) break;

      const remaining = getExercisesByMuscle(muscle)
        .filter(e => !selectedIds.has(e.id))
        .sort((a, b) => {
          const aUsed = usedExerciseIds.has(a.id) ? 1 : 0;
          const bUsed = usedExerciseIds.has(b.id) ? 1 : 0;
          return aUsed - bUsed;
        });

      const pick = remaining[0];
      if (pick) {
        exercises.push(buildPlannedExercise(pick, goals, scheme, currentLifts));
        selectedIds.add(pick.id);
      }
    }
  }

  // Sort: compounds first, then isolation
  exercises.sort((a, b) => {
    if (a.isCompound && !b.isCompound) return -1;
    if (!a.isCompound && b.isCompound) return 1;
    return 0;
  });

  return exercises;
}

function buildPlannedExercise(
  exerciseInfo: { id: string; name: string; muscleGroup: MuscleGroup; isCompound: boolean; defaultWeight: number },
  goals: FitnessGoals,
  scheme: TrainingScheme,
  currentLifts: CurrentLifts,
): PlannedExercise {
  const sets = randomInRange(scheme.setsMin, scheme.setsMax);
  const repsMin = scheme.repsMin;
  const repsMax = scheme.repsMax;
  const midReps = Math.round((repsMin + repsMax) / 2);
  const rest = randomInRange(scheme.restMin, scheme.restMax);

  const weight = resolveWeight(
    exerciseInfo.id,
    currentLifts,
    midReps,
    scheme.intensityMin,
    scheme.intensityMax,
  );

  const alternatives = findAlternatives(
    exerciseInfo.id,
    exerciseInfo.muscleGroup,
    exerciseInfo.isCompound,
  );

  return {
    exerciseId: exerciseInfo.id,
    exerciseName: exerciseInfo.name,
    muscleGroup: exerciseInfo.muscleGroup,
    sets,
    reps: formatReps(repsMin, repsMax),
    weight,
    restSeconds: rest,
    tempo: getTempo(goals.primaryGoal, exerciseInfo.isCompound),
    notes: getExerciseNotes(
      exerciseInfo.name,
      goals.primaryGoal,
      exerciseInfo.isCompound,
      goals.experienceLevel,
    ),
    isCompound: exerciseInfo.isCompound,
    alternatives,
  };
}

// ── Cardio Assignment ───────────────────────────────────────────────────────────

/**
 * Assigns cardio to specific days of the week. Cardio is placed on training days
 * when possible, but if cardioDaysPerWeek exceeds training days it spills to
 * rest days as standalone cardio sessions.
 */
function assignCardioDays(
  goals: FitnessGoals,
  trainingDayIndices: number[],
): number[] {
  if (!goals.includeCardio || goals.cardioDaysPerWeek <= 0 || goals.cardioTypes.length === 0) {
    return [];
  }

  const cardioDays: number[] = [];
  const targetCardioDays = Math.min(goals.cardioDaysPerWeek, 7);

  // First, assign cardio to training days (spread evenly)
  const stride = Math.max(1, Math.floor(trainingDayIndices.length / targetCardioDays));
  for (let i = 0; i < trainingDayIndices.length && cardioDays.length < targetCardioDays; i += stride) {
    cardioDays.push(trainingDayIndices[i]);
  }

  // If more cardio days needed, add to non-training days
  if (cardioDays.length < targetCardioDays) {
    const nonTrainingDays = [0, 1, 2, 3, 4, 5, 6].filter(
      d => !trainingDayIndices.includes(d) && !cardioDays.includes(d),
    );
    for (const d of nonTrainingDays) {
      if (cardioDays.length >= targetCardioDays) break;
      cardioDays.push(d);
    }
  }

  return cardioDays.sort((a, b) => a - b);
}

function buildCardioSession(goals: FitnessGoals): CardioSession {
  // Pick a cardio type (rotate through available types)
  const cardioType = goals.cardioTypes[Math.floor(Math.random() * goals.cardioTypes.length)];
  const config = getCardioConfig(goals.primaryGoal, cardioType);

  const cardioLabels: Record<CardioType, string> = {
    running: 'Running',
    cycling: 'Cycling',
    swimming: 'Swimming',
    rowing: 'Rowing',
    elliptical: 'Elliptical',
    jump_rope: 'Jump Rope',
    walking: 'Walking',
    hiit: 'HIIT',
  };

  return {
    type: cardioType,
    durationMinutes: config.durationMinutes,
    targetHeartRateZone: config.targetHeartRateZone,
    intensity: config.intensity,
    description: `${cardioLabels[cardioType]} - ${config.description}`,
  };
}

// ── Rest Day Logic ──────────────────────────────────────────────────────────────

/**
 * Determines if a rest day should be active recovery instead of full rest.
 * Active recovery is used between heavy training blocks and for intermediate+
 * lifters.
 */
function shouldBeActiveRecovery(
  dayIdx: number,
  trainingDayIndices: number[],
  level: ExperienceLevel,
): boolean {
  // Beginners get full rest days
  if (level === 'beginner') return false;

  // Check if this rest day is sandwiched between two training days
  const prevDay = dayIdx === 0 ? 6 : dayIdx - 1;
  const nextDay = dayIdx === 6 ? 0 : dayIdx + 1;
  const prevIsTraining = trainingDayIndices.includes(prevDay);
  const nextIsTraining = trainingDayIndices.includes(nextDay);

  return prevIsTraining && nextIsTraining;
}

// ── Plan Description ────────────────────────────────────────────────────────────

function buildPlanDescription(
  goals: FitnessGoals,
  splitType: SplitType,
  _profile: UserProfile,
): string {
  const splitLabel = getSplitLabel(splitType);

  const goalDescriptions: Record<PrimaryGoal, string> = {
    muscle_gain: 'hypertrophy-focused training with moderate-to-heavy weights and controlled tempos',
    fat_loss: 'high-volume training with shorter rest periods and integrated cardio for maximum calorie burn',
    strength: 'heavy compound lifts with low reps and extended rest for maximal strength development',
    endurance: 'high-rep training with shorter rest periods to build muscular and cardiovascular endurance',
    general_fitness: 'balanced training combining moderate weights, varied rep ranges, and cardio',
    athletic_performance: 'power-focused training with explosive movements and sport-specific conditioning',
  };

  const levelNote: Record<ExperienceLevel, string> = {
    beginner: 'Exercise selection emphasizes fundamental movements with manageable volume. Focus on mastering form.',
    intermediate: 'Includes a mix of compound and isolation movements with moderate volume to drive continued progress.',
    advanced: 'Higher volume and exercise variety to push past plateaus and maximize training stimulus.',
  };

  const parts: string[] = [
    `A ${goals.workoutDaysPerWeek}-day ${splitLabel} program featuring ${goalDescriptions[goals.primaryGoal]}.`,
    levelNote[goals.experienceLevel],
  ];

  if (goals.focusAreas.length > 0) {
    const focusLabels = goals.focusAreas.map(mg => mg.charAt(0).toUpperCase() + mg.slice(1));
    parts.push(`Priority muscle groups: ${focusLabels.join(', ')}.`);
  }

  if (goals.includeCardio && goals.cardioDaysPerWeek > 0) {
    parts.push(`Includes ${goals.cardioDaysPerWeek} cardio session(s) per week.`);
  }

  return parts.join(' ');
}
