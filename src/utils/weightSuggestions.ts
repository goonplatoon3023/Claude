import type { ExerciseInfo, MuscleGroup, ExperienceLevel, CurrentLifts } from '../types';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { estimate1RM } from './calculations';

// ── Body-weight strength standards for anchor lifts ────────────────────────────
// These are the "reference" compound exercises per muscle group.
// Ratios express a reasonable working weight as a fraction of body weight.

interface AnchorStandard {
  exerciseId: string;
  male:   { beginner: number; intermediate: number; advanced: number };
  female: { beginner: number; intermediate: number; advanced: number };
}

const ANCHOR_STANDARDS: AnchorStandard[] = [
  {
    exerciseId: 'barbell-bench-press',
    male:   { beginner: 0.50, intermediate: 0.75, advanced: 1.10 },
    female: { beginner: 0.30, intermediate: 0.50, advanced: 0.75 },
  },
  {
    exerciseId: 'barbell-squat',
    male:   { beginner: 0.65, intermediate: 1.00, advanced: 1.50 },
    female: { beginner: 0.40, intermediate: 0.70, advanced: 1.10 },
  },
  {
    exerciseId: 'deadlift',
    male:   { beginner: 0.75, intermediate: 1.25, advanced: 1.75 },
    female: { beginner: 0.50, intermediate: 0.90, advanced: 1.30 },
  },
  {
    exerciseId: 'overhead-press',
    male:   { beginner: 0.35, intermediate: 0.55, advanced: 0.75 },
    female: { beginner: 0.20, intermediate: 0.35, advanced: 0.55 },
  },
  {
    exerciseId: 'barbell-row',
    male:   { beginner: 0.45, intermediate: 0.70, advanced: 1.00 },
    female: { beginner: 0.25, intermediate: 0.45, advanced: 0.70 },
  },
  {
    exerciseId: 'barbell-curl',
    male:   { beginner: 0.20, intermediate: 0.35, advanced: 0.50 },
    female: { beginner: 0.12, intermediate: 0.22, advanced: 0.35 },
  },
  {
    exerciseId: 'tricep-pushdown',
    male:   { beginner: 0.20, intermediate: 0.30, advanced: 0.45 },
    female: { beginner: 0.12, intermediate: 0.20, advanced: 0.30 },
  },
  {
    exerciseId: 'hip-thrust',
    male:   { beginner: 0.50, intermediate: 0.85, advanced: 1.25 },
    female: { beginner: 0.40, intermediate: 0.75, advanced: 1.15 },
  },
  {
    exerciseId: 'romanian-deadlift',
    male:   { beginner: 0.50, intermediate: 0.80, advanced: 1.15 },
    female: { beginner: 0.30, intermediate: 0.55, advanced: 0.85 },
  },
  {
    exerciseId: 'calf-raise',
    male:   { beginner: 0.50, intermediate: 0.75, advanced: 1.10 },
    female: { beginner: 0.35, intermediate: 0.55, advanced: 0.80 },
  },
  {
    exerciseId: 'barbell-shrug',
    male:   { beginner: 0.50, intermediate: 0.80, advanced: 1.20 },
    female: { beginner: 0.30, intermediate: 0.50, advanced: 0.75 },
  },
];

export interface WeightSuggestion {
  suggestedWeight: number;  // lbs, rounded to nearest 5
  suggestedReps: number;
  suggestedSets: number;
  confidence: 'high' | 'medium' | 'low';
  reason: string;           // e.g. "Based on your Barbell Bench Press (225 lbs)"
}

/**
 * Suggests a weight for a given exercise based on the user's existing lifts,
 * body weight, and experience level.
 *
 * Priority:
 * 1. Direct lift logged → use that (highest confidence)
 * 2. Similar exercise in same muscle group logged → ratio-based estimate
 * 3. Related exercise (shares secondary muscles) → ratio-based estimate
 * 4. Body weight standards → fallback estimate (lowest confidence)
 */
export function suggestWeight(
  exerciseId: string,
  currentLifts: CurrentLifts,
  bodyWeightLbs: number,
  experienceLevel: ExperienceLevel,
  gender: 'male' | 'female' | 'other',
): WeightSuggestion | null {
  const targetExercise = EXERCISE_DATABASE.find(e => e.id === exerciseId);
  if (!targetExercise) return null;

  // Bodyweight exercises — no weight suggestion needed
  if (targetExercise.defaultWeight === 0) {
    return {
      suggestedWeight: 0,
      suggestedReps: 10,
      suggestedSets: 3,
      confidence: 'medium',
      reason: 'Bodyweight exercise — add weight with a vest or belt if needed',
    };
  }

  // 1. Direct lift already logged
  const directLift = currentLifts[exerciseId];
  if (directLift && directLift.weight > 0) {
    return {
      suggestedWeight: directLift.weight,
      suggestedReps: directLift.reps,
      suggestedSets: directLift.sets,
      confidence: 'high',
      reason: 'Based on your logged lift',
    };
  }

  // 2. Same muscle group — ratio from another logged exercise
  const sameMuscleResult = estimateFromSameMuscleGroup(targetExercise, currentLifts);
  if (sameMuscleResult) return sameMuscleResult;

  // 3. Related exercise (shares secondary muscles)
  const relatedResult = estimateFromRelatedExercise(targetExercise, currentLifts);
  if (relatedResult) return relatedResult;

  // 4. Body weight standards
  return estimateFromBodyWeight(targetExercise, bodyWeightLbs, experienceLevel, gender);
}

/**
 * Estimate from a logged lift targeting the same primary muscle group.
 * Uses the ratio of defaultWeights as a scaling factor.
 */
function estimateFromSameMuscleGroup(
  targetExercise: ExerciseInfo,
  currentLifts: CurrentLifts,
): WeightSuggestion | null {
  // Find all logged lifts for exercises in the same muscle group
  const sameMuscleExercises = EXERCISE_DATABASE.filter(
    e => e.muscleGroup === targetExercise.muscleGroup && e.id !== targetExercise.id
  );

  let bestMatch: { exercise: ExerciseInfo; lift: CurrentLifts[string]; score: number } | null = null;

  for (const ex of sameMuscleExercises) {
    const lift = currentLifts[ex.id];
    if (!lift || lift.weight <= 0) continue;

    // Score: prefer compound-to-compound or isolation-to-isolation matches,
    // and exercises with non-zero default weights for better ratios
    let score = 1;
    if (ex.isCompound === targetExercise.isCompound) score += 2;
    if (ex.category === targetExercise.category) score += 1;
    if (ex.defaultWeight > 0) score += 1;

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { exercise: ex, lift, score };
    }
  }

  if (!bestMatch || bestMatch.exercise.defaultWeight === 0) return null;

  // Use ratio of default weights to scale
  const ratio = targetExercise.defaultWeight / bestMatch.exercise.defaultWeight;
  const estimated1RM = estimate1RM(bestMatch.lift.weight, bestMatch.lift.reps);
  const suggestedWeight = roundTo5(estimated1RM * ratio * 0.75); // ~75% of estimated 1RM for working weight

  return {
    suggestedWeight: Math.max(5, suggestedWeight),
    suggestedReps: bestMatch.lift.reps,
    suggestedSets: bestMatch.lift.sets,
    confidence: 'medium',
    reason: `Based on your ${bestMatch.exercise.name} (${bestMatch.lift.weight} lbs)`,
  };
}

/**
 * Estimate from a logged lift that shares secondary muscles with the target.
 */
function estimateFromRelatedExercise(
  targetExercise: ExerciseInfo,
  currentLifts: CurrentLifts,
): WeightSuggestion | null {
  const targetSecondaries = new Set(targetExercise.secondaryMuscles);

  // Also check exercises where the target's PRIMARY muscle is their SECONDARY muscle
  const relatedExercises = EXERCISE_DATABASE.filter(e => {
    if (e.id === targetExercise.id) return false;
    if (e.muscleGroup === targetExercise.muscleGroup) return false; // already handled
    // Does this exercise's secondary muscles overlap with target's muscle group?
    const sharesMuscle =
      e.secondaryMuscles.includes(targetExercise.muscleGroup) ||
      targetSecondaries.has(e.muscleGroup) ||
      e.secondaryMuscles.some(m => targetSecondaries.has(m));
    return sharesMuscle;
  });

  let bestMatch: { exercise: ExerciseInfo; lift: CurrentLifts[string] } | null = null;

  for (const ex of relatedExercises) {
    const lift = currentLifts[ex.id];
    if (!lift || lift.weight <= 0) continue;
    if (ex.defaultWeight === 0) continue;
    if (!bestMatch) {
      bestMatch = { exercise: ex, lift };
    }
  }

  if (!bestMatch || bestMatch.exercise.defaultWeight === 0) return null;

  const ratio = targetExercise.defaultWeight / bestMatch.exercise.defaultWeight;
  const estimated1RM = estimate1RM(bestMatch.lift.weight, bestMatch.lift.reps);
  const suggestedWeight = roundTo5(estimated1RM * ratio * 0.70); // conservative 70%

  return {
    suggestedWeight: Math.max(5, suggestedWeight),
    suggestedReps: 10,
    suggestedSets: 3,
    confidence: 'low',
    reason: `Estimated from your ${bestMatch.exercise.name} (${bestMatch.lift.weight} lbs)`,
  };
}

/**
 * Fallback: estimate from body weight using known strength standards.
 */
function estimateFromBodyWeight(
  targetExercise: ExerciseInfo,
  bodyWeightLbs: number,
  experienceLevel: ExperienceLevel,
  gender: 'male' | 'female' | 'other',
): WeightSuggestion | null {
  if (bodyWeightLbs <= 0) return null;

  const genderKey = gender === 'female' ? 'female' : 'male';

  // Try to find a direct anchor standard for this exercise
  const directAnchor = ANCHOR_STANDARDS.find(a => a.exerciseId === targetExercise.id);
  if (directAnchor) {
    const ratio = directAnchor[genderKey][experienceLevel];
    const suggestedWeight = roundTo5(bodyWeightLbs * ratio);
    return {
      suggestedWeight: Math.max(5, suggestedWeight),
      suggestedReps: 8,
      suggestedSets: 3,
      confidence: 'low',
      reason: `Estimated for ${experienceLevel} level at ${bodyWeightLbs} lbs body weight`,
    };
  }

  // Find the anchor for this muscle group and scale from it
  const muscleGroupAnchors = ANCHOR_STANDARDS.filter(a => {
    const anchorEx = EXERCISE_DATABASE.find(e => e.id === a.exerciseId);
    return anchorEx && anchorEx.muscleGroup === targetExercise.muscleGroup;
  });

  if (muscleGroupAnchors.length > 0) {
    const anchor = muscleGroupAnchors[0];
    const anchorExercise = EXERCISE_DATABASE.find(e => e.id === anchor.exerciseId);
    if (anchorExercise && anchorExercise.defaultWeight > 0) {
      const anchorWeight = bodyWeightLbs * anchor[genderKey][experienceLevel];
      const ratio = targetExercise.defaultWeight / anchorExercise.defaultWeight;
      const suggestedWeight = roundTo5(anchorWeight * ratio);
      return {
        suggestedWeight: Math.max(5, suggestedWeight),
        suggestedReps: 8,
        suggestedSets: 3,
        confidence: 'low',
        reason: `Estimated for ${experienceLevel} level at ${bodyWeightLbs} lbs body weight`,
      };
    }
  }

  return null;
}

function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}
