// ── User Profile & Measurements ──
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightFeet: number;
  heightInches: number;
  weight: number; // lbs
  bodyFatPercentage?: number;
  activityLevel: ActivityLevel;
  measurements: BodyMeasurements;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurements {
  chest?: number;    // inches
  waist?: number;
  hips?: number;
  neck?: number;
  shoulders?: number;
  leftBicep?: number;
  rightBicep?: number;
  leftForearm?: number;
  rightForearm?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job, little exercise)',
  light: 'Lightly Active (light exercise 1-3 days/week)',
  moderate: 'Moderately Active (moderate exercise 3-5 days/week)',
  active: 'Active (hard exercise 6-7 days/week)',
  very_active: 'Very Active (intense exercise + physical job)',
};

// ── Fitness Goals ──
export type PrimaryGoal = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness' | 'athletic_performance';

export const GOAL_LABELS: Record<PrimaryGoal, string> = {
  muscle_gain: 'Build Muscle',
  fat_loss: 'Lose Fat',
  strength: 'Increase Strength',
  endurance: 'Improve Endurance',
  general_fitness: 'General Fitness',
  athletic_performance: 'Athletic Performance',
};

export const GOAL_DESCRIPTIONS: Record<PrimaryGoal, string> = {
  muscle_gain: 'Focus on hypertrophy with moderate-heavy weights and higher volume',
  fat_loss: 'Caloric deficit with high-intensity training and increased cardio',
  strength: 'Low rep, heavy weight powerlifting-style training',
  endurance: 'Higher reps, circuit-style training with significant cardio',
  general_fitness: 'Balanced approach combining strength, cardio, and flexibility',
  athletic_performance: 'Sport-specific training with explosive movements',
};

export interface FitnessGoals {
  primaryGoal: PrimaryGoal;
  targetWeight?: number;
  workoutDaysPerWeek: number; // 3-6
  sessionDuration: number;    // minutes
  includeCardio: boolean;
  cardioDaysPerWeek: number;
  cardioTypes: CardioType[];
  focusAreas: MuscleGroup[];
  experienceLevel: ExperienceLevel;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner (0-1 years)',
  intermediate: 'Intermediate (1-3 years)',
  advanced: 'Advanced (3+ years)',
};

export type CardioType = 'running' | 'cycling' | 'swimming' | 'rowing' | 'elliptical' | 'jump_rope' | 'walking' | 'hiit';

export const CARDIO_LABELS: Record<CardioType, string> = {
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  rowing: 'Rowing',
  elliptical: 'Elliptical',
  jump_rope: 'Jump Rope',
  walking: 'Walking',
  hiit: 'HIIT',
};

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'traps';

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quads: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  abs: 'Abs',
  traps: 'Traps',
};

// ── Current Lifts ──
export interface CurrentLifts {
  [exerciseId: string]: LiftEntry;
}

export interface LiftEntry {
  exerciseId: string;
  exerciseName: string;
  weight: number;     // lbs
  reps: number;
  sets: number;
  lastUpdated: string;
}

// ── Exercise Database ──
export interface ExerciseInfo {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  isCompound: boolean;
  equipment: string;
  defaultWeight: number;
  category: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell';
}

// ── Workout Plan ──
export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  weeklySchedule: WorkoutDay[];
  generatedAt: string;
  basedOnGoal: PrimaryGoal;
}

export interface WorkoutDay {
  dayNumber: number;  // 1-7 (Mon-Sun)
  dayName: string;
  type: 'training' | 'rest' | 'active_recovery' | 'cardio';
  focus?: string;
  exercises: PlannedExercise[];
  cardio?: CardioSession;
  estimatedDuration: number; // minutes
  notes?: string;
}

export interface PlannedExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;        // e.g. "8-12" or "5"
  weight: number;      // lbs
  restSeconds: number;
  tempo?: string;      // e.g. "3-1-2-0"
  notes?: string;
  isCompound: boolean;
  alternatives: string[];
}

export interface CardioSession {
  type: CardioType;
  durationMinutes: number;
  targetHeartRateZone?: HeartRateZone;
  intensity: 'low' | 'moderate' | 'high' | 'interval';
  description: string;
}

// ── Nutrition Plan ──
export interface NutritionPlan {
  id: string;
  dailyCalories: number;
  macros: MacroTargets;
  mealPlan: MealPlan;
  hydrationGoalOz: number;
  supplements: string[];
  generatedAt: string;
  basedOnGoal: PrimaryGoal;
}

export interface MacroTargets {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
}

export interface MealPlan {
  meals: Meal[];
  snacks: Meal[];
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: FoodItem[];
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ── Heart Rate ──
export type HeartRateZone = 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5';

export interface HeartRateEntry {
  id: string;
  date: string;
  restingHR: number;
  maxHR?: number;
  averageHR?: number;
  activityType?: string;
  duration?: number; // minutes
  zone?: HeartRateZone;
  notes?: string;
}

// ── Progress Tracking ──
export interface MeasurementHistory {
  date: string;
  weight: number;
  measurements?: BodyMeasurements;
}

// ── App State ──
export interface AppState {
  profile: UserProfile | null;
  goals: FitnessGoals | null;
  currentLifts: CurrentLifts;
  workoutPlan: WorkoutPlan | null;
  nutritionPlan: NutritionPlan | null;
  heartRateEntries: HeartRateEntry[];
  measurementHistory: MeasurementHistory[];
}
