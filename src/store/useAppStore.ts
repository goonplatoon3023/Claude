import { useState, useCallback, useEffect } from 'react';
import type {
  UserPreferences,
  Article,
  RatingItem,
  SavedArticle,
  DailyFeed,
} from '../types';

const STORAGE_KEYS = {
  preferences: 'readwise-preferences',
  ratings: 'readwise-ratings',
  saved: 'readwise-saved',
  feed: 'readwise-feed',
} as const;

const DEFAULT_PREFERENCES: UserPreferences = {
  categories: [],
  publicationTypes: [],
  specificInterests: '',
  onboardingComplete: false,
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // corrupt — ignore
  }
  return fallback;
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useAppStore() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    load(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES)
  );
  const [ratings, setRatings] = useState<RatingItem[]>(() =>
    load(STORAGE_KEYS.ratings, [])
  );
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>(() =>
    load(STORAGE_KEYS.saved, [])
  );
  const [feed, setFeedState] = useState<DailyFeed | null>(() =>
    load(STORAGE_KEYS.feed, null)
  );

  // Derived sets for O(1) lookup
  const ratedIds = new Set(ratings.map((r) => r.article.id));
  const savedIds = new Set(savedArticles.map((s) => s.article.id));

  // Persist on change
  useEffect(() => { save(STORAGE_KEYS.preferences, preferences); }, [preferences]);
  useEffect(() => { save(STORAGE_KEYS.ratings, ratings.slice(-200)); }, [ratings]);
  useEffect(() => { save(STORAGE_KEYS.saved, savedArticles); }, [savedArticles]);
  useEffect(() => { save(STORAGE_KEYS.feed, feed); }, [feed]);

  const setPreferences = useCallback((prefs: UserPreferences) => {
    setPreferencesState(prefs);
  }, []);

  const rateArticle = useCallback((article: Article, rating: 'up' | 'down') => {
    setRatings((prev) => {
      const filtered = prev.filter((r) => r.article.id !== article.id);
      return [...filtered, { article, rating, ratedAt: new Date().toISOString() }];
    });
  }, []);

  const removeRating = useCallback((articleId: string) => {
    setRatings((prev) => prev.filter((r) => r.article.id !== articleId));
  }, []);

  const getRating = useCallback((articleId: string): 'up' | 'down' | null => {
    const item = ratings.find((r) => r.article.id === articleId);
    return item?.rating ?? null;
  }, [ratings]);

  const saveArticle = useCallback((article: Article) => {
    setSavedArticles((prev) => {
      if (prev.some((s) => s.article.id === article.id)) return prev;
      return [...prev, { article, savedAt: new Date().toISOString() }];
    });
  }, []);

  const unsaveArticle = useCallback((articleId: string) => {
    setSavedArticles((prev) => prev.filter((s) => s.article.id !== articleId));
  }, []);

  const isSaved = useCallback((articleId: string): boolean => {
    return savedIds.has(articleId);
  }, [savedIds]);

  const setFeed = useCallback((newFeed: DailyFeed) => {
    setFeedState(newFeed);
  }, []);

  const clearFeed = useCallback(() => {
    setFeedState(null);
    localStorage.removeItem(STORAGE_KEYS.feed);
  }, []);

  const resetAll = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    setRatings([]);
    setSavedArticles([]);
    setFeedState(null);
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }, []);

  return {
    preferences,
    ratings,
    savedArticles,
    feed,
    ratedIds,
    savedIds,
    setPreferences,
    rateArticle,
    removeRating,
    getRating,
    saveArticle,
    unsaveArticle,
    isSaved,
    setFeed,
    clearFeed,
    resetAll,
  };
}
