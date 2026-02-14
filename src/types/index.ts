export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-in-the-blank'
  | 'matching'
  | 'short-answer';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Topic =
  | 'algebra'
  | 'geometry'
  | 'statistics'
  | 'calculus'
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'history'
  | 'literature'
  | 'grammar';

export const TOPIC_LABELS: Record<Topic, string> = {
  algebra: 'Algebra',
  geometry: 'Geometry',
  statistics: 'Statistics',
  calculus: 'Calculus',
  biology: 'Biology',
  chemistry: 'Chemistry',
  physics: 'Physics',
  history: 'History',
  literature: 'Literature',
  grammar: 'Grammar',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True / False',
  'fill-in-the-blank': 'Fill in the Blank',
  matching: 'Matching',
  'short-answer': 'Short Answer',
};

export interface Question {
  id: string;
  topic: Topic;
  type: QuestionType;
  difficulty: Difficulty;
  stem: string;                    // The question text
  choices?: string[];              // For multiple-choice / matching
  correctAnswer: string;           // Canonical correct answer
  acceptableAnswers?: string[];    // Alternative correct phrasings
  explanation: string;
  tags: string[];                  // fine-grained tags like "quadratic", "photosynthesis"
  phrasingFeatures: PhrasingFeatures;
}

export interface PhrasingFeatures {
  hasNegation: boolean;            // "Which is NOT…"
  hasDoubleNegation: boolean;      // "not unlikely"
  hasAbsoluteLanguage: boolean;    // "always", "never", "all"
  hasQualifiedLanguage: boolean;   // "sometimes", "usually", "may"
  sentenceComplexity: 'simple' | 'compound' | 'complex';
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
  keyTerms: string[];              // domain-specific terms in the stem
}

export interface AnswerRecord {
  questionId: string;
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentMs: number;
  timestamp: number;
}

export interface TopicStats {
  topic: Topic;
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
  byType: Record<QuestionType, { attempted: number; correct: number; accuracy: number }>;
  byDifficulty: Record<Difficulty, { attempted: number; correct: number; accuracy: number }>;
}

export interface PhrasingWeakness {
  feature: string;
  label: string;
  totalExposed: number;
  totalCorrect: number;
  accuracy: number;
  // How much worse than baseline (overall accuracy)
  delta: number;
}

export interface TermWeakness {
  term: string;
  totalExposed: number;
  totalCorrect: number;
  accuracy: number;
}

export interface WeaknessProfile {
  weakTopics: TopicStats[];
  weakQuestionTypes: { type: QuestionType; accuracy: number; attempted: number }[];
  phrasingWeaknesses: PhrasingWeakness[];
  termWeaknesses: TermWeakness[];
  overallAccuracy: number;
  totalAnswered: number;
}

export interface StudyModule {
  id: string;
  title: string;
  description: string;
  targetWeaknesses: string[];
  questions: Question[];
  completed: boolean;
  score?: number;
}

export type StudyMode = 'guided' | 'self-study';
