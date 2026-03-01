import { useStore } from '../store/useAppStore';
import { GOAL_LABELS } from '../types';
import type { NutritionPlan, Meal, MacroTargets } from '../types';

function MacroBar({ macros }: { macros: MacroTargets }) {
  return (
    <div>
      <div style={styles.macroBarContainer}>
        <div style={{ ...styles.macroBarSegment, width: `${macros.proteinPercentage}%`, backgroundColor: '#3b82f6' }} />
        <div style={{ ...styles.macroBarSegment, width: `${macros.carbsPercentage}%`, backgroundColor: '#22c55e' }} />
        <div style={{ ...styles.macroBarSegment, width: `${macros.fatPercentage}%`, backgroundColor: '#f59e0b' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
        <MacroLegend color="#3b82f6" label="Protein" grams={macros.proteinGrams} percent={macros.proteinPercentage} />
        <MacroLegend color="#22c55e" label="Carbs" grams={macros.carbsGrams} percent={macros.carbsPercentage} />
        <MacroLegend color="#f59e0b" label="Fat" grams={macros.fatGrams} percent={macros.fatPercentage} />
      </div>
    </div>
  );
}

function MacroLegend({ color, label, grams, percent }: { color: string; label: string; grams: number; percent: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>
        {grams}g
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{percent}%</div>
    </div>
  );
}

function MealCard({ meal, index }: { meal: Meal; index?: number }) {
  return (
    <div style={styles.mealCard}>
      <div style={styles.mealHeader}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            {index !== undefined ? `${index}. ` : ''}{meal.name}
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>{meal.time}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{meal.calories} cal</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {meal.foods.map((food, i) => (
          <div key={i} style={styles.foodRow}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#f8fafc' }}>{food.name}</span>
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>{food.portion}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
              <span>{food.calories} cal</span>
              <span style={{ color: '#3b82f6' }}>P:{food.protein}g</span>
              <span style={{ color: '#22c55e' }}>C:{food.carbs}g</span>
              <span style={{ color: '#f59e0b' }}>F:{food.fat}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanContent({ plan }: { plan: NutritionPlan }) {
  return (
    <>
      {/* Calorie & Macro Summary */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Daily Targets</h2>
        <div style={styles.calorieDisplay}>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Calories
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#3b82f6' }}>
            {plan.dailyCalories.toLocaleString()}
          </div>
        </div>

        <MacroBar macros={plan.macros} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Fiber</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>{plan.macros.fiberGrams}g</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Hydration</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8' }}>{plan.hydrationGoalOz} oz</div>
          </div>
        </div>
      </div>

      {/* Meal Plan */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Meal Plan</h2>
        {plan.mealPlan.meals.map((meal, i) => (
          <MealCard key={meal.name} meal={meal} index={i + 1} />
        ))}
      </div>

      {/* Snacks */}
      {plan.mealPlan.snacks.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Snacks</h2>
          {plan.mealPlan.snacks.map((snack) => (
            <MealCard key={snack.name} meal={snack} />
          ))}
        </div>
      )}

      {/* Supplements */}
      {plan.supplements.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Supplement Recommendations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plan.supplements.map((supp) => (
              <div key={supp} style={styles.supplementRow}>
                <span style={{ color: '#22c55e', marginRight: 10, fontWeight: 700 }}>+</span>
                <span style={{ fontSize: 14, color: '#f8fafc' }}>{supp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function NutritionPlanPage() {
  const { state, generatePlans } = useStore();
  const plan = state.nutritionPlan;

  if (!state.profile || !state.goals) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.emptyCard}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#127860;</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
              Set Up Your Profile & Goals First
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 480, margin: '0 auto' }}>
              Complete your Profile and Goals to generate a personalized nutrition plan tailored to
              your body composition and fitness objectives.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.emptyCard}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
              Ready to Generate Your Nutrition Plan
            </h2>
            <button onClick={generatePlans} style={styles.generateBtn}>
              Generate Nutrition Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
            Your Nutrition Plan
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
            Personalized nutrition to support your {GOAL_LABELS[plan.basedOnGoal].toLowerCase()} goals.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, backgroundColor: '#22c55e22', color: '#22c55e' }}>
              {GOAL_LABELS[plan.basedOnGoal]}
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Generated {new Date(plan.generatedAt).toLocaleDateString()}
            </span>
            <button onClick={generatePlans} style={styles.regenBtn}>
              Regenerate Plan
            </button>
          </div>
        </div>

        <PlanContent plan={plan} />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '32px 24px',
  } as React.CSSProperties,
  container: {
    maxWidth: 800,
    margin: '0 auto',
  } as React.CSSProperties,
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    padding: 24,
    marginBottom: 24,
  } as React.CSSProperties,
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    padding: '60px 32px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  generateBtn: {
    padding: '14px 32px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  regenBtn: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: 20,
  } as React.CSSProperties,
  calorieDisplay: {
    textAlign: 'center' as const,
    marginBottom: 24,
  } as React.CSSProperties,
  macroBarContainer: {
    display: 'flex',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  } as React.CSSProperties,
  macroBarSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  } as React.CSSProperties,
  mealCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    border: '1px solid #334155',
    padding: 16,
    marginBottom: 12,
  } as React.CSSProperties,
  mealHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  foodRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #1e293b',
    gap: 12,
  } as React.CSSProperties,
  supplementRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    border: '1px solid #334155',
  } as React.CSSProperties,
};
