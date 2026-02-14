import type {
  WeaknessProfile,
  AnswerRecord,
} from '../../types';
import { TOPIC_LABELS, QUESTION_TYPE_LABELS } from '../../types';
import { getWeaknessSummary } from '../../engine/weaknessAnalyzer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import './Dashboard.css';

interface DashboardProps {
  profile: WeaknessProfile;
  records: AnswerRecord[];
}

export default function Dashboard({ profile, records }: DashboardProps) {
  const summaries = getWeaknessSummary(profile);

  if (profile.totalAnswered === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-empty">
          <h2>No Data Yet</h2>
          <p>Start answering questions in Guided or Self Study mode to see your analytics here.</p>
        </div>
      </div>
    );
  }

  // ─── Chart data ─────────────────────────────────────────
  const topicData = profile.weakTopics.map(t => ({
    name: TOPIC_LABELS[t.topic],
    accuracy: Math.round(t.accuracy * 100),
    attempted: t.totalAttempted,
    topic: t.topic,
  }));

  const typeData = profile.weakQuestionTypes.map(t => ({
    name: QUESTION_TYPE_LABELS[t.type],
    accuracy: Math.round(t.accuracy * 100),
    attempted: t.attempted,
  }));

  const phrasingData = profile.phrasingWeaknesses.map(p => ({
    name: p.label,
    accuracy: Math.round(p.accuracy * 100),
    delta: Math.round(p.delta * 100),
    exposed: p.totalExposed,
  }));

  // Pie chart for overall breakdown
  const correctCount = records.filter(r => r.isCorrect).length;
  const incorrectCount = records.length - correctCount;
  const pieData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: incorrectCount },
  ];

  // Recent activity (last 20)
  const recentRecords = records.slice(-20).reverse();

  // Bar color based on accuracy threshold
  const getBarColor = (accuracy: number) => {
    if (accuracy >= 80) return '#22c55e';
    if (accuracy >= 60) return '#eab308';
    return '#ef4444';
  };

  // Topic difficulty breakdown
  const topicDifficultyData = profile.weakTopics.map(t => ({
    topic: TOPIC_LABELS[t.topic],
    easy: t.byDifficulty.easy.attempted > 0 ? Math.round(t.byDifficulty.easy.accuracy * 100) : null,
    medium: t.byDifficulty.medium.attempted > 0 ? Math.round(t.byDifficulty.medium.accuracy * 100) : null,
    hard: t.byDifficulty.hard.attempted > 0 ? Math.round(t.byDifficulty.hard.accuracy * 100) : null,
  }));

  return (
    <div className="dashboard">
      {/* ─── Overview Cards ──────────────────────────────── */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{profile.totalAnswered}</div>
          <div className="stat-label">Questions Answered</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-value">{Math.round(profile.overallAccuracy * 100)}%</div>
          <div className="stat-label">Overall Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.weakTopics.length}</div>
          <div className="stat-label">Topics Covered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {profile.phrasingWeaknesses.filter(p => p.delta < -0.1).length}
          </div>
          <div className="stat-label">Phrasing Traps Found</div>
        </div>
      </div>

      {/* ─── AI Insights ─────────────────────────────────── */}
      <section className="dashboard-section">
        <h3>Weakness Analysis</h3>
        <div className="insight-cards">
          {summaries.map((s, i) => (
            <div key={i} className="insight-card">
              <span className="insight-icon">&#9670;</span>
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Overall Pie + Topic Bar ─────────────────────── */}
      <div className="chart-row">
        <section className="dashboard-section chart-half">
          <h3>Correct vs Incorrect</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="dashboard-section chart-half">
          <h3>Accuracy by Topic</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                formatter={(value: unknown) => [`${value}%`, 'Accuracy']}
              />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {topicData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* ─── Question Type Breakdown ─────────────────────── */}
      <section className="dashboard-section">
        <h3>Accuracy by Question Type</h3>
        <div className="type-grid">
          {typeData.map((t) => (
            <div key={t.name} className="type-card">
              <div className="type-name">{t.name}</div>
              <div className="type-bar-bg">
                <div
                  className="type-bar-fill"
                  style={{
                    width: `${t.accuracy}%`,
                    background: getBarColor(t.accuracy),
                  }}
                />
              </div>
              <div className="type-stats">
                <span className="type-accuracy">{t.accuracy}%</span>
                <span className="type-count">{t.attempted} questions</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Phrasing Analysis ───────────────────────────── */}
      {phrasingData.length > 0 && (
        <section className="dashboard-section">
          <h3>Phrasing & Terminology Analysis</h3>
          <p className="section-desc">
            How certain question phrasing patterns affect your accuracy compared to your baseline.
          </p>
          <div className="phrasing-table">
            <div className="phrasing-header">
              <span>Pattern</span>
              <span>Accuracy</span>
              <span>vs. Baseline</span>
              <span>Exposure</span>
            </div>
            {phrasingData.map((p) => (
              <div key={p.name} className="phrasing-row">
                <span className="phrasing-name">{p.name}</span>
                <span className="phrasing-accuracy">{p.accuracy}%</span>
                <span className={`phrasing-delta ${p.delta >= 0 ? 'positive' : 'negative'}`}>
                  {p.delta >= 0 ? '+' : ''}{p.delta}%
                </span>
                <span className="phrasing-count">{p.exposed} Qs</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Term Weaknesses ─────────────────────────────── */}
      {profile.termWeaknesses.length > 0 && (
        <section className="dashboard-section">
          <h3>Weak Terms & Vocabulary</h3>
          <p className="section-desc">
            Specific terms that appear in questions you tend to get wrong.
          </p>
          <div className="term-chips">
            {profile.termWeaknesses.slice(0, 15).map((t) => (
              <div
                key={t.term}
                className={`term-chip ${t.accuracy < 0.5 ? 'danger' : t.accuracy < 0.7 ? 'warning' : 'ok'}`}
              >
                <span className="term-name">{t.term}</span>
                <span className="term-acc">{Math.round(t.accuracy * 100)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Topic × Difficulty ──────────────────────────── */}
      {topicDifficultyData.length > 0 && (
        <section className="dashboard-section">
          <h3>Topic × Difficulty Breakdown</h3>
          <div className="difficulty-table">
            <div className="difficulty-header">
              <span>Topic</span>
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
            {topicDifficultyData.map((row) => (
              <div key={row.topic} className="difficulty-row">
                <span className="diff-topic">{row.topic}</span>
                <span className={`diff-cell ${cellClass(row.easy)}`}>
                  {row.easy !== null ? `${row.easy}%` : '—'}
                </span>
                <span className={`diff-cell ${cellClass(row.medium)}`}>
                  {row.medium !== null ? `${row.medium}%` : '—'}
                </span>
                <span className={`diff-cell ${cellClass(row.hard)}`}>
                  {row.hard !== null ? `${row.hard}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Recent Activity ─────────────────────────────── */}
      <section className="dashboard-section">
        <h3>Recent Activity</h3>
        <div className="recent-list">
          {recentRecords.map((r, i) => (
            <div key={i} className={`recent-item ${r.isCorrect ? 'correct' : 'incorrect'}`}>
              <span className="recent-icon">{r.isCorrect ? '✓' : '✗'}</span>
              <span className="recent-topic">{TOPIC_LABELS[r.question.topic]}</span>
              <span className="recent-stem">{r.question.stem.slice(0, 60)}...</span>
              <span className="recent-time">{formatTime(r.timeSpentMs)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function cellClass(val: number | null): string {
  if (val === null) return '';
  if (val >= 80) return 'cell-good';
  if (val >= 60) return 'cell-warn';
  return 'cell-bad';
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
