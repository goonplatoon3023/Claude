import { useState } from 'react';
import { useStore } from '../store/useAppStore';
import type { HeartRateEntry, HeartRateZone } from '../types';
import { calculateMaxHeartRate, getHeartRateZones } from '../utils/calculations';

const ACTIVITY_TYPES = ['Rest', 'Walking', 'Running', 'Cycling', 'Weight Training', 'HIIT', 'Swimming', 'Other'] as const;

const ZONE_COLORS: Record<HeartRateZone, string> = {
  zone1: '#94a3b8',
  zone2: '#3b82f6',
  zone3: '#22c55e',
  zone4: '#f59e0b',
  zone5: '#ef4444',
};

const ZONE_LABELS: Record<HeartRateZone, string> = {
  zone1: 'Zone 1 - Recovery',
  zone2: 'Zone 2 - Fat Burn',
  zone3: 'Zone 3 - Aerobic',
  zone4: 'Zone 4 - Anaerobic',
  zone5: 'Zone 5 - VO2 Max',
};

function determineZone(averageHR: number, maxHR: number): HeartRateZone | undefined {
  const percent = averageHR / maxHR;
  if (percent >= 0.9) return 'zone5';
  if (percent >= 0.8) return 'zone4';
  if (percent >= 0.7) return 'zone3';
  if (percent >= 0.6) return 'zone2';
  if (percent >= 0.5) return 'zone1';
  return undefined;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ── Styles ──

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '32px 24px',
  } as React.CSSProperties,
  container: {
    maxWidth: 900,
    margin: '0 auto',
  } as React.CSSProperties,
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
    color: '#f8fafc',
  } as React.CSSProperties,
  pageSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
  } as React.CSSProperties,
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    padding: 24,
    marginBottom: 24,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 16,
    color: '#f8fafc',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#94a3b8',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    appearance: 'none' as const,
    cursor: 'pointer',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f8fafc',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    minHeight: 80,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  button: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#f8fafc',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  deleteButton: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  zoneBadge: (zone: HeartRateZone) =>
    ({
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      color: '#0f172a',
      backgroundColor: ZONE_COLORS[zone],
    }) as React.CSSProperties,
  entryCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  } as React.CSSProperties,
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  } as React.CSSProperties,
  entryStats: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 16,
    marginBottom: 8,
  } as React.CSSProperties,
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  statValue: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f8fafc',
  } as React.CSSProperties,
  noProfileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    padding: 40,
    textAlign: 'center' as const,
    marginBottom: 24,
  } as React.CSSProperties,
  zoneBar: (color: string) =>
    ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: color + '18',
      borderLeft: `4px solid ${color}`,
    }) as React.CSSProperties,
  zoneBarLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as React.CSSProperties,
  zoneBarName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f8fafc',
  } as React.CSSProperties,
  zoneBarDesc: {
    fontSize: 12,
    color: '#94a3b8',
  } as React.CSSProperties,
  zoneBarBPM: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f8fafc',
    whiteSpace: 'nowrap' as const,
    marginLeft: 16,
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '32px 16px',
    color: '#94a3b8',
    fontSize: 14,
  } as React.CSSProperties,
  entryNotes: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic' as const,
    marginTop: 6,
  } as React.CSSProperties,
};

// ── Component ──

export default function HeartRatePage() {
  const { state, addHeartRateEntry, removeHeartRateEntry } = useStore();
  const profile = state.profile;

  // Form state
  const [date, setDate] = useState(getTodayString());
  const [restingHR, setRestingHR] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [averageHR, setAverageHR] = useState('');
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [manualZone, setManualZone] = useState<HeartRateZone | ''>('');
  const [notes, setNotes] = useState('');

  const userMaxHR = profile ? calculateMaxHeartRate(profile.age) : null;
  const zones = userMaxHR ? getHeartRateZones(userMaxHR) : null;

  const autoZone: HeartRateZone | undefined =
    averageHR && userMaxHR
      ? determineZone(Number(averageHR), userMaxHR)
      : undefined;

  const effectiveZone = autoZone ?? (manualZone || undefined);

  function resetForm() {
    setDate(getTodayString());
    setRestingHR('');
    setMaxHR('');
    setAverageHR('');
    setActivityType('');
    setDuration('');
    setManualZone('');
    setNotes('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const restingHRNum = Number(restingHR);
    if (!restingHR || isNaN(restingHRNum) || restingHRNum <= 0) return;

    const entry: HeartRateEntry = {
      id: crypto.randomUUID(),
      date,
      restingHR: restingHRNum,
      ...(maxHR && !isNaN(Number(maxHR)) ? { maxHR: Number(maxHR) } : {}),
      ...(averageHR && !isNaN(Number(averageHR)) ? { averageHR: Number(averageHR) } : {}),
      ...(activityType ? { activityType } : {}),
      ...(duration && !isNaN(Number(duration)) ? { duration: Number(duration) } : {}),
      ...(effectiveZone ? { zone: effectiveZone } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    addHeartRateEntry(entry);
    resetForm();
  }

  const sortedEntries = [...state.heartRateEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Heart Rate Tracker</h1>
        <p style={styles.pageSubtitle}>
          Log your heart rate data and monitor cardiovascular health over time.
        </p>

        {/* Heart Rate Zones Reference */}
        {!profile ? (
          <div style={styles.noProfileCard}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#9825;</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>
              Profile Not Set Up
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 420, margin: '0 auto' }}>
              Set up your profile first to see personalized heart rate zones based on your age.
              Your max heart rate is calculated as 220 minus your age.
            </p>
          </div>
        ) : (
          zones && (
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Your Heart Rate Zones
                <span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8', marginLeft: 12 }}>
                  Max HR: {userMaxHR} BPM
                </span>
              </h2>
              {zones.map((z) => (
                <div key={z.zone} style={styles.zoneBar(z.color)}>
                  <div style={styles.zoneBarLeft}>
                    <span style={styles.zoneBarName}>{z.name}</span>
                    <span style={styles.zoneBarDesc}>{z.description}</span>
                  </div>
                  <span style={styles.zoneBarBPM}>
                    {z.min} - {z.max} BPM
                  </span>
                </div>
              ))}
            </div>
          )
        )}

        {/* Log Entry Form */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Log Heart Rate Entry</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Resting HR (BPM) *</label>
                <input
                  type="number"
                  min={20}
                  max={220}
                  placeholder="e.g. 65"
                  value={restingHR}
                  onChange={(e) => setRestingHR(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Max HR During Activity</label>
                <input
                  type="number"
                  min={30}
                  max={250}
                  placeholder="e.g. 175"
                  value={maxHR}
                  onChange={(e) => setMaxHR(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Average HR</label>
                <input
                  type="number"
                  min={30}
                  max={250}
                  placeholder="e.g. 140"
                  value={averageHR}
                  onChange={(e) => setAverageHR(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  style={styles.select}
                >
                  <option value="">-- Select --</option>
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration (minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={600}
                  placeholder="e.g. 45"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Zone {autoZone ? '(auto-detected)' : '(manual)'}
                </label>
                {autoZone ? (
                  <div
                    style={{
                      ...styles.input,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#0f172a',
                    }}
                  >
                    <span style={styles.zoneBadge(autoZone)}>
                      {ZONE_LABELS[autoZone]}
                    </span>
                  </div>
                ) : (
                  <select
                    value={manualZone}
                    onChange={(e) => setManualZone(e.target.value as HeartRateZone | '')}
                    style={styles.select}
                  >
                    <option value="">-- Select Zone --</option>
                    <option value="zone1">Zone 1 - Recovery</option>
                    <option value="zone2">Zone 2 - Fat Burn</option>
                    <option value="zone3">Zone 3 - Aerobic</option>
                    <option value="zone4">Zone 4 - Anaerobic</option>
                    <option value="zone5">Zone 5 - VO2 Max</option>
                  </select>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this session..."
                style={styles.textarea}
              />
            </div>

            <button type="submit" style={styles.button}>
              Add Entry
            </button>
          </form>
        </div>

        {/* Entry History */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Entry History
            {sortedEntries.length > 0 && (
              <span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8', marginLeft: 12 }}>
                {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </h2>

          {sortedEntries.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No heart rate entries yet. Log your first entry above to start tracking.</p>
            </div>
          ) : (
            sortedEntries.map((entry) => (
              <div key={entry.id} style={styles.entryCard}>
                <div style={styles.entryHeader}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>
                      {formatDate(entry.date)}
                    </span>
                    {entry.activityType && (
                      <span
                        style={{
                          marginLeft: 12,
                          fontSize: 13,
                          color: '#94a3b8',
                          backgroundColor: '#334155',
                          padding: '2px 10px',
                          borderRadius: 12,
                        }}
                      >
                        {entry.activityType}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {entry.zone && (
                      <span style={styles.zoneBadge(entry.zone)}>
                        {ZONE_LABELS[entry.zone]}
                      </span>
                    )}
                    <button
                      type="button"
                      style={styles.deleteButton}
                      onClick={() => removeHeartRateEntry(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={styles.entryStats}>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Resting HR</span>
                    <span style={styles.statValue}>{entry.restingHR} BPM</span>
                  </div>
                  {entry.averageHR != null && (
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Average HR</span>
                      <span style={styles.statValue}>{entry.averageHR} BPM</span>
                    </div>
                  )}
                  {entry.maxHR != null && (
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Max HR</span>
                      <span style={styles.statValue}>{entry.maxHR} BPM</span>
                    </div>
                  )}
                  {entry.duration != null && (
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Duration</span>
                      <span style={styles.statValue}>{entry.duration} min</span>
                    </div>
                  )}
                </div>

                {entry.notes && <p style={styles.entryNotes}>{entry.notes}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
