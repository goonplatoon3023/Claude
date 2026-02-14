import { useState } from 'react';
import type { StudyModule, AnswerRecord } from '../../types';
import QuizView from '../quiz/QuizView';
import './GuidedMode.css';

interface GuidedModeProps {
  modules: StudyModule[];
  onCompleteModule: (records: AnswerRecord[]) => void;
}

export default function GuidedMode({ modules, onCompleteModule }: GuidedModeProps) {
  const [activeModule, setActiveModule] = useState<StudyModule | null>(null);

  if (activeModule) {
    return (
      <QuizView
        questions={activeModule.questions}
        title={activeModule.title}
        onComplete={(records) => {
          onCompleteModule(records);
          setActiveModule(null);
        }}
        onExit={() => setActiveModule(null)}
      />
    );
  }

  return (
    <div className="guided-mode">
      <div className="guided-header">
        <h2>Guided Study</h2>
        <p className="guided-subtitle">
          Modules are generated based on your performance. Each one targets specific weaknesses
          detected in your bar exam practice answers.
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="guided-empty">
          <p>No modules available. Answer more questions in Self Study to generate personalized modules.</p>
        </div>
      ) : (
        <div className="module-grid">
          {modules.map((mod) => (
            <div key={mod.id} className={`module-card ${mod.completed ? 'completed' : ''}`}>
              <div className="module-info">
                <h3>{mod.title}</h3>
                <p className="module-desc">{mod.description}</p>
                <div className="module-meta">
                  <span className="module-count">{mod.questions.length} questions</span>
                  {mod.targetWeaknesses.length > 0 && (
                    <div className="module-tags">
                      {mod.targetWeaknesses.slice(0, 3).map((w) => (
                        <span key={w} className="module-tag">{w}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setActiveModule(mod)}
              >
                {mod.completed ? 'Retry' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
