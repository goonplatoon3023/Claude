import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

export const recommendationsRouter = Router();

const client = new Anthropic();

type Category =
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

const VALID_CATEGORIES: Category[] = [
  'politics', 'science', 'technology', 'sports', 'culture',
  'business', 'arts', 'health', 'environment', 'international', 'opinion',
];

interface Article {
  id: string;
  title: string;
  url: string;
  summary: string;
  publication: string;
  category: Category;
  author?: string;
  estimatedReadTime?: number;
}

interface RatingItem {
  article: Article;
  rating: 'up' | 'down';
  ratedAt: string;
}

interface UserPreferences {
  categories: Category[];
  publicationTypes: string[];
  specificInterests: string;
}

function validateCategory(cat: string): Category {
  const lower = cat?.toLowerCase() as Category;
  return VALID_CATEGORIES.includes(lower) ? lower : 'opinion';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function parseArticlesFromResponse(text: string): Article[] {
  let jsonStr = text.trim();

  // Strip markdown code fences if present
  jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

  // Find the outermost JSON object
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    jsonStr = jsonStr.substring(start, end + 1);
  }

  const parsed = JSON.parse(jsonStr);

  if (!parsed.articles || !Array.isArray(parsed.articles)) {
    throw new Error('Response missing articles array');
  }

  return parsed.articles
    .filter((a: Record<string, unknown>) => a.title && a.url && a.url !== '#')
    .map((a: Record<string, unknown>, i: number) => ({
      id: String(a.id || generateId()),
      title: String(a.title),
      url: String(a.url),
      summary: String(a.summary || ''),
      publication: String(a.publication || 'Unknown'),
      category: validateCategory(String(a.category || 'opinion')),
      author: a.author ? String(a.author) : undefined,
      estimatedReadTime: typeof a.estimatedReadTime === 'number' ? a.estimatedReadTime : 5,
      // Ensure unique ids across runs
      ...(i !== undefined && { id: generateId() }),
    }));
}

function buildPrompt(preferences: UserPreferences, ratingHistory: RatingItem[]): string {
  const topics = preferences.categories.length > 0
    ? preferences.categories.join(', ')
    : 'general news, science, culture, politics';

  const pubTypes = preferences.publicationTypes.length > 0
    ? preferences.publicationTypes.map((p) => p.replace(/_/g, ' ')).join(', ')
    : 'mainstream news, blogs, magazines';

  const interests = preferences.specificInterests?.trim()
    ? preferences.specificInterests
    : 'broad range of topics';

  const liked = ratingHistory
    .filter((r) => r.rating === 'up')
    .slice(-12)
    .map((r) => `  - "${r.article.title}" (${r.article.category} · ${r.article.publication})`)
    .join('\n');

  const disliked = ratingHistory
    .filter((r) => r.rating === 'down')
    .slice(-12)
    .map((r) => `  - "${r.article.title}" (${r.article.category} · ${r.article.publication})`)
    .join('\n');

  return `You are ReadWise, an expert content curator. Your task is to search the web and assemble a personalized daily reading feed of 12-15 high-quality articles for the user.

USER PROFILE
- Topics: ${topics}
- Publication preferences: ${pubTypes}
- Specific interests: ${interests}
${liked ? `\nARTICLES THEY ENJOYED — find more like these:\n${liked}` : ''}
${disliked ? `\nARTICLES THEY DID NOT ENJOY — avoid similar content:\n${disliked}` : ''}

SEARCH STRATEGY
1. Run multiple targeted web searches covering at least 5 different topic areas from the user's interests.
2. Vary search terms to surface both breaking news and deeper analysis / opinion pieces.
3. Include a mix of: news reports, long-form features, opinion essays, and research-backed articles.
4. Draw from a diversity of sources: major newspapers, independent magazines, academic blogs, newsletters.
5. Favour articles published within the last 30 days. Include at least 3 opinion or analysis pieces.
6. Find at least one article from a non-mainstream or independent outlet.

After finishing all searches, output ONLY a single valid JSON object — no markdown fences, no preamble, no postamble:
{
  "articles": [
    {
      "id": "a1",
      "title": "Full Article Title",
      "url": "https://real-article-url.com/path",
      "summary": "Two to three sentences describing the article's core argument or news and why a curious reader would find it valuable.",
      "publication": "Publication Name",
      "category": "politics|science|technology|sports|culture|business|arts|health|environment|international|opinion",
      "author": "Author Name",
      "estimatedReadTime": 6
    }
  ]
}`;
}

recommendationsRouter.post('/recommendations', async (req: Request, res: Response) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
    return;
  }

  const { preferences, ratingHistory = [] } = req.body as {
    preferences: UserPreferences;
    ratingHistory: RatingItem[];
  };

  if (!preferences) {
    res.status(400).json({ error: 'preferences is required' });
    return;
  }

  try {
    const prompt = buildPrompt(preferences, ratingHistory);

    let messages: Anthropic.MessageParam[] = [
      { role: 'user', content: prompt },
    ];

    let articles: Article[] = [];
    let maxContinuations = 3;
    let continuations = 0;

    while (continuations <= maxContinuations) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        tools: [{ type: 'web_search_20260209', name: 'web_search' }],
        messages,
      });

      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find((b) => b.type === 'text');
        if (!textBlock || textBlock.type !== 'text') {
          throw new Error('No text block in Claude response');
        }
        articles = parseArticlesFromResponse(textBlock.text);
        break;
      } else if (response.stop_reason === 'pause_turn') {
        // Server-side tool loop hit iteration limit — resume without adding new user message
        messages = [
          { role: 'user', content: prompt },
          { role: 'assistant', content: response.content },
        ];
        continuations++;
      } else {
        // Unexpected stop reason
        const textBlock = response.content.find((b) => b.type === 'text');
        if (textBlock && textBlock.type === 'text') {
          try {
            articles = parseArticlesFromResponse(textBlock.text);
          } catch {
            throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
          }
        }
        break;
      }
    }

    if (articles.length === 0) {
      res.status(500).json({ error: 'Claude returned no articles. Try again.' });
      return;
    }

    res.json({ articles });
  } catch (err) {
    console.error('Recommendation error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: `Failed to generate recommendations: ${message}` });
  }
});
