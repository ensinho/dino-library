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
}

export async function fetchQuizQuestions(difficulty?: string, amount: number = 10): Promise<QuizQuestion[]> {
  const base = col('quiz_questions');
  const q = difficulty
    ? query(base, where('difficulty', '==', difficulty), limit(200))
    : query(base, limit(200));

  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuizQuestion, 'id'>) }));

  // Client-side shuffle + select (keeps behavior similar to the previous backend flow)
  return all.sort(() => Math.random() - 0.5).slice(0, Math.min(amount, all.length));
}
