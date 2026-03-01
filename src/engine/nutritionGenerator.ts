import type { UserProfile, FitnessGoals, NutritionPlan, MacroTargets, MealPlan, Meal, FoodItem, PrimaryGoal } from '../types';
import { calculateTDEE } from '../utils/calculations';

// ── Calorie Adjustments by Goal ──

const CALORIE_ADJUSTMENTS: Record<PrimaryGoal, number> = {
  muscle_gain: 400,    // lean bulk: midpoint of 300-500
  fat_loss: -500,      // safe deficit
  strength: 200,
  endurance: 100,
  general_fitness: 0,
  athletic_performance: 300,
};

// ── Macro Split Percentages by Goal ──

interface MacroSplit {
  protein: number;
  carbs: number;
  fat: number;
}

const MACRO_SPLITS: Record<PrimaryGoal, MacroSplit> = {
  muscle_gain:          { protein: 0.30, carbs: 0.45, fat: 0.25 },
  fat_loss:             { protein: 0.40, carbs: 0.30, fat: 0.30 },
  strength:             { protein: 0.30, carbs: 0.40, fat: 0.30 },
  endurance:            { protein: 0.20, carbs: 0.55, fat: 0.25 },
  general_fitness:      { protein: 0.30, carbs: 0.40, fat: 0.30 },
  athletic_performance: { protein: 0.25, carbs: 0.50, fat: 0.25 },
};

// ── Supplement Recommendations by Goal ──

const SUPPLEMENT_RECOMMENDATIONS: Record<PrimaryGoal, string[]> = {
  muscle_gain: [
    'Creatine Monohydrate (5g daily)',
    'Whey Protein Isolate (post-workout)',
    'Fish Oil (2-3g EPA/DHA daily)',
    'Multivitamin (daily)',
    'Vitamin D3 (2000-5000 IU daily)',
    'Magnesium (400mg daily)',
  ],
  fat_loss: [
    'Whey Protein Isolate (to hit protein targets)',
    'Caffeine (200mg pre-workout)',
    'Fish Oil (2-3g EPA/DHA daily)',
    'Multivitamin (daily)',
    'Green Tea Extract (500mg daily)',
    'Vitamin D3 (2000-5000 IU daily)',
  ],
  strength: [
    'Creatine Monohydrate (5g daily)',
    'Whey Protein Isolate (post-workout)',
    'Fish Oil (2-3g EPA/DHA daily)',
    'Multivitamin (daily)',
    'Vitamin D3 (2000-5000 IU daily)',
    'Zinc & Magnesium (ZMA, before bed)',
  ],
  endurance: [
    'BCAAs (10g during long sessions)',
    'Electrolyte Mix (during training)',
    'Whey Protein (post-workout)',
    'Fish Oil (2-3g EPA/DHA daily)',
    'Multivitamin (daily)',
    'Iron (if deficient, consult doctor)',
    'Beta-Alanine (3-5g daily)',
  ],
  general_fitness: [
    'Whey Protein (post-workout)',
    'Fish Oil (2-3g EPA/DHA daily)',
    'Multivitamin (daily)',
    'Vitamin D3 (2000-5000 IU daily)',
    'Magnesium (400mg daily)',
  ],
  athletic_performance: [
    'Creatine Monohydrate (5g daily)',
    'BCAAs (10g during training)',
    'Whey Protein Isolate (post-workout)',
    'Fish Oil (2-3g EPA/DHA daily)',
    'Multivitamin (daily)',
    'Caffeine (200mg pre-workout)',
    'Beta-Alanine (3-5g daily)',
    'Vitamin D3 (2000-5000 IU daily)',
  ],
};

// ── Food Item Database ──

interface FoodTemplate {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const BREAKFAST_PROTEINS: FoodTemplate[] = [
  { name: 'Scrambled Eggs',           portion: '3 large',   calories: 220, protein: 18, carbs: 2,  fat: 15 },
  { name: 'Egg White Omelette',       portion: '5 whites',  calories: 130, protein: 27, carbs: 1,  fat: 0  },
  { name: 'Greek Yogurt (plain)',     portion: '1 cup',     calories: 130, protein: 22, carbs: 8,  fat: 0  },
  { name: 'Turkey Sausage Links',     portion: '3 links',   calories: 140, protein: 14, carbs: 1,  fat: 9  },
  { name: 'Cottage Cheese (low-fat)', portion: '1 cup',     calories: 180, protein: 28, carbs: 6,  fat: 5  },
  { name: 'Smoked Salmon',            portion: '3 oz',      calories: 100, protein: 16, carbs: 0,  fat: 4  },
  { name: 'Hard Boiled Eggs',         portion: '3 large',   calories: 210, protein: 18, carbs: 1,  fat: 14 },
  { name: 'Protein Pancakes',         portion: '3 medium',  calories: 250, protein: 24, carbs: 28, fat: 5  },
];

const BREAKFAST_CARBS: FoodTemplate[] = [
  { name: 'Oatmeal (rolled oats)',    portion: '1 cup dry',  calories: 300, protein: 10, carbs: 54, fat: 5  },
  { name: 'Whole Wheat Toast',        portion: '2 slices',   calories: 160, protein: 8,  carbs: 28, fat: 2  },
  { name: 'Banana',                   portion: '1 medium',   calories: 105, protein: 1,  carbs: 27, fat: 0  },
  { name: 'Blueberries',              portion: '1 cup',      calories: 85,  protein: 1,  carbs: 21, fat: 0  },
  { name: 'Sweet Potato Hash',        portion: '1 cup',      calories: 180, protein: 2,  carbs: 41, fat: 1  },
  { name: 'Whole Grain Bagel',        portion: '1 medium',   calories: 250, protein: 10, carbs: 48, fat: 2  },
  { name: 'Mixed Berries',            portion: '1 cup',      calories: 70,  protein: 1,  carbs: 17, fat: 0  },
  { name: 'Granola (low sugar)',      portion: '1/2 cup',    calories: 200, protein: 5,  carbs: 30, fat: 8  },
];

const BREAKFAST_FATS: FoodTemplate[] = [
  { name: 'Avocado',                  portion: '1/2 medium', calories: 120, protein: 1,  carbs: 6,  fat: 11 },
  { name: 'Natural Peanut Butter',    portion: '2 tbsp',     calories: 190, protein: 7,  carbs: 7,  fat: 16 },
  { name: 'Almond Butter',            portion: '2 tbsp',     calories: 200, protein: 7,  carbs: 6,  fat: 18 },
  { name: 'Chia Seeds',               portion: '2 tbsp',     calories: 140, protein: 5,  carbs: 12, fat: 9  },
  { name: 'Walnuts (chopped)',        portion: '1/4 cup',    calories: 190, protein: 4,  carbs: 4,  fat: 18 },
  { name: 'Flaxseed (ground)',        portion: '2 tbsp',     calories: 75,  protein: 3,  carbs: 4,  fat: 6  },
];

const LUNCH_PROTEINS: FoodTemplate[] = [
  { name: 'Grilled Chicken Breast',   portion: '6 oz',      calories: 280, protein: 52, carbs: 0,  fat: 6  },
  { name: 'Turkey Breast (sliced)',   portion: '6 oz',      calories: 180, protein: 36, carbs: 0,  fat: 3  },
  { name: 'Canned Tuna (in water)',   portion: '5 oz',      calories: 140, protein: 32, carbs: 0,  fat: 1  },
  { name: 'Lean Ground Turkey',       portion: '6 oz',      calories: 250, protein: 42, carbs: 0,  fat: 8  },
  { name: 'Grilled Shrimp',           portion: '6 oz',      calories: 170, protein: 36, carbs: 0,  fat: 2  },
  { name: 'Black Bean Burger Patty',  portion: '1 patty',   calories: 190, protein: 14, carbs: 22, fat: 6  },
  { name: 'Tofu (extra firm)',        portion: '6 oz',      calories: 130, protein: 14, carbs: 3,  fat: 7  },
  { name: 'Rotisserie Chicken',       portion: '6 oz',      calories: 310, protein: 44, carbs: 0,  fat: 14 },
];

const LUNCH_CARBS: FoodTemplate[] = [
  { name: 'Brown Rice',               portion: '1 cup cooked',  calories: 215, protein: 5,  carbs: 45, fat: 2  },
  { name: 'Quinoa',                    portion: '1 cup cooked',  calories: 220, protein: 8,  carbs: 39, fat: 4  },
  { name: 'Whole Wheat Wrap',          portion: '1 large',       calories: 180, protein: 6,  carbs: 32, fat: 4  },
  { name: 'Sweet Potato',             portion: '1 medium',      calories: 103, protein: 2,  carbs: 24, fat: 0  },
  { name: 'Whole Wheat Pasta',         portion: '1 cup cooked',  calories: 175, protein: 7,  carbs: 37, fat: 1  },
  { name: 'Jasmine Rice',             portion: '1 cup cooked',  calories: 205, protein: 4,  carbs: 45, fat: 0  },
  { name: 'Baked Potato',             portion: '1 medium',      calories: 160, protein: 4,  carbs: 37, fat: 0  },
  { name: 'Couscous',                 portion: '1 cup cooked',  calories: 175, protein: 6,  carbs: 36, fat: 0  },
];

const LUNCH_SIDES: FoodTemplate[] = [
  { name: 'Steamed Broccoli',         portion: '1 cup',     calories: 55,  protein: 4,  carbs: 11, fat: 0  },
  { name: 'Mixed Green Salad',        portion: '2 cups',    calories: 20,  protein: 2,  carbs: 4,  fat: 0  },
  { name: 'Roasted Vegetables',       portion: '1 cup',     calories: 80,  protein: 2,  carbs: 14, fat: 3  },
  { name: 'Sauteed Spinach',          portion: '1 cup',     calories: 40,  protein: 5,  carbs: 3,  fat: 1  },
  { name: 'Green Beans',              portion: '1 cup',     calories: 35,  protein: 2,  carbs: 8,  fat: 0  },
  { name: 'Cucumber & Tomato Salad',  portion: '1 cup',     calories: 30,  protein: 1,  carbs: 6,  fat: 0  },
  { name: 'Asparagus',                portion: '6 spears',  calories: 20,  protein: 2,  carbs: 4,  fat: 0  },
  { name: 'Bell Pepper Strips',       portion: '1 cup',     calories: 30,  protein: 1,  carbs: 7,  fat: 0  },
];

const LUNCH_FATS: FoodTemplate[] = [
  { name: 'Olive Oil Dressing',       portion: '1 tbsp',    calories: 120, protein: 0,  carbs: 0,  fat: 14 },
  { name: 'Avocado Slices',           portion: '1/3 medium', calories: 80, protein: 1,  carbs: 4,  fat: 7  },
  { name: 'Hummus',                    portion: '3 tbsp',    calories: 105, protein: 3,  carbs: 9,  fat: 6  },
  { name: 'Feta Cheese',              portion: '1 oz',      calories: 75,  protein: 4,  carbs: 1,  fat: 6  },
  { name: 'Guacamole',                portion: '3 tbsp',    calories: 70,  protein: 1,  carbs: 4,  fat: 6  },
  { name: 'Sliced Almonds',           portion: '2 tbsp',    calories: 80,  protein: 3,  carbs: 2,  fat: 7  },
];

const DINNER_PROTEINS: FoodTemplate[] = [
  { name: 'Atlantic Salmon Fillet',    portion: '6 oz',      calories: 350, protein: 34, carbs: 0,  fat: 22 },
  { name: 'Sirloin Steak',            portion: '6 oz',      calories: 310, protein: 46, carbs: 0,  fat: 13 },
  { name: 'Baked Chicken Thighs',     portion: '6 oz',      calories: 280, protein: 38, carbs: 0,  fat: 14 },
  { name: 'Ground Beef (93% lean)',   portion: '6 oz',      calories: 290, protein: 44, carbs: 0,  fat: 12 },
  { name: 'Cod Fillet',               portion: '6 oz',      calories: 140, protein: 32, carbs: 0,  fat: 1  },
  { name: 'Pork Tenderloin',          portion: '6 oz',      calories: 220, protein: 40, carbs: 0,  fat: 6  },
  { name: 'Baked Tilapia',            portion: '6 oz',      calories: 160, protein: 34, carbs: 0,  fat: 3  },
  { name: 'Chicken Breast (grilled)', portion: '6 oz',      calories: 280, protein: 52, carbs: 0,  fat: 6  },
  { name: 'Lamb Chops',               portion: '6 oz',      calories: 340, protein: 40, carbs: 0,  fat: 18 },
  { name: 'Shrimp (sauteed)',         portion: '6 oz',      calories: 180, protein: 36, carbs: 2,  fat: 3  },
];

const DINNER_CARBS: FoodTemplate[] = [
  { name: 'Roasted Sweet Potatoes',   portion: '1 cup',     calories: 180, protein: 4,  carbs: 41, fat: 1  },
  { name: 'Basmati Rice',             portion: '1 cup cooked', calories: 210, protein: 4,  carbs: 46, fat: 0 },
  { name: 'Mashed Potatoes',          portion: '1 cup',     calories: 210, protein: 4,  carbs: 35, fat: 7  },
  { name: 'Whole Wheat Dinner Rolls', portion: '2 rolls',   calories: 150, protein: 6,  carbs: 28, fat: 2  },
  { name: 'Penne Pasta (whole grain)',portion: '1 cup cooked', calories: 175, protein: 7,  carbs: 37, fat: 1 },
  { name: 'Wild Rice',                portion: '1 cup cooked', calories: 165, protein: 7,  carbs: 35, fat: 1 },
  { name: 'Corn on the Cob',          portion: '1 large ear', calories: 125, protein: 4,  carbs: 27, fat: 2 },
  { name: 'Roasted Red Potatoes',     portion: '1 cup',     calories: 130, protein: 3,  carbs: 29, fat: 1  },
];

const DINNER_SIDES: FoodTemplate[] = [
  { name: 'Caesar Salad (no croutons)', portion: '1.5 cups', calories: 90,  protein: 4,  carbs: 4,  fat: 7  },
  { name: 'Grilled Asparagus',          portion: '8 spears', calories: 40,  protein: 4,  carbs: 6,  fat: 1  },
  { name: 'Steamed Green Beans',        portion: '1 cup',    calories: 35,  protein: 2,  carbs: 8,  fat: 0  },
  { name: 'Roasted Brussels Sprouts',   portion: '1 cup',    calories: 75,  protein: 4,  carbs: 12, fat: 3  },
  { name: 'Garlic Sauteed Spinach',     portion: '1 cup',    calories: 50,  protein: 5,  carbs: 4,  fat: 2  },
  { name: 'Steamed Broccoli',           portion: '1 cup',    calories: 55,  protein: 4,  carbs: 11, fat: 0  },
  { name: 'Mixed Roasted Vegetables',   portion: '1 cup',    calories: 85,  protein: 3,  carbs: 14, fat: 3  },
  { name: 'Side Garden Salad',          portion: '2 cups',   calories: 25,  protein: 2,  carbs: 5,  fat: 0  },
];

const DINNER_FATS: FoodTemplate[] = [
  { name: 'Olive Oil (for cooking)',   portion: '1 tbsp',    calories: 120, protein: 0,  carbs: 0,  fat: 14 },
  { name: 'Butter',                    portion: '1 tbsp',    calories: 100, protein: 0,  carbs: 0,  fat: 11 },
  { name: 'Parmesan Cheese',          portion: '2 tbsp',    calories: 45,  protein: 4,  carbs: 0,  fat: 3  },
  { name: 'Sesame Oil',               portion: '1 tbsp',    calories: 120, protein: 0,  carbs: 0,  fat: 14 },
  { name: 'Balsamic Vinaigrette',     portion: '2 tbsp',    calories: 90,  protein: 0,  carbs: 4,  fat: 8  },
  { name: 'Pine Nuts',                portion: '1 tbsp',    calories: 55,  protein: 1,  carbs: 1,  fat: 6  },
];

const SNACK_OPTIONS: FoodTemplate[][] = [
  // Snack combo 1: Protein shake + fruit
  [
    { name: 'Whey Protein Shake',       portion: '1 scoop + water', calories: 120, protein: 24, carbs: 3,  fat: 1  },
    { name: 'Apple',                     portion: '1 medium',        calories: 95,  protein: 0,  carbs: 25, fat: 0  },
  ],
  // Snack combo 2: Almonds + dried fruit
  [
    { name: 'Raw Almonds',              portion: '1/4 cup',         calories: 210, protein: 7,  carbs: 8,  fat: 18 },
    { name: 'Dried Cranberries',         portion: '2 tbsp',          calories: 45,  protein: 0,  carbs: 12, fat: 0  },
  ],
  // Snack combo 3: Cottage cheese + berries
  [
    { name: 'Cottage Cheese (low-fat)', portion: '3/4 cup',         calories: 135, protein: 21, carbs: 5,  fat: 4  },
    { name: 'Strawberries (sliced)',     portion: '1/2 cup',         calories: 25,  protein: 0,  carbs: 6,  fat: 0  },
  ],
  // Snack combo 4: Greek yogurt + honey + granola
  [
    { name: 'Greek Yogurt (plain)',     portion: '3/4 cup',         calories: 100, protein: 17, carbs: 6,  fat: 0  },
    { name: 'Honey',                    portion: '1 tsp',           calories: 20,  protein: 0,  carbs: 6,  fat: 0  },
    { name: 'Granola',                  portion: '2 tbsp',          calories: 60,  protein: 1,  carbs: 9,  fat: 2  },
  ],
  // Snack combo 5: Rice cakes + PB
  [
    { name: 'Rice Cakes',               portion: '2 cakes',         calories: 70,  protein: 2,  carbs: 14, fat: 0  },
    { name: 'Peanut Butter',            portion: '1 tbsp',          calories: 95,  protein: 4,  carbs: 3,  fat: 8  },
  ],
  // Snack combo 6: Trail mix
  [
    { name: 'Trail Mix (nuts, seeds, dried fruit)', portion: '1/3 cup', calories: 200, protein: 6, carbs: 18, fat: 12 },
  ],
  // Snack combo 7: Protein bar
  [
    { name: 'Protein Bar',              portion: '1 bar',           calories: 210, protein: 20, carbs: 24, fat: 7  },
  ],
  // Snack combo 8: Hummus + veggies
  [
    { name: 'Hummus',                   portion: '1/4 cup',         calories: 140, protein: 4,  carbs: 12, fat: 8  },
    { name: 'Carrot & Celery Sticks',   portion: '1 cup',           calories: 35,  protein: 1,  carbs: 8,  fat: 0  },
  ],
  // Snack combo 9: Cheese + crackers
  [
    { name: 'String Cheese',            portion: '2 sticks',        calories: 160, protein: 14, carbs: 2,  fat: 10 },
    { name: 'Whole Grain Crackers',     portion: '6 crackers',      calories: 120, protein: 3,  carbs: 20, fat: 4  },
  ],
  // Snack combo 10: Casein shake (evening)
  [
    { name: 'Casein Protein Shake',     portion: '1 scoop + water', calories: 120, protein: 24, carbs: 3,  fat: 1  },
    { name: 'Peanut Butter',            portion: '1 tbsp',          calories: 95,  protein: 4,  carbs: 3,  fat: 8  },
  ],
  // Snack combo 11: Edamame
  [
    { name: 'Edamame (shelled)',        portion: '1 cup',           calories: 190, protein: 17, carbs: 13, fat: 8  },
  ],
  // Snack combo 12: Jerky + nuts
  [
    { name: 'Beef Jerky',              portion: '1.5 oz',          calories: 115, protein: 18, carbs: 5,  fat: 2  },
    { name: 'Cashews',                 portion: '1/4 cup',         calories: 160, protein: 5,  carbs: 9,  fat: 13 },
  ],
];

// ── Utility Helpers ──

/**
 * Deterministic pseudo-random number generator seeded by profile and goal data.
 * Provides variety without true randomness so plans are reproducible for the same inputs.
 */
function createSeededRng(profile: UserProfile, goals: FitnessGoals): () => number {
  let seed = profile.weight * 1000 + profile.age * 37 + profile.heightFeet * 131
    + profile.heightInches * 17 + goals.workoutDaysPerWeek * 53;

  // Incorporate string-based fields into the seed
  for (let i = 0; i < profile.name.length; i++) {
    seed += profile.name.charCodeAt(i) * (i + 1);
  }
  for (let i = 0; i < goals.primaryGoal.length; i++) {
    seed += goals.primaryGoal.charCodeAt(i) * (i + 3);
  }

  return (): number => {
    // Simple linear congruential generator
    seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function pickItem<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function scaleFoodItem(item: FoodTemplate, factor: number): FoodItem {
  return {
    name: item.name,
    portion: item.portion,
    calories: Math.round(item.calories * factor),
    protein: Math.round(item.protein * factor),
    carbs: Math.round(item.carbs * factor),
    fat: Math.round(item.fat * factor),
  };
}

// ── Core Calculation Functions ──

function calculateDailyCalories(tdee: number, goal: PrimaryGoal): number {
  return Math.round(tdee + CALORIE_ADJUSTMENTS[goal]);
}

function calculateMacros(dailyCalories: number, goal: PrimaryGoal): MacroTargets {
  const split = MACRO_SPLITS[goal];

  const proteinCalories = dailyCalories * split.protein;
  const carbsCalories = dailyCalories * split.carbs;
  const fatCalories = dailyCalories * split.fat;

  // Protein & carbs: 4 cal/g, fat: 9 cal/g
  const proteinGrams = Math.round(proteinCalories / 4);
  const carbsGrams = Math.round(carbsCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  // Fiber scales with calorie intake: roughly 14g per 1000 calories, clamped to 25-35g
  const rawFiber = Math.round((dailyCalories / 1000) * 14);
  const fiberGrams = Math.max(25, Math.min(35, rawFiber));

  return {
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    proteinPercentage: Math.round(split.protein * 100),
    carbsPercentage: Math.round(split.carbs * 100),
    fatPercentage: Math.round(split.fat * 100),
  };
}

function calculateHydration(weightLbs: number): number {
  const oz = Math.round(weightLbs / 2);
  return Math.max(64, oz);
}

// ── Meal Generation ──

function buildMeal(
  name: string,
  time: string,
  _targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFat: number,
  proteinOptions: FoodTemplate[],
  carbOptions: FoodTemplate[],
  sideOptions: FoodTemplate[],
  fatOptions: FoodTemplate[],
  rng: () => number,
): Meal {
  const protein = pickItem(proteinOptions, rng);
  const carb = pickItem(carbOptions, rng);
  const side = pickItem(sideOptions, rng);
  const fat = pickItem(fatOptions, rng);

  // Scale each food to approximate the target, but keep portions reasonable
  // We use a blended approach: scale protein to hit protein target, carbs to hit carb target, etc.
  const proteinScale = protein.protein > 0 ? targetProtein / protein.protein : 1;
  const carbScale = carb.carbs > 0 ? targetCarbs / carb.carbs : 1;
  // Fat is split between the fat source and the protein source
  const fatFromProtein = protein.fat * (proteinScale > 0 ? Math.min(proteinScale, 2) : 1);
  const remainingFat = Math.max(0, targetFat - fatFromProtein);
  const fatScale = fat.fat > 0 ? remainingFat / fat.fat : 1;

  // Clamp all scale factors to keep portions realistic (0.5x to 2.5x)
  const clamp = (v: number) => Math.max(0.5, Math.min(2.5, v));

  const foods: FoodItem[] = [
    scaleFoodItem(protein, clamp(proteinScale)),
    scaleFoodItem(carb, clamp(carbScale)),
    scaleFoodItem(side, 1), // sides stay as-is
    scaleFoodItem(fat, clamp(fatScale)),
  ];

  const totalCalories = foods.reduce((s, f) => s + f.calories, 0);
  const totalProtein = foods.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = foods.reduce((s, f) => s + f.carbs, 0);
  const totalFat = foods.reduce((s, f) => s + f.fat, 0);

  return {
    name,
    time,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    foods,
  };
}

function buildSnack(
  name: string,
  time: string,
  targetCalories: number,
  rng: () => number,
): Meal {
  const combo = pickItem(SNACK_OPTIONS, rng);

  const baseCals = combo.reduce((s, f) => s + f.calories, 0);
  const scaleFactor = baseCals > 0 ? targetCalories / baseCals : 1;
  const clampedScale = Math.max(0.5, Math.min(2.0, scaleFactor));

  const foods: FoodItem[] = combo.map(item => scaleFoodItem(item, clampedScale));

  const totalCalories = foods.reduce((s, f) => s + f.calories, 0);
  const totalProtein = foods.reduce((s, f) => s + f.protein, 0);
  const totalCarbs = foods.reduce((s, f) => s + f.carbs, 0);
  const totalFat = foods.reduce((s, f) => s + f.fat, 0);

  return {
    name,
    time,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    foods,
  };
}

function generateMealPlan(
  dailyCalories: number,
  macros: MacroTargets,
  rng: () => number,
): MealPlan {
  // Calorie distribution: Breakfast 25%, Lunch 30%, Dinner 30%, Snacks 15% (split between 2)
  const breakfastCals = Math.round(dailyCalories * 0.25);
  const lunchCals = Math.round(dailyCalories * 0.30);
  const dinnerCals = Math.round(dailyCalories * 0.30);
  const snackCals = Math.round(dailyCalories * 0.15);
  const perSnackCals = Math.round(snackCals / 2);

  // Distribute macros proportionally to calorie distribution
  const breakfastProtein = Math.round(macros.proteinGrams * 0.25);
  const breakfastCarbs = Math.round(macros.carbsGrams * 0.25);
  const breakfastFat = Math.round(macros.fatGrams * 0.25);

  const lunchProtein = Math.round(macros.proteinGrams * 0.30);
  const lunchCarbs = Math.round(macros.carbsGrams * 0.30);
  const lunchFat = Math.round(macros.fatGrams * 0.30);

  const dinnerProtein = Math.round(macros.proteinGrams * 0.30);
  const dinnerCarbs = Math.round(macros.carbsGrams * 0.30);
  const dinnerFat = Math.round(macros.fatGrams * 0.30);

  const breakfast = buildMeal(
    'Breakfast',
    '7:00 AM',
    breakfastCals,
    breakfastProtein,
    breakfastCarbs,
    breakfastFat,
    BREAKFAST_PROTEINS,
    BREAKFAST_CARBS,
    BREAKFAST_FATS, // breakfast uses fats as "sides"
    BREAKFAST_FATS,
    rng,
  );

  const lunch = buildMeal(
    'Lunch',
    '12:00 PM',
    lunchCals,
    lunchProtein,
    lunchCarbs,
    lunchFat,
    LUNCH_PROTEINS,
    LUNCH_CARBS,
    LUNCH_SIDES,
    LUNCH_FATS,
    rng,
  );

  const dinner = buildMeal(
    'Dinner',
    '6:30 PM',
    dinnerCals,
    dinnerProtein,
    dinnerCarbs,
    dinnerFat,
    DINNER_PROTEINS,
    DINNER_CARBS,
    DINNER_SIDES,
    DINNER_FATS,
    rng,
  );

  const morningSnack = buildSnack('Morning Snack', '10:00 AM', perSnackCals, rng);
  const afternoonSnack = buildSnack('Afternoon Snack', '3:30 PM', perSnackCals, rng);

  return {
    meals: [breakfast, lunch, dinner],
    snacks: [morningSnack, afternoonSnack],
  };
}

// ── Main Export ──

export function generateNutritionPlan(profile: UserProfile, goals: FitnessGoals): NutritionPlan {
  const rng = createSeededRng(profile, goals);
  const tdee = calculateTDEE(profile);
  const dailyCalories = calculateDailyCalories(tdee, goals.primaryGoal);
  const macros = calculateMacros(dailyCalories, goals.primaryGoal);
  const mealPlan = generateMealPlan(dailyCalories, macros, rng);
  const hydrationGoalOz = calculateHydration(profile.weight);
  const supplements = SUPPLEMENT_RECOMMENDATIONS[goals.primaryGoal];

  return {
    id: crypto.randomUUID(),
    dailyCalories,
    macros,
    mealPlan,
    hydrationGoalOz,
    supplements,
    generatedAt: new Date().toISOString(),
    basedOnGoal: goals.primaryGoal,
  };
}
