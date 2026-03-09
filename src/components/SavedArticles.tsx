import type { SavedArticle } from '../types';
import { CATEGORY_META } from '../types';
import './SavedArticles.css';

interface SavedArticlesProps {
  savedArticles: SavedArticle[];
  onUnsave: (articleId: string) => void;
  getRating: (articleId: string) => 'up' | 'down' | null;
}

export function SavedArticles({ savedArticles, onUnsave, getRating }: SavedArticlesProps) {
  const sorted = [...savedArticles].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="saved-page">
        <div className="saved-header">
          <h1 className="saved-title">Saved Articles</h1>
        </div>
        <div className="saved-empty">
          <div className="saved-empty-icon">🔖</div>
          <h2>No saved articles yet</h2>
          <p>
            Tap the bookmark icon on any article in your feed to save it here for later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">
      <div className="saved-header">
        <div>
          <h1 className="saved-title">Saved Articles</h1>
          <p className="saved-subtitle">{sorted.length} article{sorted.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      <div className="saved-list">
        {sorted.map(({ article, savedAt }) => {
          const meta = CATEGORY_META[article.category] ?? CATEGORY_META.opinion;
          const rating = getRating(article.id);

          return (
            <div key={article.id} className="saved-item">
              <div className="saved-item-left">
                <div className="saved-item-top">
                  <span
                    className="saved-badge"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  {rating && (
                    <span className={`saved-rating ${rating === 'up' ? 'rated-up' : 'rated-down'}`}>
                      {rating === 'up' ? '👍 Liked' : '👎 Disliked'}
                    </span>
                  )}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="saved-article-title"
                >
                  {article.title}
                </a>
                <div className="saved-article-meta">
                  <span className="saved-publication">{article.publication}</span>
                  {article.author && (
                    <>
                      <span className="meta-dot">·</span>
                      <span>{article.author}</span>
                    </>
                  )}
                  {article.estimatedReadTime && (
                    <>
                      <span className="meta-dot">·</span>
                      <span>{article.estimatedReadTime} min read</span>
                    </>
                  )}
                  <span className="meta-dot">·</span>
                  <span className="saved-date">
                    Saved {new Date(savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="saved-summary">{article.summary}</p>
              </div>

              <div className="saved-item-actions">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Read →
                </a>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onUnsave(article.id)}
                  title="Remove from saved"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
