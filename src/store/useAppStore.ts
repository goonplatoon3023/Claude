import { useState, useCallback, useEffect } from 'react';
import type { AnswerRecord, WeaknessProfile, StudyModule } from '../types';
import { analyzeWeaknesses } from '../engine/weaknessAnalyzer';
import { generateStudyModules } from '../engine/questionSelector';

const STORAGE_KEY = 'adaptive-tutor-records';

function loadRecords(): AnswerRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt data — start fresh
  }
  return [];
}

function saveRecords(records: AnswerRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useAppStore() {
  const [records, setRecords] = useState<AnswerRecord[]>(loadRecords);
  const [profile, setProfile] = useState<WeaknessProfile>(() => analyzeWeaknesses(loadRecords()));
  const [modules, setModules] = useState<StudyModule[]>([]);

  // Persist and re-analyze whenever records change
  useEffect(() => {
    saveRecords(records);
    const newProfile = analyzeWeaknesses(records);
    setProfile(newProfile);
  }, [records]);

  // Regenerate modules when profile changes
  useEffect(() => {
    const answeredIds = new Set(records.map(r => r.questionId));
    setModules(generateStudyModules(profile, answeredIds));
  }, [profile, records]);

  const addRecord = useCallback((record: AnswerRecord) => {
    setRecords(prev => [...prev, record]);
  }, []);

  const addRecords = useCallback((newRecords: AnswerRecord[]) => {
    setRecords(prev => [...prev, ...newRecords]);
  }, []);

  const getAnsweredIds = useCallback((): Set<string> => {
    return new Set(records.map(r => r.questionId));
  }, [records]);

  const clearHistory = useCallback(() => {
    setRecords([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getRecentRecords = useCallback((count: number): AnswerRecord[] => {
    return records.slice(-count);
  }, [records]);

  return {
    records,
    profile,
    modules,
    addRecord,
    addRecords,
    getAnsweredIds,
    clearHistory,
    getRecentRecords,
  };
}
