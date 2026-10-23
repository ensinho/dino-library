import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/PageState';
import {
  Brain,
  Trophy,
  BookOpen,
  PlayCircle,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  Zap,
  Award,
  Sparkles,
  Timer,
  type LucideIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchQuizQuestions, type QuizQuestion } from '@/services/quizService';
import { recordQuizResult } from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { QUESTION_TIME, pointsFor, shuffle } from '@/lib/quiz';

interface SessionQuestion extends QuizQuestion {
  id: string;
  options: string[];
}

interface QuizSession {
  difficulty?: string;
  questions: SessionQuestion[];
  currentQuestion: number;
  /** Correct answers. */
  score: number;
  /** Correct answers + streak and speed bonuses. */
  points: number;
  streak: number;
  timeBonus: number;
  completed: boolean;
}

/** How long the answer + explanation stay on screen before moving on. */
const REVEAL_MS = 3000;

export default function Education() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  usePageTitle(t('navigation.education'));

  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [reward, setReward] = useState<string | null>(null);
  const [saved, setSaved] = useState<'idle' | 'saved' | 'guest'>('idle');
  const advanceTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const startQuiz = async (difficulty?: string) => {
    setLoading(true);
    try {
      const data = await fetchQuizQuestions(difficulty, 10, i18n.language);

      if (!data.length) {
        toast({
          title: t('education.errors.noQuestions'),
          description: t('education.errors.noQuestionsDesc'),
          variant: 'destructive',
        });
        return;
      }

      setQuizSession({
        difficulty,
        questions: data.map((q) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
          options: shuffle([q.correct_answer, ...q.wrong_answers]),
        })),
        currentQuestion: 0,
        score: 0,
        points: 0,
        streak: 0,
        timeBonus: 0,
        completed: false,
      });
      setTimeLeft(QUESTION_TIME);
      setSelectedAnswer(null);
      setShowResult(false);
      setSaved('idle');
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: t('education.errors.loadFailed'),
        description: t('common.errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuizScore = useCallback(
    async (correct: number, total: number) => {
      if (!user) {
        setSaved('guest');
        return;
      }
      try {
        await recordQuizResult(user.uid, Math.round((correct / total) * 100));
        setSaved('saved');
      } catch (error) {
        console.error('Error saving quiz score:', error);
      }
    },
    [user],
  );

  /**
   * Locks in the current answer. `answer` is null when the timer runs out,
   * which counts as a wrong answer instead of freezing the quiz.
   */
  const submitAnswer = useCallback(
    (answer: string | null) => {
      if (!quizSession || showResult) return;

      const question = quizSession.questions[quizSession.currentQuestion];
      const isCorrect = answer === question.correct_answer;
      const streak = isCorrect ? quizSession.streak + 1 : 0;
      const { speed, streakBonus } = pointsFor(isCorrect, timeLeft, streak);

      if (isCorrect) {
        setReward(
          streak >= 3
            ? t('education.rewards.streak', { count: streak, points: streakBonus })
            : speed > 0
              ? t('education.rewards.speed', { points: speed })
              : t('education.rewards.correct'),
        );
        window.setTimeout(() => setReward(null), 1500);
      } else if (answer === null) {
        setReward(t('education.rewards.timeUp'));
        window.setTimeout(() => setReward(null), 1500);
      }

      const next: QuizSession = {
        ...quizSession,
        score: quizSession.score + (isCorrect ? 1 : 0),
        points: quizSession.points + (isCorrect ? 1 : 0) + speed + streakBonus,
        streak,
        timeBonus: quizSession.timeBonus + speed,
      };
      setQuizSession(next);
      setShowResult(true);

      advanceTimer.current = window.setTimeout(() => {
        const isLast = next.currentQuestion >= next.questions.length - 1;
        if (isLast) {
          setQuizSession({ ...next, completed: true });
          saveQuizScore(next.score, next.questions.length);
        } else {
          setQuizSession({ ...next, currentQuestion: next.currentQuestion + 1 });
          setSelectedAnswer(null);
          setShowResult(false);
          setTimeLeft(QUESTION_TIME);
        }
      }, REVEAL_MS);
    },
    [quizSession, showResult, timeLeft, t, saveQuizScore],
  );

  // Countdown — when it hits zero the current selection (if any) is submitted.
  useEffect(() => {
    if (!quizSession || quizSession.completed || showResult) return;
    if (timeLeft <= 0) {
      submitAnswer(selectedAnswer);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [timeLeft, quizSession, showResult, selectedAnswer, submitAnswer]);

  const resetQuiz = () => {
    window.clearTimeout(advanceTimer.current);
    setQuizSession(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(QUESTION_TIME);
    setReward(null);
  };

  if (loading) {
    return <PageLoader caption={t('education.preparing')} />;
  }

  if (quizSession && !quizSession.completed) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestion];
    const progress = ((quizSession.currentQuestion + 1) / quizSession.questions.length) * 100;

    return (
      <div className="min-h-screen bg-background relative">
        {reward && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none" role="status">
            <div className="bg-jade text-canvas px-8 py-4 rounded-full font-display text-xl tracking-tighter shadow-2xl animate-bounce">
              {reward}
            </div>
          </div>
        )}

        {/* Top rail */}
        <section className="pt-20 lg:pt-24 pb-6 hairline-b">
          <div className="container-editorial">
            <div className="flex items-center justify-between gap-6">
              <button
                type="button"
                onClick={resetQuiz}
                className="text-caption text-foreground/55 hover:text-jade transition-colors duration-300 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('education.session.exitQuiz')}
              </button>
              <div className="flex items-center gap-6 text-caption">
                <span className="flex items-center gap-2 text-foreground/55">
                  <Timer className="w-3.5 h-3.5 text-jade" />
                  <span className={`font-mono ${timeLeft <= 10 ? 'text-jade' : 'text-foreground'}`}>{timeLeft}s</span>
                </span>
                <span className="text-foreground/40">·</span>
                <span className="text-jade">{t(`education.difficulty.${currentQuestion.difficulty}`, currentQuestion.difficulty)}</span>
              </div>
            </div>
            {/* Progress hairline */}
            <div className="mt-5 relative h-px bg-foreground/10 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-jade transition-all duration-500 ease-spring"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Quiz body */}
        <section className="py-16 lg:py-20">
          <div className="container-editorial">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Sidebar — fact-file */}
              <aside className="lg:col-span-3">
                <div className="text-caption text-jade mb-4">— {t('education.session.inPlay')}</div>
                <dl className="hairline-t divide-y divide-foreground/8">
                  <div className="py-4 grid grid-cols-2 items-baseline">
                    <dt className="text-caption text-foreground/55 flex items-center gap-2"><Trophy className="w-3 h-3 text-jade" />{t('education.session.correct')}</dt>
                    <dd className="text-right font-mono text-foreground">{quizSession.score}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-2 items-baseline">
                    <dt className="text-caption text-foreground/55 flex items-center gap-2"><Zap className="w-3 h-3 text-jade" />{t('education.session.streak')}</dt>
                    <dd className="text-right font-mono text-foreground">{quizSession.streak}</dd>
                  </div>
                  <div className="py-4 grid grid-cols-2 items-baseline">
                    <dt className="text-caption text-foreground/55 flex items-center gap-2"><Award className="w-3 h-3 text-jade" />{t('education.session.speed')}</dt>
                    <dd className="text-right font-mono text-foreground">+{quizSession.timeBonus}</dd>
                  </div>
                </dl>

                <div className="hairline-t mt-8 pt-6">
                  <div className="text-caption text-foreground/40 mb-2">{t('education.session.totalScore')}</div>
                  <div className="font-display text-display-lg text-jade tracking-tighter leading-none">
                    {quizSession.points}
                  </div>
                  <div className="text-caption text-foreground/40 font-mono mt-1">{t('education.session.points')}</div>
                </div>
              </aside>

              {/* Question */}
              <div className="lg:col-span-9">
                <div className="text-caption text-jade mb-4 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('education.session.question')} <span className="font-mono">{String(quizSession.currentQuestion + 1).padStart(2, '0')}</span> {t('education.session.of')} <span className="font-mono">{String(quizSession.questions.length).padStart(2, '0')}</span>
                </div>
                <h2 className="font-display text-display-xl text-foreground tracking-tighter leading-[1.05] mb-12 max-w-[28ch]">
                  {currentQuestion.question}
                </h2>

                <div className="hairline-t divide-y divide-foreground/8">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQuestion.correct_answer;
                    const isWrong = showResult && isSelected && !isCorrect;
                    const showAsCorrect = showResult && isCorrect;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => !showResult && setSelectedAnswer(option)}
                        aria-pressed={isSelected}
                        disabled={showResult}
                        className={`w-full text-left py-6 grid grid-cols-12 gap-4 items-center transition-colors duration-300 ease-spring ${
                          showAsCorrect
                            ? 'text-jade'
                            : isWrong
                              ? 'text-destructive'
                              : isSelected
                                ? 'text-foreground'
                                : showResult
                                  ? 'text-foreground/30'
                                  : 'text-foreground/75 hover:text-jade'
                        }`}
                      >
                        <span className="col-span-1 font-mono text-caption text-foreground/40">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="col-span-9 font-display text-xl md:text-2xl tracking-[-0.025em]">
                          {option}
                        </span>
                        <span className="col-span-2 flex justify-end">
                          {showAsCorrect && <CheckCircle className="w-5 h-5" />}
                          {isWrong && <XCircle className="w-5 h-5" />}
                          {!showResult && isSelected && <span className="w-2 h-2 rounded-full bg-jade" />}
                        </span>
                      </button>
                    );
                  })}
                  <div className="hairline-t" aria-hidden="true" />
                </div>

                {!showResult && (
                  <Button
                    onClick={() => submitAnswer(selectedAnswer)}
                    disabled={!selectedAnswer}
                    size="lg"
                    className="mt-10 rounded-full bg-jade text-canvas hover:bg-jade/90 px-8"
                  >
                    {t('education.session.confirmAnswer')} →
                  </Button>
                )}

                {showResult && currentQuestion.explanation && (
                  <div className="mt-10 hairline-t pt-8">
                    <div className="text-caption text-jade mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      {t('education.session.explanation')}
                    </div>
                    <p className="text-foreground/75 leading-relaxed text-lg max-w-[60ch]">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (quizSession && quizSession.completed) {
    const percentage = Math.round((quizSession.score / quizSession.questions.length) * 100);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-12 gap-y-10 gap-x-12 items-center">
            <div className="lg:col-span-5">
              <div className="text-caption text-jade mb-6">— {t('education.session.closed')}</div>
              <h1 className="font-display text-[clamp(5rem,15vw,12rem)] leading-[0.85] text-jade tracking-tighter">
                {percentage}<span className="text-foreground/40 text-[0.3em] align-top">%</span>
              </h1>
            </div>
            <div className="lg:col-span-7 lg:pl-12">
              <h2 className="font-display text-display-xl text-foreground tracking-tighter mb-4">
                {t('education.session.quizCompleted')}
              </h2>
              <p className="text-foreground/65 text-lg leading-relaxed mb-4 max-w-[44ch]">
                {t('education.session.answeredCorrectly', { score: quizSession.score, total: quizSession.questions.length })}
              </p>
              <p className="text-caption text-foreground/45 mb-10">
                {t('education.session.pointsSummary', { points: quizSession.points, speed: quizSession.timeBonus })}
              </p>
              {saved === 'saved' && (
                <p className="text-sm text-jade mb-6">{t('education.session.saved')}</p>
              )}
              {saved === 'guest' && (
                <p className="text-sm text-foreground/60 mb-6">
                  <Link to="/auth" state={{ from: '/education' }} className="text-jade hover:underline">
                    {t('education.session.signInToSave')}
                  </Link>
                </p>
              )}
              <div className="hairline-t pt-8 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => startQuiz(quizSession.difficulty)} size="lg" variant="accent">
                  {t('education.session.tryAgain')}
                </Button>
                <Button onClick={resetQuiz} variant="outline" size="lg">
                  {t('education.session.newQuiz')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LANDING — quiz selection
  // ============================================================
  const activities: Array<{ key: string; icon: LucideIcon; difficulty?: string }> = [
    { key: 'general', icon: Brain },
    { key: 'easy', icon: Target, difficulty: 'easy' },
    { key: 'medium', icon: Target, difficulty: 'medium' },
    { key: 'hard', icon: Target, difficulty: 'hard' }
  ];
  const upcoming: Array<{ titleKey: string; descKey: string; icon: LucideIcon }> = [
    { titleKey: 'education.lessons.title', descKey: 'education.lessons.description', icon: BookOpen },
    { titleKey: 'education.simulations.title', descKey: 'education.simulations.description', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-4">
            <div className="text-caption text-jade">— {t('editorial.rooms.schoolroom')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{activities.length} {t('editorial.routes')}</div>
          </div>
          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('education.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {t('education.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="hairline-t pt-10 pb-16">
        <div className="container-editorial">
          <div className="text-caption text-jade mb-10">— {t('education.activities')}</div>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={a.key}>
                  <button
                    type="button"
                    onClick={() => startQuiz(a.difficulty)}
                    disabled={loading}
                    className="group w-full text-left hairline-t py-8 grid grid-cols-12 gap-4 items-center transition-colors duration-300"
                  >
                    <div className="col-span-1 font-mono text-caption text-foreground/40">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="col-span-2"><Icon className="w-6 h-6 text-jade" /></div>
                    <div className="col-span-7">
                      <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground transition-colors duration-300 group-hover:text-jade mb-1">
                        {t(`education.quiz.${a.key}.title`)}
                      </h3>
                      <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2">
                        {t(`education.quiz.${a.key}.description`)}
                      </p>
                    </div>
                    <div className="col-span-2 text-right text-caption text-foreground/40 group-hover:text-jade transition-colors duration-300">
                      <PlayCircle className="w-4 h-4 inline" />
                    </div>
                  </button>
                </li>
              );
            })}
            <li className="hairline-t md:col-span-2" aria-hidden="true" />
          </ol>
        </div>
      </section>

      {/* IN DEVELOPMENT */}
      <section className="hairline-t py-16">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-3">
              <div className="text-caption text-jade mb-3">— {t('education.comingSoon')}</div>
            </div>
            <ol className="lg:col-span-9 grid sm:grid-cols-2 gap-x-12 gap-y-2">
              {upcoming.map((u, i) => {
                const Icon = u.icon;
                return (
                  <li key={i} className="hairline-t py-6 grid grid-cols-12 gap-4 items-start opacity-60">
                    <div className="col-span-2"><Icon className="w-5 h-5 text-foreground/40" /></div>
                    <div className="col-span-7">
                      <h4 className="font-display text-lg tracking-[-0.025em] text-foreground/70 mb-1">{t(u.titleKey)}</h4>
                      <p className="text-sm text-foreground/45">{t(u.descKey)}</p>
                    </div>
                    <div className="col-span-3 text-right text-caption text-foreground/40">
                      {t('education.lessons.inDevelopment')}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* TIPS */}
      <section className="hairline-t py-16 pb-32">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="text-caption text-jade mb-3">— {t('education.tips.caption')}</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter">
                {t('education.tips.title')}
              </h3>
            </div>
            <ol className="lg:col-span-8 hairline-t divide-y divide-foreground/8">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="py-5 grid grid-cols-12 gap-4">
                  <div className="col-span-1 font-mono text-caption text-jade pt-1">0{n}</div>
                  <p className="col-span-11 text-foreground/75 leading-relaxed">
                    {t(`education.tips.tip${n}`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
