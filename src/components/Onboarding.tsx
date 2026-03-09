import { useState } from 'react';
import type { UserPreferences, Category, PublicationType } from '../types';
import { CATEGORY_OPTIONS, PUBLICATION_OPTIONS } from '../types';
import './Onboarding.css';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicationTypes, setPublicationTypes] = useState<PublicationType[]>([]);
  const [specificInterests, setSpecificInterests] = useState('');

  const totalSteps = 3;

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

  function handleFinish() {
    onComplete({
      categories: categories.length > 0 ? categories : CATEGORY_OPTIONS.map((c) => c.value),
      publicationTypes: publicationTypes.length > 0 ? publicationTypes : PUBLICATION_OPTIONS.map((p) => p.value),
      specificInterests,
      onboardingComplete: true,
    });
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i + 1 <= step ? 'active' : ''}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="onboarding-step">
            <div className="onboarding-icon">📰</div>
            <h1 className="onboarding-title">Welcome to ReadWise</h1>
            <p className="onboarding-subtitle">
              Your AI-powered daily reading feed. We'll find 10–15 articles you'll
              actually want to read, every day. Let's set up your preferences.
            </p>
            <h2 className="step-heading">What topics interest you?</h2>
            <p className="step-hint">Select as many as you like (or skip to get everything)</p>
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
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2 className="step-heading">What kind of publications do you prefer?</h2>
            <p className="step-hint">We'll mix and match based on your choices</p>
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
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2 className="step-heading">Any specific interests?</h2>
            <p className="step-hint">
              Tell us more about what you love — topics, people, themes, regions.
              The more detail, the better your feed.
            </p>
            <textarea
              className="interests-input"
              value={specificInterests}
              onChange={(e) => setSpecificInterests(e.target.value)}
              placeholder="e.g. AI ethics, climate policy, Formula 1, behavioral economics, Renaissance art, the Middle East, long-form narrative journalism..."
              rows={5}
            />
            <p className="interests-hint">
              This is optional — you can always update it in Settings.
            </p>
          </div>
        )}

        <div className="onboarding-actions">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
          <div className="actions-right">
            {step < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep((s) => s + 1)}
              >
                {categories.length === 0 && step === 1 ? 'Skip & Continue' : 'Continue'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinish}
              >
                Build My Feed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
