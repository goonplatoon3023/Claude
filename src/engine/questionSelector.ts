import type { Question, WeaknessProfile, StudyModule, Topic, QuestionType } from '../types';
import { TOPIC_LABELS } from '../types';
import { questionBank } from '../data/questionBank';
import { v4 as uuid } from 'uuid';

/**
 * Adaptive question selector that targets user weaknesses.
 * Priority order:
 * 1. Questions from weak subjects
 * 2. Questions with phrasing features the user struggles with
 * 3. Questions containing legal terms the user struggles with
 * 4. Questions of types the user struggles with
 * 5. Higher difficulty questions in weak areas
 */

interface ScoredQuestion {
  question: Question;
  score: number;
}

export function scoreQuestion(question: Question, profile: WeaknessProfile, answeredIds: Set<string>): number {
  // Strongly deprioritize already-answered questions
  if (answeredIds.has(question.id)) return -100;

  let score = 0;

  // Weak topic bonus (up to +40)
  const topicStat = profile.weakTopics.find(t => t.topic === question.topic);
  if (topicStat) {
    const topicDeficit = profile.overallAccuracy - topicStat.accuracy;
    score += Math.max(0, topicDeficit) * 40;
  }

  // Weak question type bonus (up to +20)
  const typeStat = profile.weakQuestionTypes.find(t => t.type === question.type);
  if (typeStat) {
    const typeDeficit = profile.overallAccuracy - typeStat.accuracy;
    score += Math.max(0, typeDeficit) * 20;
  }

  // Phrasing weakness bonus (up to +30)
  const pf = question.phrasingFeatures;
  for (const pw of profile.phrasingWeaknesses) {
    if (pw.delta >= 0) continue; // Not a weakness
    const magnitude = Math.abs(pw.delta);

    if (pw.feature === 'hasNegation' && pf.hasNegation) score += magnitude * 30;
    if (pw.feature === 'hasDoubleNegation' && pf.hasDoubleNegation) score += magnitude * 30;
    if (pw.feature === 'hasAbsoluteLanguage' && pf.hasAbsoluteLanguage) score += magnitude * 30;
    if (pw.feature === 'hasQualifiedLanguage' && pf.hasQualifiedLanguage) score += magnitude * 30;
    if (pw.feature === `complexity:${pf.sentenceComplexity}`) score += magnitude * 30;
    if (pw.feature === `vocab:${pf.vocabularyLevel}`) score += magnitude * 30;
  }

  // Term weakness bonus (up to +25)
  for (const tw of profile.termWeaknesses) {
    if (tw.accuracy >= profile.overallAccuracy) continue;
    const termMatch = pf.keyTerms.some(kt => kt.toLowerCase() === tw.term);
    if (termMatch) {
      score += (profile.overallAccuracy - tw.accuracy) * 25;
    }
  }

  // Difficulty bonus: harder questions get slight boost in weak areas
  if (score > 0) {
    if (question.difficulty === 'hard') score += 5;
    if (question.difficulty === 'medium') score += 2;
  }

  return score;
}

export function selectAdaptiveQuestions(
  profile: WeaknessProfile,
  answeredIds: Set<string>,
  count: number,
  topicFilter?: Topic,
  typeFilter?: QuestionType,
): Question[] {
  let pool = [...questionBank];

  if (topicFilter) pool = pool.filter(q => q.topic === topicFilter);
  if (typeFilter) pool = pool.filter(q => q.type === typeFilter);

  const scored: ScoredQuestion[] = pool.map(q => ({
    question: q,
    score: scoreQuestion(q, profile, answeredIds),
  }));

  // Sort by score descending, then shuffle among equal scores
  scored.sort((a, b) => {
    const diff = b.score - a.score;
    if (Math.abs(diff) < 0.01) return Math.random() - 0.5;
    return diff;
  });

  return scored.slice(0, count).map(s => s.question);
}

/**
 * Generate guided study modules based on weakness profile.
 * Each module targets a specific weakness area with 5-8 questions.
 */
export function generateStudyModules(profile: WeaknessProfile, answeredIds: Set<string>): StudyModule[] {
  const modules: StudyModule[] = [];

  if (profile.totalAnswered < 3) {
    // Not enough data—generate a diagnostic module
    const diagnosticQuestions = selectDiagnosticQuestions(11);
    modules.push({
      id: uuid(),
      title: 'Diagnostic Assessment',
      description: 'Answer these questions across different bar exam subjects to help us identify your strengths and weaknesses.',
      targetWeaknesses: ['diagnostic'],
      questions: diagnosticQuestions,
      completed: false,
    });
    return modules;
  }

  // Module for each weak subject (accuracy below overall - 0.05)
  const weakTopics = profile.weakTopics.filter(t => t.accuracy < profile.overallAccuracy - 0.05 && t.totalAttempted >= 2);
  for (const topicStat of weakTopics.slice(0, 3)) {
    const questions = selectAdaptiveQuestions(profile, answeredIds, 6, topicStat.topic);
    if (questions.length >= 3) {
      modules.push({
        id: uuid(),
        title: `Strengthen: ${TOPIC_LABELS[topicStat.topic]}`,
        description: `You're at ${Math.round(topicStat.accuracy * 100)}% in ${TOPIC_LABELS[topicStat.topic]}. These questions target your specific gaps.`,
        targetWeaknesses: [topicStat.topic],
        questions,
        completed: false,
      });
    }
  }

  // Module for phrasing weaknesses
  const sigPhrasing = profile.phrasingWeaknesses.filter(p => p.delta < -0.1);
  if (sigPhrasing.length > 0) {
    const phrasingLabels = sigPhrasing.slice(0, 3).map(p => p.label);
    const phrasingQuestions = questionBank.filter(q => {
      if (answeredIds.has(q.id)) return false;
      return sigPhrasing.some(p => {
        if (p.feature === 'hasNegation') return q.phrasingFeatures.hasNegation;
        if (p.feature === 'hasDoubleNegation') return q.phrasingFeatures.hasDoubleNegation;
        if (p.feature === 'hasAbsoluteLanguage') return q.phrasingFeatures.hasAbsoluteLanguage;
        if (p.feature === 'hasQualifiedLanguage') return q.phrasingFeatures.hasQualifiedLanguage;
        if (p.feature.startsWith('complexity:')) return q.phrasingFeatures.sentenceComplexity === p.feature.split(':')[1];
        if (p.feature.startsWith('vocab:')) return q.phrasingFeatures.vocabularyLevel === p.feature.split(':')[1];
        return false;
      });
    });

    if (phrasingQuestions.length >= 3) {
      modules.push({
        id: uuid(),
        title: 'Tricky Phrasing Practice',
        description: `You tend to stumble on: ${phrasingLabels.join(', ').toLowerCase()}. Let's practice.`,
        targetWeaknesses: sigPhrasing.map(p => p.feature),
        questions: phrasingQuestions.slice(0, 8),
        completed: false,
      });
    }
  }

  // Mixed weakness module
  const mixedQuestions = selectAdaptiveQuestions(profile, answeredIds, 8);
  if (mixedQuestions.length >= 3) {
    modules.push({
      id: uuid(),
      title: 'Targeted Review',
      description: 'A mix of questions targeting your weakest areas across all bar exam subjects.',
      targetWeaknesses: ['mixed'],
      questions: mixedQuestions,
      completed: false,
    });
  }

  return modules;
}

function selectDiagnosticQuestions(count: number): Question[] {
  // Pick questions spread across topics and types
  const selected: Question[] = [];
  const usedTopics = new Set<string>();
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);

  // First pass: one per topic
  for (const q of shuffled) {
    if (selected.length >= count) break;
    if (!usedTopics.has(q.topic)) {
      selected.push(q);
      usedTopics.add(q.topic);
    }
  }

  // Fill remaining
  for (const q of shuffled) {
    if (selected.length >= count) break;
    if (!selected.includes(q)) {
      selected.push(q);
    }
  }

  return selected;
}
