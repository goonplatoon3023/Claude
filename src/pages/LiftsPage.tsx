import { useState, useMemo } from 'react';
import { useStore } from '../store/useAppStore';
import type { LiftEntry, MuscleGroup } from '../types';
import { MUSCLE_GROUP_LABELS } from '../types';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { estimate1RM } from '../utils/calculations';
import { suggestWeight } from '../utils/weightSuggestions';

type MuscleFilter = 'all' | MuscleGroup;

const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: '#ef4444',
  back: '#3b82f6',
  shoulders: '#f59e0b',
  biceps: '#8b5cf6',
  triceps: '#a855f7',
  forearms: '#6366f1',
  quads: '#22c55e',
  hamstrings: '#10b981',
  glutes: '#14b8a6',
  calves: '#06b6d4',
  abs: '#ec4899',
  traps: '#f97316',
};

const CATEGORY_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
};

interface DraftLift {
  weight: string;
  reps: string;
  sets: string;
}

export default function LiftsPage() {
  const { state, saveLift, removeLift } = useStore();
  const { currentLifts } = state;

  const [muscleFilter, setMuscleFilter] = useState<MuscleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Record<string, DraftLift>>({});

  // -- Derived data --

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesMuscle = muscleFilter === 'all' || ex.muscleGroup === muscleFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const totalLogged = Object.keys(currentLifts).length;
  const muscleGroupsCovered = new Set(
    Object.values(currentLifts).map((lift) => {
      const ex = EXERCISE_DATABASE.find((e) => e.id === lift.exerciseId);
      return ex?.muscleGroup;
    }).filter(Boolean),
  ).size;

  const allMuscleGroups = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

  // -- Handlers --

  function toggleCard(exerciseId: string) {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  }

  function getSuggestion(exerciseId: string) {
    if (currentLifts[exerciseId]) return null;
    if (!state.profile || !state.goals) return null;
    return suggestWeight(
      exerciseId,
      currentLifts,
      state.profile.weight,
      state.goals.experienceLevel,
      state.profile.gender,
    );
  }

  function getDraft(exerciseId: string): DraftLift {
    if (drafts[exerciseId]) return drafts[exerciseId];
    const existing = currentLifts[exerciseId];
    if (existing) {
      return {
        weight: String(existing.weight),
        reps: String(existing.reps),
        sets: String(existing.sets),
      };
    }
    // Use suggestion if available, otherwise default
    const suggestion = getSuggestion(exerciseId);
    if (suggestion && suggestion.confidence !== 'high' && suggestion.suggestedWeight > 0) {
      return {
        weight: String(suggestion.suggestedWeight),
        reps: String(suggestion.suggestedReps),
        sets: String(suggestion.suggestedSets),
      };
    }
    const exercise = EXERCISE_DATABASE.find((e) => e.id === exerciseId);
    return {
      weight: String(exercise?.defaultWeight ?? 0),
      reps: '8',
      sets: '3',
    };
  }

  function updateDraft(exerciseId: string, field: keyof DraftLift, value: string) {
    const current = getDraft(exerciseId);
    setDrafts((prev) => ({
      ...prev,
      [exerciseId]: { ...current, [field]: value },
    }));
  }

  function handleSave(exerciseId: string) {
    const draft = getDraft(exerciseId);
    const exercise = EXERCISE_DATABASE.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const weight = parseFloat(draft.weight) || 0;
    const reps = parseInt(draft.reps, 10) || 1;
    const sets = parseInt(draft.sets, 10) || 1;

    const entry: LiftEntry = {
      exerciseId,
      exerciseName: exercise.name,
      weight,
      reps,
      sets,
      lastUpdated: new Date().toISOString(),
    };

    saveLift(entry);

    // Collapse the card after save
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.delete(exerciseId);
      return next;
    });

    // Clear draft
    setDrafts((prev) => {
      const { [exerciseId]: _, ...rest } = prev;
      return rest;
    });
  }

  function handleRemove(exerciseId: string) {
    removeLift(exerciseId);
    setDrafts((prev) => {
      const { [exerciseId]: _, ...rest } = prev;
      return rest;
    });
  }

  // -- Styles --

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f8fafc',
      padding: '32px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    } as React.CSSProperties,

    container: {
      maxWidth: 1200,
      margin: '0 auto',
    } as React.CSSProperties,

    header: {
      marginBottom: 32,
    } as React.CSSProperties,

    title: {
      fontSize: 28,
      fontWeight: 700,
      margin: '0 0 4px 0',
      color: '#f8fafc',
    } as React.CSSProperties,

    subtitle: {
      fontSize: 14,
      color: '#94a3b8',
      margin: 0,
    } as React.CSSProperties,

    summaryRow: {
      display: 'flex',
      gap: 16,
      marginBottom: 24,
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    summaryCard: {
      background: '#1e293b',
      borderRadius: 12,
      border: '1px solid #334155',
      padding: '16px 24px',
      minWidth: 180,
      flex: '1 1 180px',
      maxWidth: 280,
    } as React.CSSProperties,

    summaryLabel: {
      fontSize: 12,
      color: '#94a3b8',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: 4,
    } as React.CSSProperties,

    summaryValue: {
      fontSize: 28,
      fontWeight: 700,
      color: '#3b82f6',
    } as React.CSSProperties,

    searchRow: {
      display: 'flex',
      gap: 12,
      marginBottom: 16,
      alignItems: 'center',
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    searchInput: {
      flex: '1 1 260px',
      padding: '10px 16px',
      borderRadius: 8,
      border: '1px solid #334155',
      background: '#1e293b',
      color: '#f8fafc',
      fontSize: 14,
      outline: 'none',
      minWidth: 200,
    } as React.CSSProperties,

    filterBar: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap' as const,
      marginBottom: 24,
    } as React.CSSProperties,

    filterButton: (active: boolean) => ({
      padding: '8px 16px',
      borderRadius: 20,
      border: active ? '1px solid #3b82f6' : '1px solid #334155',
      background: active ? '#3b82f6' : '#1e293b',
      color: active ? '#ffffff' : '#94a3b8',
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap' as const,
    }) as React.CSSProperties,

    exerciseGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 16,
    } as React.CSSProperties,

    card: (hasLift: boolean) => ({
      background: '#1e293b',
      borderRadius: 12,
      border: hasLift ? '1px solid #3b82f6' : '1px solid #334155',
      padding: 20,
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      boxShadow: hasLift ? '0 0 0 1px rgba(59,130,246,0.15)' : 'none',
    }) as React.CSSProperties,

    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    } as React.CSSProperties,

    exerciseName: {
      fontSize: 16,
      fontWeight: 600,
      color: '#f8fafc',
      margin: 0,
      lineHeight: 1.4,
    } as React.CSSProperties,

    badgeRow: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap' as const,
      marginBottom: 8,
    } as React.CSSProperties,

    badge: (bgColor: string) => ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: bgColor + '22',
      color: bgColor,
      lineHeight: 1.4,
      whiteSpace: 'nowrap' as const,
    }) as React.CSSProperties,

    equipmentText: {
      fontSize: 12,
      color: '#64748b',
      marginBottom: 12,
    } as React.CSSProperties,

    liftDisplay: {
      background: '#0f172a',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 12,
    } as React.CSSProperties,

    liftMainValue: {
      fontSize: 18,
      fontWeight: 700,
      color: '#22c55e',
      marginBottom: 4,
    } as React.CSSProperties,

    liftSubValue: {
      fontSize: 12,
      color: '#94a3b8',
    } as React.CSSProperties,

    inputRow: {
      display: 'flex',
      gap: 8,
      marginBottom: 12,
      alignItems: 'center',
    } as React.CSSProperties,

    inputGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
    } as React.CSSProperties,

    inputLabel: {
      fontSize: 11,
      color: '#64748b',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    } as React.CSSProperties,

    input: {
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid #334155',
      background: '#0f172a',
      color: '#f8fafc',
      fontSize: 14,
      outline: 'none',
      width: '100%',
      textAlign: 'center' as const,
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    buttonRow: {
      display: 'flex',
      gap: 8,
    } as React.CSSProperties,

    saveButton: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: 8,
      border: 'none',
      background: '#3b82f6',
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background 0.15s ease',
    } as React.CSSProperties,

    logButton: {
      width: '100%',
      padding: '10px 16px',
      borderRadius: 8,
      border: '1px solid #334155',
      background: 'transparent',
      color: '#94a3b8',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    } as React.CSSProperties,

    removeButton: {
      padding: '10px 16px',
      borderRadius: 8,
      border: '1px solid #334155',
      background: 'transparent',
      color: '#ef4444',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    } as React.CSSProperties,

    lastUpdated: {
      fontSize: 11,
      color: '#64748b',
      marginTop: 8,
      textAlign: 'right' as const,
    } as React.CSSProperties,

    emptyState: {
      textAlign: 'center' as const,
      padding: '48px 24px',
      color: '#64748b',
      fontSize: 15,
    } as React.CSSProperties,

    resultCount: {
      fontSize: 13,
      color: '#64748b',
      marginBottom: 16,
    } as React.CSSProperties,
  };

  // -- Render --

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Current Lifts</h1>
          <p style={styles.subtitle}>
            Log your working weights for each exercise to track progress and generate personalized plans.
          </p>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Exercises Logged</div>
            <div style={styles.summaryValue}>{totalLogged}</div>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Muscle Groups Covered</div>
            <div style={{ ...styles.summaryValue, color: muscleGroupsCovered >= 6 ? '#22c55e' : '#f59e0b' }}>
              {muscleGroupsCovered} / {allMuscleGroups.length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={styles.searchRow}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search exercises by name or equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Muscle Group Filter */}
        <div style={styles.filterBar}>
          <button
            style={styles.filterButton(muscleFilter === 'all')}
            onClick={() => setMuscleFilter('all')}
          >
            All
          </button>
          {allMuscleGroups.map((mg) => (
            <button
              key={mg}
              style={styles.filterButton(muscleFilter === mg)}
              onClick={() => setMuscleFilter(mg)}
            >
              {MUSCLE_GROUP_LABELS[mg]}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div style={styles.resultCount}>
          Showing {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
          {muscleFilter !== 'all' ? ` in ${MUSCLE_GROUP_LABELS[muscleFilter]}` : ''}
          {searchQuery.trim() ? ` matching "${searchQuery.trim()}"` : ''}
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <div style={styles.emptyState}>
            No exercises found. Try adjusting your filters.
          </div>
        ) : (
          <div style={styles.exerciseGrid}>
            {filteredExercises.map((exercise) => {
              const liftEntry = currentLifts[exercise.id];
              const isExpanded = expandedCards.has(exercise.id);
              const draft = getDraft(exercise.id);
              const mgColor = MUSCLE_GROUP_COLORS[exercise.muscleGroup];
              const suggestion = !liftEntry ? getSuggestion(exercise.id) : null;
              const hasSuggestion = suggestion && suggestion.confidence !== 'high' && suggestion.suggestedWeight > 0;

              const confidenceColors: Record<string, string> = {
                high: '#22c55e',
                medium: '#f59e0b',
                low: '#64748b',
              };

              return (
                <div key={exercise.id} style={styles.card(!!liftEntry)}>
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <h3 style={styles.exerciseName}>{exercise.name}</h3>
                  </div>

                  {/* Badges */}
                  <div style={styles.badgeRow}>
                    <span style={styles.badge(mgColor)}>
                      {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                    </span>
                    <span
                      style={styles.badge(exercise.isCompound ? '#3b82f6' : '#8b5cf6')}
                    >
                      {exercise.isCompound ? 'Compound' : 'Isolation'}
                    </span>
                    <span style={styles.badge('#64748b')}>
                      {CATEGORY_LABELS[exercise.category] || exercise.category}
                    </span>
                  </div>

                  {/* Equipment */}
                  <div style={styles.equipmentText}>
                    {exercise.equipment}
                  </div>

                  {/* Current lift display */}
                  {liftEntry && (
                    <div style={styles.liftDisplay}>
                      <div style={styles.liftMainValue}>
                        {liftEntry.weight} lbs x {liftEntry.reps} reps x {liftEntry.sets} sets
                      </div>
                      <div style={styles.liftSubValue}>
                        Est. 1RM: {estimate1RM(liftEntry.weight, liftEntry.reps)} lbs
                      </div>
                    </div>
                  )}

                  {/* Suggestion display (when no lift logged) */}
                  {!liftEntry && hasSuggestion && !isExpanded && (
                    <div style={{
                      background: '#0f172a',
                      borderRadius: 8,
                      padding: '10px 14px',
                      marginBottom: 12,
                      border: `1px solid ${confidenceColors[suggestion.confidence]}33`,
                    }}>
                      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                        Suggested Starting Weight
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: confidenceColors[suggestion.confidence] }}>
                        {suggestion.suggestedWeight} lbs x {suggestion.suggestedReps} reps x {suggestion.suggestedSets} sets
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {suggestion.reason}
                      </div>
                    </div>
                  )}

                  {/* Expanded input form */}
                  {(isExpanded || liftEntry) && (
                    <>
                      {/* Suggestion hint in edit mode */}
                      {!liftEntry && hasSuggestion && (
                        <div style={{
                          fontSize: 11,
                          color: confidenceColors[suggestion.confidence],
                          padding: '6px 10px',
                          backgroundColor: confidenceColors[suggestion.confidence] + '11',
                          borderRadius: 6,
                          marginBottom: 8,
                          lineHeight: 1.4,
                        }}>
                          Suggested: {suggestion.suggestedWeight} lbs &mdash; {suggestion.reason}
                        </div>
                      )}

                      <div style={styles.inputRow}>
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>Weight (lbs)</label>
                          <input
                            style={styles.input}
                            type="number"
                            min="0"
                            step="5"
                            value={draft.weight}
                            onChange={(e) => updateDraft(exercise.id, 'weight', e.target.value)}
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>Reps</label>
                          <input
                            style={styles.input}
                            type="number"
                            min="1"
                            step="1"
                            value={draft.reps}
                            onChange={(e) => updateDraft(exercise.id, 'reps', e.target.value)}
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>Sets</label>
                          <input
                            style={styles.input}
                            type="number"
                            min="1"
                            step="1"
                            value={draft.sets}
                            onChange={(e) => updateDraft(exercise.id, 'sets', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={styles.buttonRow}>
                        <button
                          style={styles.saveButton}
                          onClick={() => handleSave(exercise.id)}
                        >
                          Save Lift
                        </button>
                        {liftEntry && (
                          <button
                            style={styles.removeButton}
                            onClick={() => handleRemove(exercise.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {liftEntry && (
                        <div style={styles.lastUpdated}>
                          Last updated: {new Date(liftEntry.lastUpdated).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Log Lift toggle button (when collapsed and no existing lift) */}
                  {!isExpanded && !liftEntry && (
                    <button
                      style={styles.logButton}
                      onClick={() => toggleCard(exercise.id)}
                    >
                      Log Lift
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
