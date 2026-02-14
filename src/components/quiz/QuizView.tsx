import { useState, useRef, useEffect } from 'react';
import type { Question, AnswerRecord } from '../../types';
import { checkAnswer } from '../../utils/answerChecker';
import './QuizView.css';

interface QuizViewProps {
  questions: Question[];
  onComplete: (records: AnswerRecord[]) => void;
  onExit: () => void;
  title: string;
}

export default function QuizView({ questions, onComplete, onExit, title }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [showSummary, setShowSummary] = useState(false);
  const textInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const question = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  useEffect(() => {
    if (!submitted && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [currentIndex, submitted]);

  if (!question && !showSummary) {
    setShowSummary(true);
  }

  const handleSubmit = () => {
    const answer = question.type === 'multiple-choice' || question.type === 'true-false'
      ? selectedAnswer
      : textAnswer;

    if (!answer.trim()) return;

    const correct = checkAnswer(question, answer);
    setIsCorrect(correct);
    setSubmitted(true);

    const record: AnswerRecord = {
      questionId: question.id,
      question,
      userAnswer: answer,
      isCorrect: correct,
      timeSpentMs: Date.now() - startTime,
      timestamp: Date.now(),
    };

    setRecords(prev => [...prev, record]);
  };

  const handleNext = () => {
    setSubmitted(false);
    setSelectedAnswer('');
    setTextAnswer('');

    if (currentIndex + 1 >= questions.length) {
      setShowSummary(true);
      onComplete(records);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitted) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Enter' && submitted) {
      e.preventDefault();
      handleNext();
    }
  };

  if (showSummary) {
    const correct = records.filter(r => r.isCorrect).length;
    return (
      <div className="quiz-summary">
        <h2>Session Complete</h2>
        <div className="summary-score">
          <div className="score-circle">
            <span className="score-number">{Math.round((correct / records.length) * 100)}%</span>
            <span className="score-label">{correct}/{records.length} correct</span>
          </div>
        </div>
        <div className="summary-breakdown">
          {records.map((r, i) => (
            <div key={i} className={`summary-item ${r.isCorrect ? 'correct' : 'incorrect'}`}>
              <span className="summary-icon">{r.isCorrect ? '✓' : '✗'}</span>
              <span className="summary-question">Q{i + 1}: {r.question.stem.slice(0, 80)}...</span>
              {!r.isCorrect && (
                <span className="summary-answer">Answer: {r.question.correctAnswer}</span>
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={onExit}>Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="quiz-view" onKeyDown={handleKeyDown}>
      <div className="quiz-header">
        <h3>{title}</h3>
        <button className="btn btn-ghost" onClick={onExit}>Exit</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-text">Question {currentIndex + 1} of {questions.length}</div>

      <div className="question-card">
        <div className="question-meta">
          <span className={`badge badge-${question.difficulty}`}>{question.difficulty}</span>
          <span className="badge badge-type">{question.type}</span>
          <span className="badge badge-topic">{question.topic}</span>
        </div>

        <p className="question-stem">{question.stem}</p>

        {/* Multiple choice / Issue spotting */}
        {(question.type === 'multiple-choice' || question.type === 'issue-spotting') && question.choices && (
          <div className="choices">
            {question.choices.map((choice, i) => (
              <button
                key={i}
                className={`choice-btn ${selectedAnswer === choice ? 'selected' : ''} ${
                  submitted
                    ? choice === question.correctAnswer
                      ? 'correct'
                      : selectedAnswer === choice
                        ? 'incorrect'
                        : ''
                    : ''
                }`}
                onClick={() => !submitted && setSelectedAnswer(choice)}
                disabled={submitted}
              >
                <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
                {choice}
              </button>
            ))}
          </div>
        )}

        {/* True/False */}
        {question.type === 'true-false' && (
          <div className="choices">
            {['True', 'False'].map((choice) => (
              <button
                key={choice}
                className={`choice-btn ${selectedAnswer === choice ? 'selected' : ''} ${
                  submitted
                    ? choice === question.correctAnswer
                      ? 'correct'
                      : selectedAnswer === choice
                        ? 'incorrect'
                        : ''
                    : ''
                }`}
                onClick={() => !submitted && setSelectedAnswer(choice)}
                disabled={submitted}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {/* Fill in the blank */}
        {question.type === 'fill-in-the-blank' && (
          <div className="text-input-area">
            <input
              ref={textInputRef as React.RefObject<HTMLInputElement>}
              type="text"
              className={`text-input ${submitted ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
              value={textAnswer}
              onChange={(e) => !submitted && setTextAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={submitted}
            />
          </div>
        )}

        {/* Short answer */}
        {question.type === 'short-answer' && (
          <div className="text-input-area">
            <textarea
              ref={textInputRef as React.RefObject<HTMLTextAreaElement>}
              className={`text-input textarea ${submitted ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
              value={textAnswer}
              onChange={(e) => !submitted && setTextAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={submitted}
              rows={3}
            />
          </div>
        )}

        {/* Feedback */}
        {submitted && (
          <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-header">
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            {!isCorrect && (
              <div className="feedback-answer">
                Correct answer: <strong>{question.correctAnswer}</strong>
              </div>
            )}
            <div className="feedback-explanation">{question.explanation}</div>
          </div>
        )}

        {/* Action buttons */}
        <div className="quiz-actions">
          {!submitted ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!(selectedAnswer || textAnswer.trim())}
            >
              Submit Answer
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
