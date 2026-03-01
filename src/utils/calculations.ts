import type { UserProfile, ActivityLevel } from '../types';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateBMI(weightLbs: number, heightFeet: number, heightInches: number): number {
  const totalInches = heightFeet * 12 + heightInches;
  const heightM = totalInches * 0.0254;
  const weightKg = weightLbs * 0.453592;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
}

export function calculateBMR(profile: UserProfile): number {
  const weightKg = profile.weight * 0.453592;
  const heightCm = (profile.heightFeet * 12 + profile.heightInches) * 2.54;
  if (profile.gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161);
}

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * activityMultipliers[profile.activityLevel]);
}

export function calculateMaxHeartRate(age: number): number {
  return 220 - age;
}

export function getHeartRateZones(maxHR: number) {
  return [
    { zone: 'zone1' as const, name: 'Recovery', minPercent: 50, maxPercent: 60, min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6), description: 'Very light effort, active recovery', color: '#94a3b8' },
    { zone: 'zone2' as const, name: 'Fat Burn', minPercent: 60, maxPercent: 70, min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7), description: 'Light effort, fat burning zone', color: '#3b82f6' },
    { zone: 'zone3' as const, name: 'Aerobic', minPercent: 70, maxPercent: 80, min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8), description: 'Moderate effort, cardio endurance', color: '#22c55e' },
    { zone: 'zone4' as const, name: 'Anaerobic', minPercent: 80, maxPercent: 90, min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9), description: 'Hard effort, performance training', color: '#f59e0b' },
    { zone: 'zone5' as const, name: 'VO2 Max', minPercent: 90, maxPercent: 100, min: Math.round(maxHR * 0.9), max: maxHR, description: 'Maximum effort, peak performance', color: '#ef4444' },
  ];
}

export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function calculateWorkingWeight(oneRM: number, targetReps: number): number {
  const percentage = 1 / (1 + targetReps / 30);
  return Math.round(percentage * oneRM / 5) * 5;
}
