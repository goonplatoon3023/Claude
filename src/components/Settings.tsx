import { useState } from 'react';
import type { UserPreferences, Category, PublicationType } from '../types';
import { CATEGORY_OPTIONS, PUBLICATION_OPTIONS } from '../types';
import './Settings.css';

interface SettingsProps {
  preferences: UserPreferences;
  ratingsCount: number;
  savedCount: number;
  onSave: (prefs: UserPreferences) => void;
  onReset: () => void;
}

export function Settings({ preferences, ratingsCount, savedCount, onSave, onReset }: SettingsProps) {
  const [categories, setCategories] = useState<Category[]>(preferences.categories);
  const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>(preferences.publicationTypes);
  const [specificInterests, setSpecificInterests] = useState(preferences.specificInterests);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function toggleCategory(cat: Category) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function togglePub(pub: PublicationType) {
    setPublicationTypes((prev) =>
      prev.includes(pub) ? prev.filter((p) => p !== pub) : [...prev, pub]
    );
  }

  function handleSave() {
    onSave({
      ...preferences,
      categories,
      publicationTypes,
      specificInterests,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    onReset();
    setShowResetConfirm(false);
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">
          Update your preferences. Changes will take effect on your next generated feed.
        </p>
      </div>

      {/* Stats */}
      <div className="settings-stats">
        <div className="stat-card">
          <span className="stat-card-num">{ratingsCount}</span>
          <span className="stat-card-label">Articles rated</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-num">{savedCount}</span>
          <span className="stat-card-label">Articles saved</span>
        </div>
      </div>

      {/* Topics */}
      <section className="settings-section">
        <h2 className="section-title">Topics</h2>
        <p className="section-desc">
          Select topics to include in your feed. Leave all unselected to get everything.
        </p>
        <div className="tag-grid">
          {CATEGORY_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              className={`tag-btn ${categories.includes(value) ? 'selected' : ''}`}
              onClick={() => toggleCategory(value)}
            >
              <span className="tag-emoji">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Publication types */}
      <section className="settings-section">
        <h2 className="section-title">Publication Types</h2>
        <p className="section-desc">
          Choose which kinds of publications to include. Leave unselected for all types.
        </p>
        <div className="pub-grid">
          {PUBLICATION_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              className={`pub-btn ${publicationTypes.includes(value) ? 'selected' : ''}`}
              onClick={() => togglePub(value)}
            >
              <span className="pub-label">{label}</span>
              <span className="pub-desc">{description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Specific interests */}
      <section className="settings-section">
        <h2 className="section-title">Specific Interests</h2>
        <p className="section-desc">
          Describe topics, people, regions, or themes you especially want covered.
        </p>
        <textarea
          className="interests-input"
          value={specificInterests}
          onChange={(e) => setSpecificInterests(e.target.value)}
          placeholder="e.g. AI regulation, European politics, NBA, behavioral economics, climate tech startups..."
          rows={4}
        />
      </section>

      {/* Actions */}
      <div className="settings-actions">
        <button
          type="button"
          className={`btn btn-primary ${saved ? 'btn-saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ Saved' : 'Save Preferences'}
        </button>
      </div>

      {/* Danger zone */}
      <section className="settings-section danger-zone">
        <h2 className="section-title danger-title">Danger Zone</h2>
        <p className="section-desc">
          Reset all data including your preferences, rating history, and saved articles.
          This cannot be undone.
        </p>
        {!showResetConfirm ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset All Data
          </button>
        ) : (
          <div className="reset-confirm">
            <p className="reset-confirm-text">
              Are you sure? This will delete all {ratingsCount} ratings, {savedCount} saved articles, and your preferences.
            </p>
            <div className="reset-confirm-btns">
              <button type="button" className="btn btn-danger" onClick={handleReset}>
                Yes, Reset Everything
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
