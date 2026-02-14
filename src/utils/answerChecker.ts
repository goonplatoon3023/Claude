import type { Question } from '../types';

/**
 * Checks if a user's answer is correct, supporting fuzzy matching
 * for free-text legal answers.
 */
export function checkAnswer(question: Question, userAnswer: string): boolean {
  const trimmed = userAnswer.trim();
  if (!trimmed) return false;

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ');

  const normalizedUser = normalize(trimmed);
  const normalizedCorrect = normalize(question.correctAnswer);

  // Exact match
  if (normalizedUser === normalizedCorrect) return true;

  // For multiple choice, true/false, and issue-spotting, must match exactly
  if (question.type === 'multiple-choice' || question.type === 'true-false' || question.type === 'issue-spotting') {
    return normalizedUser === normalizedCorrect;
  }

  // Check acceptable answers
  if (question.acceptableAnswers) {
    for (const acceptable of question.acceptableAnswers) {
      if (normalizedUser === normalize(acceptable)) return true;
      // Substring containment for short answers
      if (question.type === 'short-answer') {
        if (normalizedUser.includes(normalize(acceptable)) || normalize(acceptable).includes(normalizedUser)) {
          return true;
        }
      }
    }
  }

  // For fill-in-the-blank, also try substring match
  if (question.type === 'fill-in-the-blank') {
    if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
      return true;
    }
  }

  // For short answer, check if key concepts from the correct answer appear
  if (question.type === 'short-answer') {
    const correctWords = normalizedCorrect.split(' ').filter(w => w.length > 3);
    const matchingWords = correctWords.filter(w => normalizedUser.includes(w));
    return matchingWords.length >= Math.ceil(correctWords.length * 0.5);
  }

  return false;
}
