import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import Dashboard from './components/dashboard/Dashboard';
import GuidedMode from './components/guided/GuidedMode';
import SelfStudyMode from './components/selfstudy/SelfStudyMode';
import './App.css';

type View = 'dashboard' | 'guided' | 'self-study';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const store = useAppStore();

  return (
    <div className="app">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">B</div>
          <span className="brand-text">BarPrep IQ</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </button>
          <button
            className={`nav-item ${view === 'guided' ? 'active' : ''}`}
            onClick={() => setView('guided')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Guided Study
          </button>
          <button
            className={`nav-item ${view === 'self-study' ? 'active' : ''}`}
            onClick={() => setView('self-study')}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Self Study
          </button>
        </nav>

        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">{store.profile.totalAnswered}</span>
            <span className="sidebar-stat-label">Answered</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-value">
              {store.profile.totalAnswered > 0
                ? `${Math.round(store.profile.overallAccuracy * 100)}%`
                : '—'}
            </span>
            <span className="sidebar-stat-label">Accuracy</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-small" onClick={store.clearHistory}>
            Reset Data
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────── */}
      <main className="main-content">
        {view === 'dashboard' && (
          <Dashboard profile={store.profile} records={store.records} />
        )}
        {view === 'guided' && (
          <GuidedMode
            modules={store.modules}
            onCompleteModule={(records) => store.addRecords(records)}
          />
        )}
        {view === 'self-study' && (
          <SelfStudyMode
            profile={store.profile}
            answeredIds={store.getAnsweredIds()}
            onComplete={(records) => store.addRecords(records)}
          />
        )}
      </main>
    </div>
  );
}
