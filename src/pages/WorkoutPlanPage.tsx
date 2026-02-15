import { useState, useMemo } from 'react';
import { useStore } from '../store/useAppStore';
import { GOAL_LABELS, MUSCLE_GROUP_LABELS } from '../types';
import type { WorkoutDay, PlannedExercise, CardioSession, HeartRateZone } from '../types';
import { suggestWeight } from '../utils/weightSuggestions';

const ZONE_LABELS: Record<HeartRateZone, string> = {
  zone1: 'Zone 1 - Recovery',
  zone2: 'Zone 2 - Fat Burn',
  zone3: 'Zone 3 - Aerobic',
  zone4: 'Zone 4 - Anaerobic',
  zone5: 'Zone 5 - VO2 Max',
};

const DAY_TYPE_COLORS: Record<WorkoutDay['type'], string> = {
  training: '#3b82f6',
  rest: '#475569',
  active_recovery: '#8b5cf6',
  cardio: '#22c55e',
};

const DAY_TYPE_LABELS: Record<WorkoutDay['type'], string> = {
  training: 'Training',
  rest: 'Rest Day',
  active_recovery: 'Active Recovery',
  cardio: 'Cardio',
};

function formatRest(seconds: number): string {
  if (seconds >= 120) return `${Math.round(seconds / 60)} min`;
  return `${seconds}s`;
}

export default function WorkoutPlanPage() {
  const { state, generatePlans } = useStore();
  const plan = state.workoutPlan;

  if (!state.profile || !state.goals) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.emptyCard}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#127947;</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
              Set Up Your Profile & Goals First
            </h2>
            <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 480, margin: '0 auto' }}>
              Complete your Profile and Goals to generate a personalized workout plan tailored to your
              body, experience level, and fitness objectives.
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
              Ready to Generate Your Plan
            </h2>
            <button onClick={generatePlans} style={styles.generateBtn}>
              Generate Workout Plan
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
            {plan.name}
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
            {plan.description}
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ ...styles.headerBadge, backgroundColor: '#3b82f622', color: '#3b82f6' }}>
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

        {/* Weekly Overview Bar */}
        <div style={styles.weekOverview}>
          {plan.weeklySchedule.map((day) => (
            <div key={day.dayNumber} style={styles.weekDayChip(day.type)}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                {day.dayName.substring(0, 3)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: DAY_TYPE_COLORS[day.type] }}>
                {DAY_TYPE_LABELS[day.type]}
              </span>
            </div>
          ))}
        </div>

        {/* Day Cards */}
        {plan.weeklySchedule.map((day) => (
          <DayCard key={day.dayNumber} day={day} />
        ))}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: WorkoutDay }) {
  const color = DAY_TYPE_COLORS[day.type];

  return (
    <div style={{ ...styles.dayCard, borderLeftColor: color }}>
      {/* Day Header */}
      <div style={styles.dayHeader}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            {day.dayName}
          </h2>
          {day.focus && (
            <span style={{ fontSize: 14, color: color, fontWeight: 500 }}>
              {day.focus}
            </span>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ ...styles.dayTypeBadge, backgroundColor: color + '22', color }}>
            {DAY_TYPE_LABELS[day.type]}
          </span>
          {day.estimatedDuration > 0 && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              ~{day.estimatedDuration} min
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {day.notes && (
        <div style={styles.dayNotes}>
          {day.notes}
        </div>
      )}

      {/* Exercises */}
      {day.exercises.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <table style={styles.exerciseTable}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={{ ...styles.th, textAlign: 'left' }}>Exercise</th>
                <th style={styles.th}>Sets</th>
                <th style={styles.th}>Reps</th>
                <th style={styles.th}>Weight</th>
                <th style={styles.th}>Rest</th>
                <th style={{ ...styles.th, textAlign: 'left', minWidth: 100 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex, i) => (
                <ExerciseRow key={ex.exerciseId} exercise={ex} index={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cardio */}
      {day.cardio && <CardioBlock cardio={day.cardio} />}
    </div>
  );
}

function ExerciseRow({ exercise, index }: { exercise: PlannedExercise; index: number }) {
  const { state, saveLift } = useStore();
  const [editing, setEditing] = useState(false);
  const existingLift = state.currentLifts[exercise.exerciseId];

  // Get weight suggestion based on similar lifts and body measurements
  const suggestion = useMemo(() => {
    if (existingLift) return null; // Don't suggest if already logged
    if (!state.profile || !state.goals) return null;
    return suggestWeight(
      exercise.exerciseId,
      state.currentLifts,
      state.profile.weight,
      state.goals.experienceLevel,
      state.profile.gender,
    );
  }, [exercise.exerciseId, existingLift, state.currentLifts, state.profile, state.goals]);

  const suggestedWeight = suggestion && suggestion.confidence !== 'high' ? suggestion.suggestedWeight : null;

  const [draftWeight, setDraftWeight] = useState(
    existingLift ? String(existingLift.weight)
    : suggestedWeight ? String(suggestedWeight)
    : String(exercise.weight)
  );
  const [draftReps, setDraftReps] = useState(
    existingLift ? String(existingLift.reps)
    : suggestion?.suggestedReps ? String(suggestion.suggestedReps)
    : String(exercise.reps.includes('-') ? exercise.reps.split('-')[0] : exercise.reps)
  );
  const [draftSets, setDraftSets] = useState(
    existingLift ? String(existingLift.sets)
    : suggestion?.suggestedSets ? String(suggestion.suggestedSets)
    : String(exercise.sets)
  );

  function handleSave() {
    const weight = parseFloat(draftWeight) || 0;
    const reps = parseInt(draftReps, 10) || 1;
    const sets = parseInt(draftSets, 10) || 1;
    saveLift({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      weight,
      reps,
      sets,
      lastUpdated: new Date().toISOString(),
    });
    setEditing(false);
  }

  function handleStartEditing() {
    // Pre-fill with suggestion when starting to edit
    if (!existingLift && suggestion && suggestion.confidence !== 'high') {
      setDraftWeight(String(suggestion.suggestedWeight));
      if (suggestion.suggestedReps) setDraftReps(String(suggestion.suggestedReps));
      if (suggestion.suggestedSets) setDraftSets(String(suggestion.suggestedSets));
    }
    setEditing(true);
  }

  const displayWeight = existingLift ? existingLift.weight : exercise.weight;

  // Confidence color for suggestion badge
  const confidenceColors = {
    high: '#22c55e',
    medium: '#f59e0b',
    low: '#64748b',
  };

  return (
    <tr style={{ borderBottom: '1px solid #1e293b' }}>
      <td style={styles.td}>{index}</td>
      <td style={{ ...styles.td, textAlign: 'left' }}>
        <div>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{exercise.exerciseName}</span>
          {exercise.isCompound && (
            <span style={{ ...styles.microBadge, backgroundColor: '#3b82f622', color: '#3b82f6' }}>
              Compound
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
          {exercise.tempo && ` | Tempo: ${exercise.tempo}`}
        </div>
        {exercise.alternatives.length > 0 && (
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
            Alt: {exercise.alternatives.join(', ')}
          </div>
        )}
      </td>
      <td style={styles.tdCenter}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>{exercise.sets}</span>
      </td>
      <td style={styles.tdCenter}>
        <span style={{ fontWeight: 600, color: '#22c55e' }}>{exercise.reps}</span>
      </td>
      <td style={styles.tdCenter}>
        {!editing ? (
          <div
            onClick={handleStartEditing}
            style={{ cursor: 'pointer' }}
            title="Click to log your weight"
          >
            <span style={{ fontWeight: 700, color: existingLift ? '#22c55e' : '#f59e0b' }}>
              {displayWeight > 0 ? `${displayWeight} lbs` : 'BW'}
            </span>
            {existingLift && (
              <div style={{ fontSize: 10, color: '#64748b' }}>Your lift</div>
            )}
            {!existingLift && suggestion && suggestedWeight && suggestedWeight > 0 && (
              <div style={{ fontSize: 10, color: confidenceColors[suggestion.confidence], marginTop: 2 }}>
                Suggested: {suggestedWeight} lbs
              </div>
            )}
            {!existingLift && (
              <div style={{ fontSize: 10, color: '#64748b' }}>Click to log</div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
            {/* Suggestion hint */}
            {suggestion && suggestion.confidence !== 'high' && suggestion.suggestedWeight > 0 && (
              <div style={{
                fontSize: 10,
                color: confidenceColors[suggestion.confidence],
                padding: '2px 4px',
                backgroundColor: confidenceColors[suggestion.confidence] + '11',
                borderRadius: 4,
                lineHeight: 1.3,
              }}>
                {suggestion.reason}
              </div>
            )}
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Wt (lbs)</div>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={draftWeight}
                  onChange={e => setDraftWeight(e.target.value)}
                  style={styles.inlineInput}
                  autoFocus
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Reps</div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={draftReps}
                  onChange={e => setDraftReps(e.target.value)}
                  style={styles.inlineInput}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>Sets</div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={draftSets}
                  onChange={e => setDraftSets(e.target.value)}
                  style={styles.inlineInput}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={handleSave} style={styles.inlineSaveBtn}>Save</button>
              <button onClick={() => setEditing(false)} style={styles.inlineCancelBtn}>X</button>
            </div>
          </div>
        )}
      </td>
      <td style={styles.tdCenter}>
        <span style={{ color: '#94a3b8' }}>{formatRest(exercise.restSeconds)}</span>
      </td>
      <td style={{ ...styles.td, textAlign: 'left', fontSize: 12, color: '#94a3b8', maxWidth: 200 }}>
        {exercise.notes || '—'}
      </td>
    </tr>
  );
}

function CardioBlock({ cardio }: { cardio: CardioSession }) {
  return (
    <div style={styles.cardioBlock}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>Cardio</span>
        <span style={{ ...styles.microBadge, backgroundColor: '#22c55e22', color: '#22c55e' }}>
          {cardio.intensity.toUpperCase()}
        </span>
        {cardio.targetHeartRateZone && (
          <span style={{ ...styles.microBadge, backgroundColor: '#f59e0b22', color: '#f59e0b' }}>
            {ZONE_LABELS[cardio.targetHeartRateZone]}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Duration</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{cardio.durationMinutes} min</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
        {cardio.description}
      </p>
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
  headerBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  } as React.CSSProperties,
  weekOverview: {
    display: 'flex',
    gap: 8,
    marginBottom: 28,
    overflowX: 'auto' as const,
    paddingBottom: 4,
  } as React.CSSProperties,
  weekDayChip: (type: WorkoutDay['type']) => ({
    flex: '1 1 0',
    minWidth: 80,
    backgroundColor: '#1e293b',
    border: `1px solid ${DAY_TYPE_COLORS[type]}44`,
    borderRadius: 10,
    padding: '10px 8px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  }) as React.CSSProperties,
  dayCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    borderLeft: '4px solid #3b82f6',
    padding: 24,
    marginBottom: 20,
  } as React.CSSProperties,
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as React.CSSProperties,
  dayTypeBadge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  } as React.CSSProperties,
  dayNotes: {
    marginTop: 12,
    padding: '10px 14px',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.5,
    borderLeft: '3px solid #475569',
  } as React.CSSProperties,
  exerciseTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  } as React.CSSProperties,
  th: {
    padding: '8px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #334155',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  td: {
    padding: '12px 10px',
    verticalAlign: 'top' as const,
  } as React.CSSProperties,
  tdCenter: {
    padding: '12px 10px',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,
  microBadge: {
    display: 'inline-block',
    padding: '1px 8px',
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 600,
    marginLeft: 6,
    verticalAlign: 'middle',
  } as React.CSSProperties,
  cardioBlock: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    border: '1px solid #22c55e33',
  } as React.CSSProperties,
  inlineInput: {
    width: '100%',
    padding: '4px 6px',
    borderRadius: 6,
    border: '1px solid #334155',
    background: '#0f172a',
    color: '#f8fafc',
    fontSize: 13,
    textAlign: 'center' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  inlineSaveBtn: {
    flex: 1,
    padding: '4px 8px',
    borderRadius: 6,
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  inlineCancelBtn: {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid #334155',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 11,
    cursor: 'pointer',
  } as React.CSSProperties,
};
