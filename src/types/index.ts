export type Category =
  | 'politics'
  | 'science'
  | 'technology'
  | 'sports'
  | 'culture'
  | 'business'
  | 'arts'
  | 'health'
  | 'environment'
  | 'international'
  | 'opinion';

export type PublicationType =
  | 'mainstream_news'
  | 'academic_journals'
  | 'blogs'
  | 'magazines'
  | 'newsletters'
  | 'opinion_commentary';

export interface Article {
  id: string;
  title: string;
  url: string;
  summary: string;
  publication: string;
  category: Category;
  author?: string;
  estimatedReadTime?: number;
}

export interface RatingItem {
  article: Article;
  rating: 'up' | 'down';
  ratedAt: string;
}

export interface SavedArticle {
  article: Article;
  savedAt: string;
}

export interface UserPreferences {
  categories: Category[];
  publicationTypes: PublicationType[];
  specificInterests: string;
  onboardingComplete: boolean;
}

export interface DailyFeed {
  date: string;
  articles: Article[];
  generatedAt: string;
}

export const CATEGORY_META: Record<Category, { label: string; color: string; bg: string }> = {
  politics:      { label: 'Politics',       color: '#991b1b', bg: '#fef2f2' },
  science:       { label: 'Science',        color: '#1e40af', bg: '#eff6ff' },
  technology:    { label: 'Technology',     color: '#6b21a8', bg: '#faf5ff' },
  sports:        { label: 'Sports',         color: '#14532d', bg: '#f0fdf4' },
  culture:       { label: 'Culture',        color: '#78350f', bg: '#fffbeb' },
  business:      { label: 'Business',       color: '#0c4a6e', bg: '#f0f9ff' },
  arts:          { label: 'Arts',           color: '#831843', bg: '#fdf2f8' },
  health:        { label: 'Health',         color: '#166534', bg: '#f0fdf4' },
  environment:   { label: 'Environment',    color: '#14532d', bg: '#ecfdf5' },
  international: { label: 'International',  color: '#3730a3', bg: '#eef2ff' },
  opinion:       { label: 'Opinion',        color: '#9a3412', bg: '#fff7ed' },
};

export const CATEGORY_OPTIONS: { value: Category; label: string; emoji: string }[] = [
  { value: 'politics',      label: 'Politics',      emoji: '🏛️' },
  { value: 'science',       label: 'Science',       emoji: '🔬' },
  { value: 'technology',    label: 'Technology',    emoji: '💻' },
  { value: 'sports',        label: 'Sports',        emoji: '⚽' },
  { value: 'culture',       label: 'Culture',       emoji: '🎭' },
  { value: 'business',      label: 'Business',      emoji: '📈' },
  { value: 'arts',          label: 'Arts',          emoji: '🎨' },
  { value: 'health',        label: 'Health',        emoji: '🏥' },
  { value: 'environment',   label: 'Environment',   emoji: '🌿' },
  { value: 'international', label: 'International', emoji: '🌍' },
  { value: 'opinion',       label: 'Opinion',       emoji: '💬' },
];

export const PUBLICATION_OPTIONS: { value: PublicationType; label: string; description: string }[] = [
  { value: 'mainstream_news',    label: 'Mainstream News',      description: 'NYT, BBC, The Guardian, etc.' },
  { value: 'academic_journals',  label: 'Academic & Research',  description: 'Scholarly articles, research blogs' },
  { value: 'blogs',              label: 'Blogs & Independent',  description: 'Substack, Medium, personal blogs' },
  { value: 'magazines',          label: 'Magazines',            description: 'The Economist, Wired, New Yorker' },
  { value: 'newsletters',        label: 'Newsletters',          description: 'Curated email newsletters' },
  { value: 'opinion_commentary', label: 'Opinion & Commentary', description: 'Editorials, op-eds, analysis pieces' },
];
