import { describe, expect, it } from 'vitest';
import {
  CURATED_SCIENTIFIC_ARTICLES,
  ScientificArticleSchema,
  getScientificArticles,
  getScientificArticleById,
  getFeaturedScientificArticles,
} from './scientificNewsService';
import { searchArticles, getRelatedArticles } from './newsService';

describe('Scientific News Service & Data Validation', () => {
  it('validates every curated article against ScientificArticleSchema Zod schema', () => {
    expect(CURATED_SCIENTIFIC_ARTICLES.length).toBeGreaterThanOrEqual(5);

    for (const article of CURATED_SCIENTIFIC_ARTICLES) {
      const parsed = ScientificArticleSchema.safeParse(article);
      if (!parsed.success) {
        console.error('Zod validation failure:', article.id, parsed.error.issues);
      }
      expect(parsed.success).toBe(true);
    }
  });

  it('guarantees real DOI format and valid https://doi.org URL for all curated papers', () => {
    for (const article of CURATED_SCIENTIFIC_ARTICLES) {
      expect(article.doi).toMatch(/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/);
      expect(article.doiUrl).toBe(`https://doi.org/${article.doi}`);
      expect(article.peerReviewed).toBe(true);
      expect(article.journal.length).toBeGreaterThan(2);
      expect(article.authors.length).toBeGreaterThan(0);
      expect(article.authors[0].affiliation).toBeDefined();
    }
  });

  it('provides structured APA and BibTeX citations', () => {
    for (const article of CURATED_SCIENTIFIC_ARTICLES) {
      expect(article.citationApa).toContain(article.doi);
      expect(article.citationBibtex).toContain('@article');
      expect(article.citationBibtex).toContain(article.doi);
    }
  });

  it('correctly provides multilingual content for pt-BR, es and en', async () => {
    const ptArticles = await getScientificArticles('pt-BR', false);
    const enArticles = await getScientificArticles('en', false);
    const esArticles = await getScientificArticles('es', false);

    const spinosaurusPt = ptArticles.find((a) => a.id === 'spinosaurus-aquatic-locomotion');
    const spinosaurusEn = enArticles.find((a) => a.id === 'spinosaurus-aquatic-locomotion');
    const spinosaurusEs = esArticles.find((a) => a.id === 'spinosaurus-aquatic-locomotion');

    expect(spinosaurusPt?.title).toContain('Propulsão Aquática');
    expect(spinosaurusEn?.title).toContain('Aquatic Locomotion');
    expect(spinosaurusEs?.title).toContain('Propulsión Acuática');
  });

  it('finds articles by taxon name, DOI or journal via searchArticles', async () => {
    const byTaxon = await searchArticles('Spinosaurus');
    expect(byTaxon.some((a) => a.id === 'spinosaurus-aquatic-locomotion')).toBe(true);

    const byJournal = await searchArticles('Current Biology');
    expect(byJournal.some((a) => a.id === 'borealopelta-markmitchelli-mummified-camouflage')).toBe(true);

    const byDoi = await searchArticles('10.1098/rspb.2017.1219');
    expect(byDoi.some((a) => a.id === 'patagotitan-mayorum-giant-titanosaur')).toBe(true);
  });

  it('finds related scientific literature based on category and journal', async () => {
    const related = await getRelatedArticles('spinosaurus-aquatic-locomotion');
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((r) => r.id !== 'spinosaurus-aquatic-locomotion')).toBe(true);
  });
});
