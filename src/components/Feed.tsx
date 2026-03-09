import { useState } from 'react';
import type { Article, DailyFeed, RatingItem, UserPreferences } from '../types';
import { ArticleCard } from './ArticleCard';
import './Feed.css';

interface FeedProps {
  feed: DailyFeed | null;
  preferences: UserPreferences;
  ratings: RatingItem[];
  savedIds: Set<string>;
  onRate: (article: Article, rating: 'up' | 'down') => void;
  onSave: (article: Article) => void;
  onUnsave: (articleId: string) => void;
  getRating: (articleId: string) => 'up' | 'down' | null;
  onFeedGenerated: (feed: DailyFeed) => void;
}

const TODAY = new Date().toISOString().split('T')[0];

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function Feed({
  feed,
  preferences,
  ratings,
  savedIds,
  onRate,
  onSave,
  onUnsave,
  getRating,
  onFeedGenerated,
}: FeedProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isToday = feed?.date === TODAY;

  async function generateFeed() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          ratingHistory: ratings.slice(-50),
        }),
        signal: AbortSignal.timeout(180_000), // 3 min timeout
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const newFeed: DailyFeed = {
        date: TODAY,
        articles: data.articles,
        generatedAt: new Date().toISOString(),
      };
      onFeedGenerated(newFeed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const likedCount = feed?.articles.filter((a) => getRating(a.id) === 'up').length ?? 0;
  const savedCount = feed?.articles.filter((a) => savedIds.has(a.id)).length ?? 0;

  return (
    <div className="feed-page">
      <div className="feed-header">
        <div className="feed-header-text">
          <h1 className="feed-title">Today's Reading Feed</h1>
          <p className="feed-date">{todayLabel()}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary generate-btn"
          onClick={generateFeed}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Searching...
            </>
          ) : feed && isToday ? (
            '↻ Refresh Feed'
          ) : (
            '✦ Generate Feed'
          )}
        </button>
      </div>

      {feed && isToday && (
        <div className="feed-stats">
          <span className="stat-item">
            <span className="stat-num">{feed.articles.length}</span> articles
          </span>
          <span className="stat-sep">·</span>
          <span className="stat-item">
            <span className="stat-num">{likedCount}</span> liked
          </span>
          <span className="stat-sep">·</span>
          <span className="stat-item">
            <span className="stat-num">{savedCount}</span> saved
          </span>
          <span className="stat-sep">·</span>
          <span className="stat-time">
            Generated {new Date(feed.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner-large" />
          <p className="loading-title">Searching the web for you...</p>
          <p className="loading-subtitle">
            Claude is browsing the web to find articles tailored to your interests.
            This usually takes 30–90 seconds.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <div>
            <p className="error-title">Could not generate feed</p>
            <p className="error-msg">{error}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={generateFeed}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && !feed && (
        <div className="empty-state">
          <div className="empty-icon">📰</div>
          <h2 className="empty-title">Your feed is empty</h2>
          <p className="empty-subtitle">
            Click "Generate Feed" to have Claude search the web and curate
            {preferences.categories.length > 0
              ? ` articles about ${preferences.categories.slice(0, 3).join(', ')}${preferences.categories.length > 3 ? ' and more' : ''}`
              : ' articles across your interests'}
            .
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={generateFeed}
          >
            ✦ Generate My Feed
          </button>
        </div>
      )}

      {!loading && feed && feed.articles.length > 0 && (
        <div className="articles-grid">
          {feed.articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              rating={getRating(article.id)}
              saved={savedIds.has(article.id)}
              onRate={(r) => onRate(article, r)}
              onSave={() =>
                savedIds.has(article.id) ? onUnsave(article.id) : onSave(article)
              }
            />
          ))}
        </div>
      )}

      {!loading && feed && !isToday && (
        <div className="stale-banner">
          <span>📅 This feed is from {feed.date}.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={generateFeed}>
            Generate today's feed
          </button>
        </div>
      )}
    </div>
  );
}
