import { getDocs, limit, query, where } from 'firebase/firestore';
import { col } from './firestoreService';

export interface QuizQuestion {
  id?: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
  explanation?: string;
  species_id?: string;
  language?: string;
}

type RawQuizQuestion = Partial<QuizQuestion> & {
  lang?: string;
  locale?: string;
  translations?: Record<string, Partial<QuizQuestion>>;
  [key: string]: unknown;
};

function buildLanguageCandidates(language: string): string[] {
  const normalized = (language || 'en').trim();
  const base = normalized.split('-')[0];
  const compact = normalized.replace('-', '');
  const underscore = normalized.replace('-', '_');

  return Array.from(new Set([normalized, underscore, compact, base, 'en']));
}

function getLocalizedString(raw: RawQuizQuestion, field: keyof QuizQuestion, candidates: string[]): string {
  const direct = raw[field];
  if (typeof direct === 'string' && direct.trim()) {
    return direct;
  }

  for (const lang of candidates) {
    const suffixKey = `${String(field)}_${lang}`;
    const suffixVal = raw[suffixKey];
    if (typeof suffixVal === 'string' && suffixVal.trim()) {
      return suffixVal;
    }

    const asMap = raw[field];
    if (asMap && typeof asMap === 'object' && !Array.isArray(asMap)) {
      const mapVal = (asMap as Record<string, unknown>)[lang];
      if (typeof mapVal === 'string' && mapVal.trim()) {
        return mapVal;
      }
    }

    if (raw.translations && raw.translations[lang]) {
      const tVal = raw.translations[lang]?.[field];
      if (typeof tVal === 'string' && tVal.trim()) {
        return tVal;
      }
    }
  }

  return '';
}

function getLocalizedStringArray(raw: RawQuizQuestion, field: keyof QuizQuestion, candidates: string[]): string[] {
  const direct = raw[field];
  if (Array.isArray(direct)) {
    return direct.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  }

  for (const lang of candidates) {
    const suffixKey = `${String(field)}_${lang}`;
    const suffixVal = raw[suffixKey];
    if (Array.isArray(suffixVal)) {
      return suffixVal.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
    }

    const asMap = raw[field];
    if (asMap && typeof asMap === 'object' && !Array.isArray(asMap)) {
      const mapVal = (asMap as Record<string, unknown>)[lang];
      if (Array.isArray(mapVal)) {
        return mapVal.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
      }
    }

    if (raw.translations && raw.translations[lang]) {
      const tVal = raw.translations[lang]?.[field];
      if (Array.isArray(tVal)) {
        return tVal.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
      }
    }
  }

  return [];
}

function getQuestionLanguage(raw: RawQuizQuestion, candidates: string[]): string | undefined {
  const declared = [raw.language, raw.lang, raw.locale].find((v): v is string => typeof v === 'string' && v.trim().length > 0);
  if (declared) {
    return declared;
  }

  for (const lang of candidates) {
    if (raw.translations?.[lang]) {
      return lang;
    }
  }

  return undefined;
}

function hasLocalizedContent(raw: RawQuizQuestion, candidates: string[]): boolean {
  return candidates.some((lang) => {
    return (
      typeof raw[`question_${lang}`] === 'string' ||
      typeof raw[`correct_answer_${lang}`] === 'string' ||
      Array.isArray(raw[`wrong_answers_${lang}`]) ||
      (raw.translations && !!raw.translations[lang])
    );
  });
}

function normalizeQuestion(raw: RawQuizQuestion, candidates: string[]): QuizQuestion | null {
  const question = getLocalizedString(raw, 'question', candidates);
  const correct = getLocalizedString(raw, 'correct_answer', candidates);
  const wrong = getLocalizedStringArray(raw, 'wrong_answers', candidates);

  if (!question || !correct || wrong.length === 0) {
    return null;
  }

  return {
    id: raw.id,
    question,
    correct_answer: correct,
    wrong_answers: wrong,
    difficulty: (typeof raw.difficulty === 'string' && raw.difficulty) || 'easy',
    explanation: getLocalizedString(raw, 'explanation', candidates) || undefined,
    species_id: typeof raw.species_id === 'string' ? raw.species_id : undefined,
    language: getQuestionLanguage(raw, candidates),
  };
}

export async function fetchQuizQuestions(
  difficulty?: string,
  amount: number = 10,
  language: string = 'en'
): Promise<QuizQuestion[]> {
  const candidates = buildLanguageCandidates(language);
  const base = col('quiz_questions');
  const q = difficulty
    ? query(base, where('difficulty', '==', difficulty), limit(200))
    : query(base, limit(200));

  const snap = await getDocs(q);
  const normalized = snap.docs
    .map((d) => {
      const raw = { id: d.id, ...(d.data() as Omit<RawQuizQuestion, 'id'>) } as RawQuizQuestion;
      const parsed = normalizeQuestion(raw, candidates);
      if (!parsed) return null;

      const lang = (parsed.language || '').toLowerCase();
      const preferred = candidates.map((c) => c.toLowerCase());
      const matchScore = lang && preferred.includes(lang) ? 2 : hasLocalizedContent(raw, candidates) ? 1 : 0;

      return { parsed, matchScore };
    })
    .filter((x): x is { parsed: QuizQuestion; matchScore: number } => x !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((x) => x.parsed);

  // Keep randomized behavior while preferring language-matching content first.
  return normalized.sort(() => Math.random() - 0.5).slice(0, Math.min(amount, normalized.length));
}
