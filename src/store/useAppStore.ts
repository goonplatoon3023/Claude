import React, { useState, useEffect, useCallback, useContext } from 'react';
import type {
  AppState,
  UserProfile,
  FitnessGoals,
  CurrentLifts,
  HeartRateEntry,
  MeasurementHistory,
  LiftEntry,
} from '../types';
import { generateWorkoutPlan } from '../engine/workoutGenerator';
import { generateNutritionPlan } from '../engine/nutritionGenerator';

const STORAGE_KEY = 'fitforge-data';

const defaultState: AppState = {
  profile: null,
  goals: null,
  currentLifts: {},
  workoutPlan: null,
  nutritionPlan: null,
  heartRateEntries: [],
  measurementHistory: [],
};

interface StoreActions {
  // Profile
  saveProfile: (profile: UserProfile) => void;

  // Goals
  saveGoals: (goals: FitnessGoals) => void;

  // Lifts
  saveLift: (lift: LiftEntry) => void;
  removeLift: (exerciseId: string) => void;

  // Plans - auto-generate when profile + goals exist
  generatePlans: () => void;

  // Heart Rate
  addHeartRateEntry: (entry: HeartRateEntry) => void;
  removeHeartRateEntry: (id: string) => void;

  // Measurement History
  addMeasurement: (entry: MeasurementHistory) => void;

  // Reset
  resetAll: () => void;
}

type StoreContextValue = { state: AppState } & StoreActions;

const StoreContext = React.createContext<StoreContextValue | null>(null);

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return { ...defaultState, ...parsed };
    }
  } catch {
    // corrupt data - start fresh
  }
  return defaultState;
}

function persistState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    persistState(state);
  }, [state]);

  const regeneratePlans = useCallback(
    (profile: UserProfile | null, goals: FitnessGoals | null, lifts: CurrentLifts) => {
      if (profile && goals) {
        const workoutPlan = generateWorkoutPlan(profile, goals, lifts);
        const nutritionPlan = generateNutritionPlan(profile, goals);
        return { workoutPlan, nutritionPlan };
      }
      return { workoutPlan: null, nutritionPlan: null };
    },
    [],
  );

  const saveProfile = useCallback(
    (profile: UserProfile) => {
      setState((prev) => {
        const plans = regeneratePlans(profile, prev.goals, prev.currentLifts);
        return { ...prev, profile, ...plans };
      });
    },
    [regeneratePlans],
  );

  const saveGoals = useCallback(
    (goals: FitnessGoals) => {
      setState((prev) => {
        const plans = regeneratePlans(prev.profile, goals, prev.currentLifts);
        return { ...prev, goals, ...plans };
      });
    },
    [regeneratePlans],
  );

  const saveLift = useCallback((lift: LiftEntry) => {
    setState((prev) => ({
      ...prev,
      currentLifts: {
        ...prev.currentLifts,
        [lift.exerciseId]: lift,
      },
    }));
  }, []);

  const removeLift = useCallback((exerciseId: string) => {
    setState((prev) => {
      const { [exerciseId]: _, ...rest } = prev.currentLifts;
      return { ...prev, currentLifts: rest };
    });
  }, []);

  const generatePlans = useCallback(() => {
    setState((prev) => {
      const plans = regeneratePlans(prev.profile, prev.goals, prev.currentLifts);
      return { ...prev, ...plans };
    });
  }, [regeneratePlans]);

  const addHeartRateEntry = useCallback((entry: HeartRateEntry) => {
    setState((prev) => ({
      ...prev,
      heartRateEntries: [...prev.heartRateEntries, entry],
    }));
  }, []);

  const removeHeartRateEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      heartRateEntries: prev.heartRateEntries.filter((e) => e.id !== id),
    }));
  }, []);

  const addMeasurement = useCallback((entry: MeasurementHistory) => {
    setState((prev) => ({
      ...prev,
      measurementHistory: [...prev.measurementHistory, entry],
    }));
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  }, []);

  const value: StoreContextValue = {
    state,
    saveProfile,
    saveGoals,
    saveLift,
    removeLift,
    generatePlans,
    addHeartRateEntry,
    removeHeartRateEntry,
    addMeasurement,
    resetAll,
  };

  return React.createElement(StoreContext.Provider, { value }, children);
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
