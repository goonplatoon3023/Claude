import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useAppStore';
import type { FitnessGoals, PrimaryGoal, ExperienceLevel, CardioType, MuscleGroup } from '../types';
import { GOAL_LABELS, GOAL_DESCRIPTIONS, EXPERIENCE_LABELS, CARDIO_LABELS, MUSCLE_GROUP_LABELS } from '../types';

// ── Goal Emojis ──
const GOAL_EMOJIS: Record<PrimaryGoal, string> = {
  muscle_gain: '\uD83D\uDCAA',
  fat_loss: '\uD83D\uDD25',
  strength: '\uD83C\uDFCB\uFE0F',
  endurance: '\uD83C\uDFC3',
  general_fitness: '\u2764\uFE0F',
  athletic_performance: '\u26A1',
};

// ── Colors ──
const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  success: '#22c55e',
  successHover: '#16a34a',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  inputBg: '#0f172a',
  danger: '#ef4444',
};

// ── Shared Styles ──
const sectionStyle: React.CSSProperties = {
  marginBottom: 40,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: colors.text,
  marginBottom: 6,
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: colors.textSecondary,
  marginBottom: 16,
};

// ── Default Form State ──
const defaultGoals: FitnessGoals = {
  primaryGoal: 'general_fitness',
  workoutDaysPerWeek: 4,
  sessionDuration: 60,
  includeCardio: true,
  cardioDaysPerWeek: 2,
  cardioTypes: [],
  focusAreas: [],
  experienceLevel: 'beginner',
};

// ── All Keys ──
const ALL_PRIMARY_GOALS: PrimaryGoal[] = [
  'muscle_gain', 'fat_loss', 'strength', 'endurance', 'general_fitness', 'athletic_performance',
];
const ALL_EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];
const ALL_CARDIO_TYPES: CardioType[] = [
  'running', 'cycling', 'swimming', 'rowing', 'elliptical', 'jump_rope', 'walking', 'hiit',
];
const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'traps',
];
const WORKOUT_DAYS_OPTIONS = [3, 4, 5, 6];
const SESSION_DURATION_OPTIONS = [30, 45, 60, 75, 90];
const CARDIO_DAYS_OPTIONS = [1, 2, 3, 4, 5];

function GoalsPage() {
  const { state, saveGoals } = useStore();

  const [form, setForm] = useState<FitnessGoals>(
    state.goals ? { ...state.goals } : { ...defaultGoals },
  );
  const [saved, setSaved] = useState(false);
  const [hoveredGoal, setHoveredGoal] = useState<PrimaryGoal | null>(null);
  const [hoveredExperience, setHoveredExperience] = useState<ExperienceLevel | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [hoveredDuration, setHoveredDuration] = useState<number | null>(null);
  const [hoveredCardioDay, setHoveredCardioDay] = useState<number | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);
  const [hoveredSave, setHoveredSave] = useState(false);

  // Sync if store goals change externally
  useEffect(() => {
    if (state.goals) {
      setForm({ ...state.goals });
    }
  }, [state.goals]);

  // Clear saved indicator after a delay
  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const update = <K extends keyof FitnessGoals>(key: K, value: FitnessGoals[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const handleSave = () => {
    saveGoals(form);
    setSaved(true);
  };

  // ── Render ──
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: colors.text, marginBottom: 8 }}>
            Set Your Fitness Goals
          </h1>
          <p style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 1.5 }}>
            Tell us what you want to achieve and we will build a personalized plan for you.
          </p>
        </div>

        {/* ────────────────── 1. Primary Goal ────────────────── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Primary Goal</h2>
          <p style={sectionSubtitleStyle}>What is your main fitness objective?</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {ALL_PRIMARY_GOALS.map((goal) => {
              const isSelected = form.primaryGoal === goal;
              const isHovered = hoveredGoal === goal;

              return (
                <div
                  key={goal}
                  onClick={() => update('primaryGoal', goal)}
                  onMouseEnter={() => setHoveredGoal(goal)}
                  onMouseLeave={() => setHoveredGoal(null)}
                  style={{
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : colors.card,
                    border: `2px solid ${isSelected ? colors.primary : isHovered ? '#475569' : colors.border}`,
                    borderRadius: 12,
                    padding: '24px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>
                    {GOAL_EMOJIS[goal]}
                  </div>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: isSelected ? colors.primary : colors.text,
                    marginBottom: 6,
                  }}>
                    {GOAL_LABELS[goal]}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    lineHeight: 1.5,
                  }}>
                    {GOAL_DESCRIPTIONS[goal]}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ────────────────── 2. Experience Level ────────────────── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Experience Level</h2>
          <p style={sectionSubtitleStyle}>How long have you been training consistently?</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {ALL_EXPERIENCE_LEVELS.map((level) => {
              const isSelected = form.experienceLevel === level;
              const isHovered = hoveredExperience === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => update('experienceLevel', level)}
                  onMouseEnter={() => setHoveredExperience(level)}
                  onMouseLeave={() => setHoveredExperience(null)}
                  style={{
                    flex: '1 1 180px',
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: `2px solid ${isSelected ? colors.primary : isHovered ? '#475569' : colors.border}`,
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : colors.card,
                    color: isSelected ? colors.primary : colors.text,
                    fontSize: 14,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    transform: isHovered ? 'translateY(-1px)' : 'none',
                  }}
                >
                  {EXPERIENCE_LABELS[level]}
                </button>
              );
            })}
          </div>
        </section>

        {/* ────────────────── 3. Training Preferences ────────────────── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Training Preferences</h2>
          <p style={sectionSubtitleStyle}>Customize your weekly training schedule.</p>

          <div style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}>
            {/* Workout Days Per Week */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 10,
              }}>
                Workout Days Per Week
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {WORKOUT_DAYS_OPTIONS.map((day) => {
                  const isSelected = form.workoutDaysPerWeek === day;
                  const isHovered = hoveredDay === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => update('workoutDaysPerWeek', day)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        width: 56,
                        height: 48,
                        borderRadius: 8,
                        border: `2px solid ${isSelected ? colors.primary : isHovered ? '#475569' : colors.border}`,
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        color: isSelected ? '#ffffff' : colors.text,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Duration */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 10,
              }}>
                Session Duration (minutes)
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SESSION_DURATION_OPTIONS.map((mins) => {
                  const isSelected = form.sessionDuration === mins;
                  const isHovered = hoveredDuration === mins;

                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => update('sessionDuration', mins)}
                      onMouseEnter={() => setHoveredDuration(mins)}
                      onMouseLeave={() => setHoveredDuration(null)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: `2px solid ${isSelected ? colors.primary : isHovered ? '#475569' : colors.border}`,
                        backgroundColor: isSelected ? colors.primary : colors.inputBg,
                        color: isSelected ? '#ffffff' : colors.text,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                      }}
                    >
                      {mins} min
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Weight */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 4,
              }}>
                Target Weight (lbs)
              </label>
              <p style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginBottom: 10,
              }}>
                Optional. Leave blank if you do not have a specific weight goal.
              </p>
              <input
                type="number"
                placeholder="e.g. 175"
                value={form.targetWeight ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  update('targetWeight', val === '' ? undefined : Number(val));
                }}
                style={{
                  width: 180,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.inputBg,
                  color: colors.text,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </section>

        {/* ────────────────── 4. Cardio Settings ────────────────── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Cardio Settings</h2>
          <p style={sectionSubtitleStyle}>Configure your cardiovascular training.</p>

          <div style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}>
            {/* Include Cardio Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                Include Cardio
              </span>
              <div
                onClick={() => update('includeCardio', !form.includeCardio)}
                style={{
                  width: 52,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: form.includeCardio ? colors.primary : '#475569',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  position: 'absolute',
                  top: 3,
                  left: form.includeCardio ? 27 : 3,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </div>
              <span style={{ fontSize: 13, color: colors.textSecondary }}>
                {form.includeCardio ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            {/* Cardio Sub-options (conditional) */}
            {form.includeCardio && (
              <>
                {/* Cardio Days Per Week */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    marginBottom: 10,
                  }}>
                    Cardio Days Per Week
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {CARDIO_DAYS_OPTIONS.map((day) => {
                      const isSelected = form.cardioDaysPerWeek === day;
                      const isHovered = hoveredCardioDay === day;

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => update('cardioDaysPerWeek', day)}
                          onMouseEnter={() => setHoveredCardioDay(day)}
                          onMouseLeave={() => setHoveredCardioDay(null)}
                          style={{
                            width: 56,
                            height: 48,
                            borderRadius: 8,
                            border: `2px solid ${isSelected ? colors.primary : isHovered ? '#475569' : colors.border}`,
                            backgroundColor: isSelected ? colors.primary : colors.inputBg,
                            color: isSelected ? '#ffffff' : colors.text,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            outline: 'none',
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cardio Types */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.text,
                    marginBottom: 10,
                  }}>
                    Cardio Types
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 10,
                  }}>
                    {ALL_CARDIO_TYPES.map((ctype) => {
                      const isSelected = form.cardioTypes.includes(ctype);

                      return (
                        <label
                          key={ctype}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : colors.inputBg,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => update('cardioTypes', toggleArrayItem(form.cardioTypes, ctype))}
                            style={{
                              width: 18,
                              height: 18,
                              accentColor: colors.primary,
                              cursor: 'pointer',
                            }}
                          />
                          <span style={{
                            fontSize: 14,
                            color: isSelected ? colors.text : colors.textSecondary,
                            fontWeight: isSelected ? 600 : 400,
                          }}>
                            {CARDIO_LABELS[ctype]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ────────────────── 5. Focus Areas ────────────────── */}
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Focus Areas</h2>
          <p style={sectionSubtitleStyle}>Select the muscle groups you want to prioritize. Leave empty for balanced training.</p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}>
            {ALL_MUSCLE_GROUPS.map((muscle) => {
              const isSelected = form.focusAreas.includes(muscle);
              const isHovered = hoveredMuscle === muscle;

              return (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => update('focusAreas', toggleArrayItem(form.focusAreas, muscle))}
                  onMouseEnter={() => setHoveredMuscle(muscle)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 20,
                    border: `2px solid ${isSelected ? colors.primary : isHovered ? '#475569' : colors.border}`,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    color: isSelected ? '#ffffff' : isHovered ? colors.text : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    transform: isHovered && !isSelected ? 'scale(1.05)' : 'none',
                  }}
                >
                  {MUSCLE_GROUP_LABELS[muscle]}
                </button>
              );
            })}
          </div>
        </section>

        {/* ────────────────── 6. Save Button ────────────────── */}
        <div style={{ paddingBottom: 60 }}>
          <button
            type="button"
            onClick={handleSave}
            onMouseEnter={() => setHoveredSave(true)}
            onMouseLeave={() => setHoveredSave(false)}
            style={{
              width: '100%',
              padding: '16px 32px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: saved
                ? colors.success
                : hoveredSave
                  ? colors.primaryHover
                  : colors.primary,
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              transform: hoveredSave && !saved ? 'translateY(-1px)' : 'none',
              boxShadow: hoveredSave && !saved ? '0 6px 20px rgba(59,130,246,0.4)' : 'none',
              letterSpacing: 0.3,
            }}
          >
            {saved ? 'Goals Saved!' : 'Save Goals'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoalsPage;
