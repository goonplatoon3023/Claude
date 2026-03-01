import React from 'react';
import { useStore } from '../store/useAppStore';
import type { UserProfile, BodyMeasurements, ActivityLevel } from '../types';
import { ACTIVITY_LEVEL_LABELS } from '../types';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE } from '../utils/calculations';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const colors = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#334155',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  inputBg: '#0f172a',
} as const;

const radius = {
  card: '12px',
  input: '8px',
} as const;

const font = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

// ---------------------------------------------------------------------------
// Shared style helpers
// ---------------------------------------------------------------------------
const baseInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: colors.inputBg,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.input,
  color: colors.textPrimary,
  fontFamily: font,
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  color: colors.textSecondary,
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: font,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.card,
  padding: '24px',
  marginBottom: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 20px 0',
  fontSize: '18px',
  fontWeight: 600,
  color: colors.textPrimary,
  fontFamily: font,
};

const fieldGroupStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
};

// ---------------------------------------------------------------------------
// Measurement field definitions
// ---------------------------------------------------------------------------
const MEASUREMENT_FIELDS: { key: keyof BodyMeasurements; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'neck', label: 'Neck' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'leftBicep', label: 'Left Bicep' },
  { key: 'rightBicep', label: 'Right Bicep' },
  { key: 'leftForearm', label: 'Left Forearm' },
  { key: 'rightForearm', label: 'Right Forearm' },
  { key: 'leftThigh', label: 'Left Thigh' },
  { key: 'rightThigh', label: 'Right Thigh' },
  { key: 'leftCalf', label: 'Left Calf' },
  { key: 'rightCalf', label: 'Right Calf' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ProfilePage: React.FC = () => {
  const { state, saveProfile } = useStore();
  const existing = state.profile;

  // ---- Form state ----------------------------------------------------------
  const [name, setName] = React.useState(existing?.name ?? '');
  const [age, setAge] = React.useState<number | ''>(existing?.age ?? '');
  const [gender, setGender] = React.useState<'male' | 'female' | 'other'>(existing?.gender ?? 'male');
  const [heightFeet, setHeightFeet] = React.useState<number | ''>(existing?.heightFeet ?? '');
  const [heightInches, setHeightInches] = React.useState<number | ''>(existing?.heightInches ?? '');
  const [weight, setWeight] = React.useState<number | ''>(existing?.weight ?? '');
  const [bodyFatPercentage, setBodyFatPercentage] = React.useState<number | ''>(existing?.bodyFatPercentage ?? '');
  const [activityLevel, setActivityLevel] = React.useState<ActivityLevel>(existing?.activityLevel ?? 'moderate');
  const [measurements, setMeasurements] = React.useState<BodyMeasurements>(existing?.measurements ?? {});
  const [measurementsOpen, setMeasurementsOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(!!existing);

  // ---- Derived calculations ------------------------------------------------
  const canCalculate = typeof weight === 'number' && typeof heightFeet === 'number' && typeof heightInches === 'number' && typeof age === 'number' && weight > 0 && (heightFeet > 0 || heightInches > 0);

  const bmi = canCalculate ? calculateBMI(weight as number, heightFeet as number, heightInches as number) : null;
  const bmiCategory = bmi !== null ? getBMICategory(bmi) : null;

  const tempProfile = canCalculate ? {
    weight: weight as number,
    heightFeet: heightFeet as number,
    heightInches: heightInches as number,
    age: age as number,
    gender,
    activityLevel,
  } as UserProfile : null;

  const bmr = tempProfile ? calculateBMR(tempProfile) : null;
  const tdee = tempProfile ? calculateTDEE(tempProfile) : null;

  // ---- Handlers ------------------------------------------------------------
  const handleMeasurementChange = (key: keyof BodyMeasurements, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : parseFloat(value),
    }));
  };

  const handleSave = () => {
    if (!name.trim() || !age || !heightFeet === undefined || !weight) return;

    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: existing?.id ?? crypto.randomUUID(),
      name: name.trim(),
      age: age as number,
      gender,
      heightFeet: (heightFeet || 0) as number,
      heightInches: (heightInches || 0) as number,
      weight: weight as number,
      bodyFatPercentage: bodyFatPercentage === '' ? undefined : (bodyFatPercentage as number),
      activityLevel,
      measurements,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveProfile(profile);
    setSaved(true);
  };

  // ---- Render --------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        fontFamily: font,
        color: colors.textPrimary,
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Page header */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 8px 0',
            fontFamily: font,
            color: colors.textPrimary,
          }}
        >
          Your Profile
        </h1>
        <p
          style={{
            margin: '0 0 32px 0',
            color: colors.textSecondary,
            fontSize: '15px',
            fontFamily: font,
          }}
        >
          Enter your body measurements and personal details to unlock personalized fitness insights.
        </p>

        {/* ---------------------------------------------------------------- */}
        {/* Basic Info */}
        {/* ---------------------------------------------------------------- */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Basic Info</h2>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={baseInputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            {/* Age */}
            <div>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="e.g. 28"
                min={1}
                max={120}
                style={baseInputStyle}
              />
            </div>

            {/* Height – feet */}
            <div>
              <label style={labelStyle}>Height (ft)</label>
              <input
                type="number"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="5"
                min={0}
                max={8}
                style={baseInputStyle}
              />
            </div>

            {/* Height – inches */}
            <div>
              <label style={labelStyle}>Height (in)</label>
              <input
                type="number"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="10"
                min={0}
                max={11}
                style={baseInputStyle}
              />
            </div>

            {/* Weight */}
            <div>
              <label style={labelStyle}>Weight (lbs)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="175"
                min={1}
                style={baseInputStyle}
              />
            </div>

            {/* Body Fat % */}
            <div>
              <label style={labelStyle}>Body Fat % (optional)</label>
              <input
                type="number"
                value={bodyFatPercentage}
                onChange={(e) => setBodyFatPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g. 15"
                min={1}
                max={60}
                step={0.1}
                style={baseInputStyle}
              />
            </div>
          </div>

          {/* Gender radio buttons */}
          <div style={{ marginTop: '20px' }}>
            <label style={labelStyle}>Gender</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <label
                  key={g}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: radius.input,
                    border: `1px solid ${gender === g ? colors.primary : colors.border}`,
                    backgroundColor: gender === g ? `${colors.primary}22` : 'transparent',
                    color: gender === g ? colors.primary : colors.textSecondary,
                    fontSize: '14px',
                    fontFamily: font,
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    style={{ display: 'none' }}
                  />
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${gender === g ? colors.primary : colors.border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {gender === g && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: colors.primary,
                        }}
                      />
                    )}
                  </span>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Activity Level */}
        {/* ---------------------------------------------------------------- */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Activity Level</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(Object.keys(ACTIVITY_LEVEL_LABELS) as ActivityLevel[]).map((level) => (
              <label
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: radius.input,
                  border: `1px solid ${activityLevel === level ? colors.primary : colors.border}`,
                  backgroundColor: activityLevel === level ? `${colors.primary}22` : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="activityLevel"
                  value={level}
                  checked={activityLevel === level}
                  onChange={() => setActivityLevel(level)}
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${activityLevel === level ? colors.primary : colors.border}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {activityLevel === level && (
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: colors.primary,
                      }}
                    />
                  )}
                </span>
                <span
                  style={{
                    color: activityLevel === level ? colors.textPrimary : colors.textSecondary,
                    fontSize: '14px',
                    fontWeight: activityLevel === level ? 600 : 400,
                    fontFamily: font,
                  }}
                >
                  {ACTIVITY_LEVEL_LABELS[level]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Body Measurements (collapsible) */}
        {/* ---------------------------------------------------------------- */}
        <div style={cardStyle}>
          <button
            type="button"
            onClick={() => setMeasurementsOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: 0,
              margin: 0,
            }}
          >
            <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Body Measurements</h2>
            <span
              style={{
                color: colors.textSecondary,
                fontSize: '20px',
                fontFamily: font,
                transition: 'transform 0.2s ease',
                transform: measurementsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'inline-block',
              }}
            >
              &#9660;
            </span>
          </button>
          <p
            style={{
              margin: '8px 0 0 0',
              color: colors.textSecondary,
              fontSize: '13px',
              fontFamily: font,
            }}
          >
            All measurements in inches. These fields are optional.
          </p>

          {measurementsOpen && (
            <div style={{ ...fieldGroupStyle, marginTop: '20px' }}>
              {MEASUREMENT_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label style={labelStyle}>{label} (in)</label>
                  <input
                    type="number"
                    value={measurements[key] ?? ''}
                    onChange={(e) => handleMeasurementChange(key, e.target.value)}
                    placeholder="--"
                    min={0}
                    step={0.25}
                    style={baseInputStyle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Save button */}
        {/* ---------------------------------------------------------------- */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || !age || !weight}
          style={{
            width: '100%',
            padding: '14px 0',
            backgroundColor: !name.trim() || !age || !weight ? colors.border : colors.primary,
            color: !name.trim() || !age || !weight ? colors.textSecondary : '#fff',
            border: 'none',
            borderRadius: radius.input,
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: font,
            cursor: !name.trim() || !age || !weight ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease',
            marginBottom: '32px',
          }}
        >
          Save Profile
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* Calculated Stats */}
        {/* ---------------------------------------------------------------- */}
        {saved && canCalculate && bmi !== null && bmr !== null && tdee !== null && bmiCategory !== null && (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Your Stats</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {/* BMI */}
              <div
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: radius.card,
                  padding: '20px',
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: '0 0 4px 0',
                    color: colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: font,
                  }}
                >
                  BMI
                </p>
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.textPrimary,
                    fontFamily: font,
                  }}
                >
                  {bmi.toFixed(1)}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: font,
                    color: '#fff',
                    backgroundColor: bmiCategory.color,
                  }}
                >
                  {bmiCategory.label}
                </span>
              </div>

              {/* BMR */}
              <div
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: radius.card,
                  padding: '20px',
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: '0 0 4px 0',
                    color: colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: font,
                  }}
                >
                  BMR
                </p>
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.textPrimary,
                    fontFamily: font,
                  }}
                >
                  {Math.round(bmr).toLocaleString()}
                </p>
                <span
                  style={{
                    color: colors.textSecondary,
                    fontSize: '13px',
                    fontFamily: font,
                  }}
                >
                  calories / day
                </span>
              </div>

              {/* TDEE */}
              <div
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: radius.card,
                  padding: '20px',
                  border: `1px solid ${colors.border}`,
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: '0 0 4px 0',
                    color: colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: font,
                  }}
                >
                  TDEE
                </p>
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '32px',
                    fontWeight: 700,
                    color: colors.primary,
                    fontFamily: font,
                  }}
                >
                  {Math.round(tdee).toLocaleString()}
                </p>
                <span
                  style={{
                    color: colors.textSecondary,
                    fontSize: '13px',
                    fontFamily: font,
                  }}
                >
                  calories / day
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
