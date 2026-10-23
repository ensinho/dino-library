// News Service - Paleontology News and Articles (Scientific Peer-Reviewed Feed)
import {
  ScientificArticle,
  ScientificCategory,
  getScientificArticles,
  getScientificArticleById,
  getFeaturedScientificArticles,
  fetchLiveOpenAlexArticles,
} from './scientificNewsService';

export type NewsCategory =
  | 'discoveries'
  | 'research'
  | 'technology'
  | 'exhibitions'
  | 'conservation'
  | 'education'
  | 'anatomy'
  | 'taxonomy'
  | 'paleoecology'
  | 'geology';

export type NewsArticle = ScientificArticle;

export {
  type ScientificAuthor,
  type ScientificImage,
  type TaxonLink,
  fetchLiveOpenAlexArticles,
} from './scientificNewsService';

export const getAllArticles = async (
  language: string = 'en',
  includeLive: boolean = true
): Promise<NewsArticle[]> => {
  return getScientificArticles(language, includeLive);
};

export const getArticleById = async (
  id: string,
  language: string = 'en'
): Promise<NewsArticle | undefined> => {
  return getScientificArticleById(id, language);
};

export const getArticlesByCategory = async (
  category: NewsCategory,
  language: string = 'en'
): Promise<NewsArticle[]> => {
  const articles = await getAllArticles(language);
  return articles.filter((a) => a.category === category);
};

export const getFeaturedArticles = async (
  language: string = 'en'
): Promise<NewsArticle[]> => {
  return getFeaturedScientificArticles(language);
};

export const getRelatedArticles = async (
  articleId: string,
  language: string = 'en'
): Promise<NewsArticle[]> => {
  const current = await getArticleById(articleId, language);
  if (!current) return [];

  const all = await getAllArticles(language, false);
  return all
    .filter((a) => a.id !== articleId)
    .map((a) => {
      let score = 0;
      if (a.category === current.category) score += 3;
      if (a.journal === current.journal) score += 2;
      const sharedTags = a.tags.filter((t) => current.tags.includes(t)).length;
      score += sharedTags;
      return { article: a, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((x) => x.article);
};

export const searchArticles = async (
  query: string,
  language: string = 'en'
): Promise<NewsArticle[]> => {
  const articles = await getAllArticles(language);
  const q = query.toLowerCase().trim();
  if (!q) return articles;

  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.journal.toLowerCase().includes(q) ||
      a.doi.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.taxa.some((t) => t.scientificName.toLowerCase().includes(q))
  );
};

export const getRecentArticles = async (
  limit: number = 3,
  language: string = 'en'
): Promise<NewsArticle[]> => {
  const articles = await getAllArticles(language, false);
  return articles
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, limit);
};
