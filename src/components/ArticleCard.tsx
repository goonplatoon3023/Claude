import type { Article } from '../types';
import { CATEGORY_META } from '../types';
import './ArticleCard.css';

interface ArticleCardProps {
  article: Article;
  rating: 'up' | 'down' | null;
  saved: boolean;
  onRate: (rating: 'up' | 'down') => void;
  onSave: () => void;
}

export function ArticleCard({ article, rating, saved, onRate, onSave }: ArticleCardProps) {
  const meta = CATEGORY_META[article.category] ?? CATEGORY_META.opinion;

  function handleOpenArticle() {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <article className="article-card">
      <div className="card-header">
        <span
          className="category-badge"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        <button
          type="button"
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={onSave}
          title={saved ? 'Remove from saved' : 'Save article'}
          aria-label={saved ? 'Remove from saved' : 'Save article'}
        >
          {saved ? '🔖' : '🏷️'}
        </button>
      </div>

      <h2 className="card-title" onClick={handleOpenArticle} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleOpenArticle()}>
        {article.title}
      </h2>

      <div className="card-meta">
        <span className="card-publication">{article.publication}</span>
        {article.author && (
          <>
            <span className="meta-dot">·</span>
            <span className="card-author">{article.author}</span>
          </>
        )}
        {article.estimatedReadTime && (
          <>
            <span className="meta-dot">·</span>
            <span className="card-readtime">{article.estimatedReadTime} min read</span>
          </>
        )}
      </div>

      <p className="card-summary">{article.summary}</p>

      <div className="card-actions">
        <div className="rating-btns">
          <button
            type="button"
            className={`rating-btn ${rating === 'up' ? 'active-up' : ''}`}
            onClick={() => onRate('up')}
            title="Recommend more like this"
            aria-label="Thumbs up"
          >
            <span className="rating-icon">👍</span>
            <span className="rating-label">More like this</span>
          </button>
          <button
            type="button"
            className={`rating-btn ${rating === 'down' ? 'active-down' : ''}`}
            onClick={() => onRate('down')}
            title="Recommend less like this"
            aria-label="Thumbs down"
          >
            <span className="rating-icon">👎</span>
            <span className="rating-label">Less like this</span>
          </button>
        </div>
        <button
          type="button"
          className="read-btn"
          onClick={handleOpenArticle}
        >
          Read Article →
        </button>
      </div>
    </article>
  );
}
