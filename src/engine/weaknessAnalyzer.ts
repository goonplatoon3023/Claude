import type {
  AnswerRecord,
  Topic,
  QuestionType,
  Difficulty,
  TopicStats,
  PhrasingWeakness,
  TermWeakness,
  WeaknessProfile,
} from '../types';
import { TOPIC_LABELS } from '../types';

const PHRASING_FEATURES = [
  { key: 'hasNegation', label: 'Negation ("NOT", "except")' },
  { key: 'hasDoubleNegation', label: 'Double Negation ("not uncommon")' },
  { key: 'hasAbsoluteLanguage', label: 'Absolute Language ("always", "never")' },
  { key: 'hasQualifiedLanguage', label: 'Qualified Language ("sometimes", "usually")' },
] as const;

const COMPLEXITY_FEATURES = [
  { key: 'compound', label: 'Compound Sentences' },
  { key: 'complex', label: 'Complex Sentences' },
] as const;

const VOCAB_FEATURES = [
  { key: 'intermediate', label: 'Intermediate Vocabulary' },
  { key: 'advanced', label: 'Advanced Vocabulary' },
] as const;

function emptyTypeStats(): Record<QuestionType, { attempted: number; correct: number; accuracy: number }> {
  const types: QuestionType[] = ['multiple-choice', 'true-false', 'fill-in-the-blank', 'matching', 'short-answer'];
  const result = {} as Record<QuestionType, { attempted: number; correct: number; accuracy: number }>;
  for (const t of types) {
    result[t] = { attempted: 0, correct: 0, accuracy: 0 };
  }
  return result;
}

function emptyDifficultyStats(): Record<Difficulty, { attempted: number; correct: number; accuracy: number }> {
  const diffs: Difficulty[] = ['easy', 'medium', 'hard'];
  const result = {} as Record<Difficulty, { attempted: number; correct: number; accuracy: number }>;
  for (const d of diffs) {
    result[d] = { attempted: 0, correct: 0, accuracy: 0 };
  }
  return result;
}

export function analyzeWeaknesses(records: AnswerRecord[]): WeaknessProfile {
  if (records.length === 0) {
    return {
      weakTopics: [],
      weakQuestionTypes: [],
      phrasingWeaknesses: [],
      termWeaknesses: [],
      overallAccuracy: 0,
      totalAnswered: 0,
    };
  }

  const totalCorrect = records.filter(r => r.isCorrect).length;
  const overallAccuracy = totalCorrect / records.length;

  // ─── Topic Stats ────────────────────────────────────────
  const topicMap = new Map<Topic, AnswerRecord[]>();
  for (const r of records) {
    const list = topicMap.get(r.question.topic) || [];
    list.push(r);
    topicMap.set(r.question.topic, list);
  }

  const topicStats: TopicStats[] = [];
  for (const [topic, recs] of topicMap) {
    const correct = recs.filter(r => r.isCorrect).length;
    const byType = emptyTypeStats();
    const byDifficulty = emptyDifficultyStats();

    for (const r of recs) {
      byType[r.question.type].attempted++;
      if (r.isCorrect) byType[r.question.type].correct++;

      byDifficulty[r.question.difficulty].attempted++;
      if (r.isCorrect) byDifficulty[r.question.difficulty].correct++;
    }

    // Calculate accuracies
    for (const t of Object.keys(byType) as QuestionType[]) {
      byType[t].accuracy = byType[t].attempted > 0 ? byType[t].correct / byType[t].attempted : 0;
    }
    for (const d of Object.keys(byDifficulty) as Difficulty[]) {
      byDifficulty[d].accuracy = byDifficulty[d].attempted > 0 ? byDifficulty[d].correct / byDifficulty[d].attempted : 0;
    }

    topicStats.push({
      topic,
      totalAttempted: recs.length,
      totalCorrect: correct,
      accuracy: correct / recs.length,
      byType,
      byDifficulty,
    });
  }

  // Sort worst topics first
  const weakTopics = topicStats
    .filter(t => t.totalAttempted >= 1)
    .sort((a, b) => a.accuracy - b.accuracy);

  // ─── Question Type Stats ────────────────────────────────
  const typeMap = new Map<QuestionType, AnswerRecord[]>();
  for (const r of records) {
    const list = typeMap.get(r.question.type) || [];
    list.push(r);
    typeMap.set(r.question.type, list);
  }

  const weakQuestionTypes = Array.from(typeMap.entries())
    .map(([type, recs]) => ({
      type,
      attempted: recs.length,
      accuracy: recs.filter(r => r.isCorrect).length / recs.length,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // ─── Phrasing Weaknesses ────────────────────────────────
  const phrasingWeaknesses: PhrasingWeakness[] = [];

  // Boolean features
  for (const { key, label } of PHRASING_FEATURES) {
    const exposed = records.filter(r => (r.question.phrasingFeatures as unknown as Record<string, unknown>)[key] === true);
    if (exposed.length >= 2) {
      const correct = exposed.filter(r => r.isCorrect).length;
      const accuracy = correct / exposed.length;
      phrasingWeaknesses.push({
        feature: key,
        label,
        totalExposed: exposed.length,
        totalCorrect: correct,
        accuracy,
        delta: accuracy - overallAccuracy,
      });
    }
  }

  // Sentence complexity
  for (const { key, label } of COMPLEXITY_FEATURES) {
    const exposed = records.filter(r => r.question.phrasingFeatures.sentenceComplexity === key);
    if (exposed.length >= 2) {
      const correct = exposed.filter(r => r.isCorrect).length;
      const accuracy = correct / exposed.length;
      phrasingWeaknesses.push({
        feature: `complexity:${key}`,
        label,
        totalExposed: exposed.length,
        totalCorrect: correct,
        accuracy,
        delta: accuracy - overallAccuracy,
      });
    }
  }

  // Vocabulary level
  for (const { key, label } of VOCAB_FEATURES) {
    const exposed = records.filter(r => r.question.phrasingFeatures.vocabularyLevel === key);
    if (exposed.length >= 2) {
      const correct = exposed.filter(r => r.isCorrect).length;
      const accuracy = correct / exposed.length;
      phrasingWeaknesses.push({
        feature: `vocab:${key}`,
        label,
        totalExposed: exposed.length,
        totalCorrect: correct,
        accuracy,
        delta: accuracy - overallAccuracy,
      });
    }
  }

  // Sort by delta (most negative = biggest weakness)
  phrasingWeaknesses.sort((a, b) => a.delta - b.delta);

  // ─── Term Weaknesses ────────────────────────────────────
  const termMap = new Map<string, { exposed: number; correct: number }>();
  for (const r of records) {
    for (const term of r.question.phrasingFeatures.keyTerms) {
      const normalized = term.toLowerCase();
      const entry = termMap.get(normalized) || { exposed: 0, correct: 0 };
      entry.exposed++;
      if (r.isCorrect) entry.correct++;
      termMap.set(normalized, entry);
    }
  }

  const termWeaknesses: TermWeakness[] = Array.from(termMap.entries())
    .filter(([, v]) => v.exposed >= 2)
    .map(([term, v]) => ({
      term,
      totalExposed: v.exposed,
      totalCorrect: v.correct,
      accuracy: v.correct / v.exposed,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    weakTopics,
    weakQuestionTypes,
    phrasingWeaknesses,
    termWeaknesses,
    overallAccuracy,
    totalAnswered: records.length,
  };
}

// Generate a human-readable weakness summary
export function getWeaknessSummary(profile: WeaknessProfile): string[] {
  const summaries: string[] = [];

  if (profile.totalAnswered === 0) {
    return ['Start answering questions to see your weakness analysis.'];
  }

  // Weak topics
  const weakTopics = profile.weakTopics.filter(t => t.accuracy < overallThreshold(profile.overallAccuracy));
  for (const t of weakTopics.slice(0, 3)) {
    summaries.push(
      `You're scoring ${pct(t.accuracy)} in ${TOPIC_LABELS[t.topic]} (below your ${pct(profile.overallAccuracy)} average).`
    );
  }

  // Phrasing weaknesses
  const sigPhrasing = profile.phrasingWeaknesses.filter(p => p.delta < -0.1);
  for (const p of sigPhrasing.slice(0, 3)) {
    summaries.push(
      `Questions with ${p.label.toLowerCase()} drop your accuracy by ${pct(Math.abs(p.delta))}.`
    );
  }

  // Term weaknesses
  const weakTerms = profile.termWeaknesses.filter(t => t.accuracy < profile.overallAccuracy - 0.15);
  for (const t of weakTerms.slice(0, 3)) {
    summaries.push(
      `Questions involving "${t.term}" are a weak spot (${pct(t.accuracy)} accuracy).`
    );
  }

  if (summaries.length === 0) {
    summaries.push('Good job! No significant weaknesses detected yet. Keep practicing.');
  }

  return summaries;
}

function overallThreshold(overall: number): number {
  return Math.max(overall - 0.1, 0);
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
