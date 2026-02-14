import { useState, useMemo } from 'react';
import type {
  Topic,
  QuestionType,
  Difficulty,
  Question,
  AnswerRecord,
  WeaknessProfile,
} from '../../types';
import { TOPIC_LABELS, QUESTION_TYPE_LABELS } from '../../types';
import { selectAdaptiveQuestions } from '../../engine/questionSelector';
import { questionBank } from '../../data/questionBank';
import QuizView from '../quiz/QuizView';
import './SelfStudyMode.css';

interface SelfStudyModeProps {
  profile: WeaknessProfile;
  answeredIds: Set<string>;
  onComplete: (records: AnswerRecord[]) => void;
}

export default function SelfStudyMode({ profile, answeredIds, onComplete }: SelfStudyModeProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | 'all'>('all');
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [activeQuiz, setActiveQuiz] = useState<Question[] | null>(null);

  // Count available questions per filter
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = { all: questionBank.length };
    for (const q of questionBank) {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
    }
    return counts;
  }, []);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: questionBank.length };
    for (const q of questionBank) {
      counts[q.type] = (counts[q.type] || 0) + 1;
    }
    return counts;
  }, []);

  // Get filtered question pool size
  const filteredCount = useMemo(() => {
    return questionBank.filter(q => {
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (selectedType !== 'all' && q.type !== selectedType) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      return true;
    }).length;
  }, [selectedTopic, selectedType, selectedDifficulty]);

  const startQuiz = () => {
    let pool = [...questionBank];

    if (selectedTopic !== 'all') pool = pool.filter(q => q.topic === selectedTopic);
    if (selectedType !== 'all') pool = pool.filter(q => q.type === selectedType);
    if (selectedDifficulty !== 'all') pool = pool.filter(q => q.difficulty === selectedDifficulty);

    // Use adaptive scoring to prioritize weakness-targeting questions
    const questions = selectAdaptiveQuestions(
      profile,
      answeredIds,
      Math.min(questionCount, pool.length),
      selectedTopic !== 'all' ? selectedTopic : undefined,
      selectedType !== 'all' ? selectedType : undefined,
    ).filter(q => {
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      return true;
    });

    // If adaptive selection returns fewer than needed, fill from pool
    if (questions.length < Math.min(questionCount, pool.length)) {
      const usedIds = new Set(questions.map(q => q.id));
      for (const q of pool.sort(() => Math.random() - 0.5)) {
        if (questions.length >= questionCount) break;
        if (!usedIds.has(q.id)) {
          questions.push(q);
          usedIds.add(q.id);
        }
      }
    }

    setActiveQuiz(questions.slice(0, questionCount));
  };

  if (activeQuiz) {
    const topicLabel = selectedTopic === 'all' ? 'All Topics' : TOPIC_LABELS[selectedTopic];
    return (
      <QuizView
        questions={activeQuiz}
        title={`Self Study: ${topicLabel}`}
        onComplete={(records) => {
          onComplete(records);
          setActiveQuiz(null);
        }}
        onExit={() => setActiveQuiz(null)}
      />
    );
  }

  const topics = Object.keys(TOPIC_LABELS) as Topic[];
  const types = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="self-study">
      <div className="self-study-header">
        <h2>Self Study</h2>
        <p className="self-study-subtitle">
          Choose your topic, question type, and difficulty. Questions are still adaptively ordered
          to target your weaknesses within your selection.
        </p>
      </div>

      {/* ─── Topic Selection ─────────────────────────────── */}
      <section className="filter-section">
        <h3>Topic</h3>
        <div className="filter-chips">
          <button
            className={`filter-chip ${selectedTopic === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTopic('all')}
          >
            All Topics <span className="chip-count">{topicCounts.all}</span>
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              className={`filter-chip ${selectedTopic === topic ? 'active' : ''}`}
              onClick={() => setSelectedTopic(topic)}
            >
              {TOPIC_LABELS[topic]}
              <span className="chip-count">{topicCounts[topic] || 0}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Question Type ───────────────────────────────── */}
      <section className="filter-section">
        <h3>Question Type</h3>
        <div className="filter-chips">
          <button
            className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All Types <span className="chip-count">{typeCounts.all}</span>
          </button>
          {types.map((type) => (
            <button
              key={type}
              className={`filter-chip ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {QUESTION_TYPE_LABELS[type]}
              <span className="chip-count">{typeCounts[type] || 0}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Difficulty ──────────────────────────────────── */}
      <section className="filter-section">
        <h3>Difficulty</h3>
        <div className="filter-chips">
          <button
            className={`filter-chip ${selectedDifficulty === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedDifficulty('all')}
          >
            All
          </button>
          {difficulties.map((diff) => (
            <button
              key={diff}
              className={`filter-chip ${selectedDifficulty === diff ? 'active' : ''} chip-${diff}`}
              onClick={() => setSelectedDifficulty(diff)}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Question Count ──────────────────────────────── */}
      <section className="filter-section">
        <h3>Number of Questions</h3>
        <div className="count-selector">
          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              className={`count-btn ${questionCount === n ? 'active' : ''}`}
              onClick={() => setQuestionCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Start Button ────────────────────────────────── */}
      <div className="start-section">
        <p className="available-count">
          {filteredCount} questions available with current filters
        </p>
        <button
          className="btn btn-primary btn-large"
          onClick={startQuiz}
          disabled={filteredCount === 0}
        >
          Start Practice ({Math.min(questionCount, filteredCount)} questions)
        </button>
      </div>
    </div>
  );
}
