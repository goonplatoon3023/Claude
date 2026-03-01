import { useStore } from '../store/useAppStore';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, calculateMaxHeartRate } from '../utils/calculations';
import { GOAL_LABELS, EXPERIENCE_LABELS } from '../types';
import type { WorkoutDay } from '../types';

const DAY_TYPE_COLORS: Record<WorkoutDay['type'], string> = {
  training: '#3b82f6',
  rest: '#475569',
  active_recovery: '#8b5cf6',
  cardio: '#22c55e',
};

export default function DashboardPage() {
  const { state } = useStore();
  const { profile, goals, workoutPlan, nutritionPlan, currentLifts, heartRateEntries } = state;

  if (!profile) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.welcomeCard}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>
              Welcome to FitForge
            </h1>
            <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
              Your personalized fitness and nutrition companion. Get started by setting up your profile
              to unlock tailored workout plans, nutrition guidance, and progress tracking.
            </p>

            <div style={styles.stepsContainer}>
              <StepCard number={1} title="Create Profile" description="Enter your measurements, body stats, and activity level" done={!!profile} />
              <StepCard number={2} title="Set Goals" description="Choose your fitness objective and training preferences" done={!!goals} />
              <StepCard number={3} title="Log Lifts" description="Record your current weights for accurate plan generation" done={Object.keys(currentLifts).length > 0} />
              <StepCard number={4} title="Get Your Plan" description="Receive a detailed weekly workout and nutrition plan" done={!!workoutPlan} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI(profile.weight, profile.heightFeet, profile.heightInches);
  const bmiCat = getBMICategory(bmi);
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);
  const maxHR = calculateMaxHeartRate(profile.age);
  const liftsCount = Object.keys(currentLifts).length;
  const latestHR = heartRateEntries.length > 0
    ? [...heartRateEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Welcome back, {profile.name}
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
            Here is your fitness dashboard overview.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard label="Weight" value={`${profile.weight}`} unit="lbs" color="#f8fafc" />
          <StatCard label="BMI" value={bmi.toFixed(1)} unit={bmiCat.label} color={bmiCat.color} />
          <StatCard label="BMR" value={bmr.toLocaleString()} unit="cal/day" color="#f8fafc" />
          <StatCard label="TDEE" value={tdee.toLocaleString()} unit="cal/day" color="#3b82f6" />
          <StatCard label="Max HR" value={`${maxHR}`} unit="BPM" color="#ef4444" />
          <StatCard label="Exercises Logged" value={`${liftsCount}`} unit="lifts" color="#22c55e" />
        </div>

        {/* Goals Summary */}
        {goals && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Your Goals</h2>
            <div style={styles.goalsGrid}>
              <div style={styles.goalItem}>
                <span style={styles.goalLabel}>Primary Goal</span>
                <span style={styles.goalValue}>{GOAL_LABELS[goals.primaryGoal]}</span>
              </div>
              <div style={styles.goalItem}>
                <span style={styles.goalLabel}>Experience</span>
                <span style={styles.goalValue}>{EXPERIENCE_LABELS[goals.experienceLevel]}</span>
              </div>
              <div style={styles.goalItem}>
                <span style={styles.goalLabel}>Training Days</span>
                <span style={styles.goalValue}>{goals.workoutDaysPerWeek} days/week</span>
              </div>
              <div style={styles.goalItem}>
                <span style={styles.goalLabel}>Session Length</span>
                <span style={styles.goalValue}>{goals.sessionDuration} min</span>
              </div>
              {goals.includeCardio && (
                <div style={styles.goalItem}>
                  <span style={styles.goalLabel}>Cardio</span>
                  <span style={styles.goalValue}>{goals.cardioDaysPerWeek} days/week</span>
                </div>
              )}
              {goals.targetWeight && (
                <div style={styles.goalItem}>
                  <span style={styles.goalLabel}>Target Weight</span>
                  <span style={styles.goalValue}>{goals.targetWeight} lbs</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weekly Schedule Preview */}
        {workoutPlan && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>{workoutPlan.name}</h2>
            <div style={styles.weekRow}>
              {workoutPlan.weeklySchedule.map((day) => (
                <div key={day.dayNumber} style={styles.weekDayCard(day.type)}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                    {day.dayName.substring(0, 3).toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: DAY_TYPE_COLORS[day.type],
                    marginTop: 4,
                  }}>
                    {day.type === 'training' ? day.focus?.split('(')[0]?.trim() || 'Training' : day.type === 'rest' ? 'Rest' : day.type === 'active_recovery' ? 'Recovery' : 'Cardio'}
                  </div>
                  {day.exercises.length > 0 && (
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                      {day.exercises.length} exercises
                    </div>
                  )}
                  {day.estimatedDuration > 0 && (
                    <div style={{ fontSize: 10, color: '#475569' }}>
                      ~{day.estimatedDuration} min
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Quick View */}
        {nutritionPlan && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Daily Nutrition Targets</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <div style={styles.nutrientCard('#3b82f6')}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Calories</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>
                  {nutritionPlan.dailyCalories.toLocaleString()}
                </div>
              </div>
              <div style={styles.nutrientCard('#3b82f6')}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Protein</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
                  {nutritionPlan.macros.proteinGrams}g
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{nutritionPlan.macros.proteinPercentage}%</div>
              </div>
              <div style={styles.nutrientCard('#22c55e')}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Carbs</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>
                  {nutritionPlan.macros.carbsGrams}g
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{nutritionPlan.macros.carbsPercentage}%</div>
              </div>
              <div style={styles.nutrientCard('#f59e0b')}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Fat</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>
                  {nutritionPlan.macros.fatGrams}g
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{nutritionPlan.macros.fatPercentage}%</div>
              </div>
              <div style={styles.nutrientCard('#38bdf8')}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Hydration</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#38bdf8' }}>
                  {nutritionPlan.hydrationGoalOz} oz
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heart Rate */}
        {latestHR && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Latest Heart Rate</h2>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Resting HR</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{latestHR.restingHR} <span style={{ fontSize: 14, fontWeight: 400 }}>BPM</span></div>
              </div>
              {latestHR.averageHR && (
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Avg HR</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{latestHR.averageHR} <span style={{ fontSize: 14, fontWeight: 400 }}>BPM</span></div>
                </div>
              )}
              {latestHR.maxHR && (
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Max HR</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{latestHR.maxHR} <span style={{ fontSize: 14, fontWeight: 400 }}>BPM</span></div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              Recorded on {new Date(latestHR.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {latestHR.activityType && ` during ${latestHR.activityType}`}
            </div>
          </div>
        )}

        {/* Body Measurements */}
        {profile.measurements && Object.values(profile.measurements).some(v => v != null) && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Body Measurements</h2>
            <div style={styles.measureGrid}>
              {(Object.entries(profile.measurements) as [string, number | undefined][])
                .filter(([, v]) => v != null)
                .map(([key, value]) => (
                  <div key={key} style={styles.measureItem}>
                    <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
                      {value}"
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({ number, title, description, done }: { number: number; title: string; description: string; done: boolean }) {
  return (
    <div style={{
      backgroundColor: done ? '#22c55e15' : '#1e293b',
      border: `1px solid ${done ? '#22c55e44' : '#334155'}`,
      borderRadius: 12,
      padding: '20px 16px',
      textAlign: 'center',
      flex: '1 1 200px',
      minWidth: 180,
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        backgroundColor: done ? '#22c55e' : '#3b82f6',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 12,
      }}>
        {done ? '\u2713' : number}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{description}</p>
    </div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: 12,
      border: '1px solid #334155',
      padding: '16px 20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{unit}</div>
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
    maxWidth: 1000,
    margin: '0 auto',
  } as React.CSSProperties,
  welcomeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    border: '1px solid #334155',
    padding: '60px 32px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  stepsContainer: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 12,
    marginBottom: 24,
  } as React.CSSProperties,
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    padding: 24,
    marginBottom: 24,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: 16,
  } as React.CSSProperties,
  goalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
  } as React.CSSProperties,
  goalItem: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: '12px 16px',
    border: '1px solid #334155',
  } as React.CSSProperties,
  goalLabel: {
    display: 'block',
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: 4,
  } as React.CSSProperties,
  goalValue: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#f8fafc',
  } as React.CSSProperties,
  weekRow: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto' as const,
  } as React.CSSProperties,
  weekDayCard: (type: WorkoutDay['type']) => ({
    flex: '1 1 0',
    minWidth: 90,
    backgroundColor: '#0f172a',
    border: `1px solid ${DAY_TYPE_COLORS[type]}33`,
    borderRadius: 10,
    padding: '12px 8px',
    textAlign: 'center' as const,
  }) as React.CSSProperties,
  nutrientCard: (color: string) => ({
    flex: '1 1 120px',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: '14px 16px',
    border: `1px solid ${color}22`,
    textAlign: 'center' as const,
  }) as React.CSSProperties,
  measureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12,
  } as React.CSSProperties,
  measureItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: '10px 14px',
    border: '1px solid #334155',
  } as React.CSSProperties,
};
