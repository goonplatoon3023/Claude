import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { Feed } from './components/Feed';
import { SavedArticles } from './components/SavedArticles';
import { Settings } from './components/Settings';
import type { UserPreferences } from './types';
import './App.css';

export default function App() {
  const store = useAppStore();

  function handleOnboardingComplete(prefs: UserPreferences) {
    store.setPreferences(prefs);
  }

  function handleSettingsSave(prefs: UserPreferences) {
    store.setPreferences(prefs);
  }

  return (
    <BrowserRouter>
      {!store.preferences.onboardingComplete && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      <Layout savedCount={store.savedArticles.length}>
        <Routes>
          <Route
            path="/"
            element={
              <Feed
                feed={store.feed}
                preferences={store.preferences}
                ratings={store.ratings}
                savedIds={store.savedIds}
                onRate={store.rateArticle}
                onSave={store.saveArticle}
                onUnsave={store.unsaveArticle}
                getRating={store.getRating}
                onFeedGenerated={store.setFeed}
              />
            }
          />
          <Route
            path="/saved"
            element={
              <SavedArticles
                savedArticles={store.savedArticles}
                onUnsave={store.unsaveArticle}
                getRating={store.getRating}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <Settings
                preferences={store.preferences}
                ratingsCount={store.ratings.length}
                savedCount={store.savedArticles.length}
                onSave={handleSettingsSave}
                onReset={store.resetAll}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
