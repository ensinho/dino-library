import { getDocs, limit, query, where } from 'firebase/firestore';
import { col } from './firestoreService';
import { shuffle } from '@/lib/quiz';
import config from '@/lib/config';

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

export const FALLBACK_QUIZ_QUESTIONS: Array<{
  difficulty: string;
  translations: Record<string, { question: string; correct: string; wrong: string[]; explanation: string }>;
}> = [
  {
    difficulty: 'easy',
    translations: {
      'pt-BR': {
        question: 'Em qual período geológico viveu o famoso Tyrannosaurus rex?',
        correct: 'Cretáceo',
        wrong: ['Jurássico', 'Triássico', 'Permiano'],
        explanation: 'O T. rex viveu no final do período Cretáceo, entre aproximadamente 68 e 66 milhões de anos atrás.'
      },
      'en': {
        question: 'In which geological period did the famous Tyrannosaurus rex live?',
        correct: 'Cretaceous',
        wrong: ['Jurassic', 'Triassic', 'Permian'],
        explanation: 'T. rex lived at the very end of the Cretaceous period, between approximately 68 and 66 million years ago.'
      },
      'es': {
        question: '¿En qué período geológico vivió el famoso Tyrannosaurus rex?',
        correct: 'Cretácico',
        wrong: ['Jurásico', 'Triásico', 'Pérmico'],
        explanation: 'El T. rex vivió al final del período Cretácico, hace aproximadamente entre 68 y 66 millones de años.'
      }
    }
  },
  {
    difficulty: 'easy',
    translations: {
      'pt-BR': {
        question: 'Qual grupo de dinossauros deu origem direta às aves modernas?',
        correct: 'Terópodes',
        wrong: ['Saurópodes', 'Ceratopsídeos', 'Anquilossauros'],
        explanation: 'As aves são dinossauros terópodes avianos que sobreviveram à extinção em massa do limite K-Pg.'
      },
      'en': {
        question: 'Which group of dinosaurs gave direct rise to modern birds?',
        correct: 'Theropods',
        wrong: ['Sauropods', 'Ceratopsians', 'Ankylosaurs'],
        explanation: 'Birds are living avian theropod dinosaurs that survived the K-Pg boundary mass extinction.'
      },
      'es': {
        question: '¿Qué grupo de dinosaurios dio origen directo a las aves modernas?',
        correct: 'Terópodos',
        wrong: ['Saurópodos', 'Ceratópsidos', 'Anquilosaurios'],
        explanation: 'Las aves son dinosaurios terópodos avianos vivos que sobrevivieron a la extinción del límite K-Pg.'
      }
    }
  },
  {
    difficulty: 'medium',
    translations: {
      'pt-BR': {
        question: 'Qual era a função provável das espinhas neurais alongadas da cauda do Spinosaurus aegyptiacus?',
        correct: 'Formar uma nadadeira propulsora em formato de remo',
        wrong: ['Armazenar gordura corporal', 'Apoiar o corpo durante o repouso', 'Defender contra pterossauros'],
        explanation: 'Pesquisas publicadas na Nature em 2020 confirmaram que a cauda achatada funcionava como uma barbatana propulsora na água.'
      },
      'en': {
        question: 'What was the primary function of the elongated caudal spines of Spinosaurus aegyptiacus?',
        correct: 'Forming a paddle-like propulsive fin',
        wrong: ['Storing body fat', 'Supporting the body during rest', 'Defending against pterosaurs'],
        explanation: 'Research published in Nature in 2020 confirmed the flattened tail worked as a powerful swimming paddle.'
      },
      'es': {
        question: '¿Cuál era la función de las espinas caudales alargadas del Spinosaurus aegyptiacus?',
        correct: 'Formar una aleta propulsora en forma de paleta',
        wrong: ['Almacenar grasa corporal', 'Sostener el cuerpo durante el reposo', 'Defenderse de pterosaurios'],
        explanation: 'Investigaciones en Nature (2020) confirmaron que la cola aplanada servía como una pala de natación hidrodinámica.'
      }
    }
  },
  {
    difficulty: 'medium',
    translations: {
      'pt-BR': {
        question: 'Qual é um dos maiores dinossauros já descritos, desenterrado na Patagônia Argentina?',
        correct: 'Patagotitan mayorum',
        wrong: ['Velociraptor mongoliensis', 'Carnotaurus sastrei', 'Stegosaurus stenops'],
        explanation: 'Patagotitan mayorum tinha cerca de 37 metros de comprimento e massa estimada em cerca de 70 toneladas métricas.'
      },
      'en': {
        question: 'Which of the largest dinosaurs ever described was unearthed in Argentine Patagonia?',
        correct: 'Patagotitan mayorum',
        wrong: ['Velociraptor mongoliensis', 'Carnotaurus sastrei', 'Stegosaurus stenops'],
        explanation: 'Patagotitan mayorum was approximately 37 meters long with an estimated mass of ~70 metric tons.'
      },
      'es': {
        question: '¿Cuál es uno de los mayores dinosaurios descubiertos en la Patagonia Argentina?',
        correct: 'Patagotitan mayorum',
        wrong: ['Velociraptor mongoliensis', 'Carnotaurus sastrei', 'Stegosaurus stenops'],
        explanation: 'Patagotitan mayorum medía unos 37 metros de largo y pesaba aproximadamente 70 toneladas métricas.'
      }
    }
  },
  {
    difficulty: 'hard',
    translations: {
      'pt-BR': {
        question: 'O fóssil de Borealopelta markmitchelli preservou qual evidência inovadora sobre sua ecologia?',
        correct: 'Camuflagem por contrassombreamento detectada por feomelanina',
        wrong: ['Presença de glândulas de veneno nas mandíbulas', 'Capacidade de voo planado', 'Hálito de fogo bacteriano'],
        explanation: 'Espectrometria no Royal Tyrrell Museum revelou pigmentação dorsal escura e ventral clara para evitar grandes predadores.'
      },
      'en': {
        question: 'The mummified Borealopelta markmitchelli preserved which groundbreaking ecological evidence?',
        correct: 'Countershading camouflage revealed by pheomelanin spectroscopy',
        wrong: ['Venom glands in its jaws', 'Gliding flight capability', 'Bioluminescent armor scutes'],
        explanation: 'Mass spectrometry at the Royal Tyrrell Museum revealed a darker dorsal coat and lighter ventral skin to hide from apex theropods.'
      },
      'es': {
        question: '¿Qué evidencia ecológica innovadora preservó la momia de Borealopelta markmitchelli?',
        correct: 'Camuflaje por contrasombreado mediante espectrometría de feomelanina',
        wrong: ['Glándulas venenosas en las mandíbulas', 'Capacidad de planeo', 'Escudos bioluminiscentes'],
        explanation: 'Los análisis químicos revelaron placas dorsales rojizas oscuras y un vientre claro para disimular su silueta.'
      }
    }
  },
  {
    difficulty: 'hard',
    translations: {
      'pt-BR': {
        question: 'O que o terópode brasileiro Ubirajara jubatus possuía de inédito projetando-se de seus ombros?',
        correct: 'Fitas rígidas e compridas de queratina para exibição',
        wrong: ['Garras retráteis venenosas', 'Placas ósseas idênticas às do Stegosaurus', 'Escamas cobertas de sílica'],
        explanation: 'Ubirajara exibiu estruturas queratinosas únicas na forma de fitas escapulares para sinalização visual e cortejo.'
      },
      'en': {
        question: 'What unprecedented display feature projected from the shoulders of Brazilian theropod Ubirajara jubatus?',
        correct: 'Long, ribbon-like keratinous display structures',
        wrong: ['Venomous retractable claws', 'Stegosaur-like bony plates', 'Silica-coated scales'],
        explanation: 'Ubirajara featured unique broad shoulder ribbons of keratin, used for socio-sexual courtship signaling.'
      },
      'es': {
        question: '¿Qué rasgo de exhibición inédito se proyectaba de los hombros del terópodo Ubirajara jubatus?',
        correct: 'Cintas alargadas de queratina para cortejo y exhibición',
        wrong: ['Garras retráctiles venenosas', 'Placas óseas tipo estegosáurido', 'Escamas silíceas'],
        explanation: 'Ubirajara poseía largas cintas de queratina en los hombros para comunicación visual intraespecífica.'
      }
    }
  }
];

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

function getFallbackQuestions(difficulty?: string, amount = 10, language = 'en'): QuizQuestion[] {
  const normalizedLang = language.startsWith('pt') ? 'pt-BR' : language.startsWith('es') ? 'es' : 'en';

  const filtered = FALLBACK_QUIZ_QUESTIONS
    .filter((q) => !difficulty || q.difficulty === difficulty)
    .map((q, idx) => {
      const tr = q.translations[normalizedLang] || q.translations['en'];
      return {
        id: `fallback-q-${idx}-${q.difficulty}`,
        question: tr.question,
        correct_answer: tr.correct,
        wrong_answers: tr.wrong,
        difficulty: q.difficulty,
        explanation: tr.explanation,
        language: normalizedLang,
      };
    });

  return shuffle(filtered).slice(0, amount);
}

export async function fetchQuizQuestions(
  difficulty?: string,
  amount: number = 10,
  language: string = 'en'
): Promise<QuizQuestion[]> {
  const candidates = buildLanguageCandidates(language);
  const isEnglish = language.toLowerCase().startsWith('en');
  const own = candidates.map((c) => c.toLowerCase()).filter((c) => isEnglish || c !== 'en');

  if (!config.firebase) {
    return getFallbackQuestions(difficulty, amount, language);
  }

  try {
    const base = col('quiz_questions');
    const q = difficulty
      ? query(base, where('difficulty', '==', difficulty), limit(200))
      : query(base, limit(200));

    const snap = await getDocs(q);
    if (snap.empty) {
      return getFallbackQuestions(difficulty, amount, language);
    }

    const normalized = snap.docs
      .map((d) => {
        const raw = { id: d.id, ...(d.data() as Omit<RawQuizQuestion, 'id'>) } as RawQuizQuestion;
        const parsed = normalizeQuestion(raw, candidates);
        if (!parsed) return null;

        const lang = (parsed.language || '').toLowerCase();
        const matchScore = lang && own.includes(lang) ? 2 : hasLocalizedContent(raw, own) ? 1 : 0;

        return { parsed, matchScore };
      })
      .filter((x): x is { parsed: QuizQuestion; matchScore: number } => x !== null);

    if (normalized.length === 0) {
      return getFallbackQuestions(difficulty, amount, language);
    }

    const best = Math.max(0, ...normalized.map((x) => x.matchScore));
    const preferred = shuffle(normalized.filter((x) => x.matchScore === best));
    const rest = shuffle(normalized.filter((x) => x.matchScore !== best));
    const finalSelection = [...preferred, ...rest].slice(0, amount).map((x) => x.parsed);

    return finalSelection.length > 0 ? finalSelection : getFallbackQuestions(difficulty, amount, language);
  } catch (error) {
    console.warn('Firestore quiz retrieval failed, using fallback quiz bank:', error);
    return getFallbackQuestions(difficulty, amount, language);
  }
}
