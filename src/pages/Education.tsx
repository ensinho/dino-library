import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DinoLoader } from '@/components/loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Brain, 
  Trophy, 
  BookOpen, 
  PlayCircle, 
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  Star,
  Zap,
  Award,
  Sparkles,
  Timer
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { fetchQuizQuestions, type QuizQuestion as FirestoreQuizQuestion } from '@/services/quizService';
import { getCurrentUser } from '@/services/firebaseAuthService';
import { updateProfile } from '@/services/profileService';

type QuizQuestion = FirestoreQuizQuestion & { id: string };

interface QuizSession {
  questions: (QuizQuestion & { options: string[] })[];
  currentQuestion: number;
  score: number;
  answers: boolean[];
  completed: boolean;
  streak: number;
  bonusPoints: number;
  timeBonus: number;
}

export default function Education() {
  const { t, i18n } = useTranslation();
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState<string>('');
  const { toast } = useToast();

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-700',
    medium: 'bg-yellow-500/20 text-yellow-700',
    hard: 'bg-red-500/20 text-red-700'
  };

  const startQuiz = async (difficulty?: string) => {
    setLoading(true);
    try {
      const data = await fetchQuizQuestions(difficulty, 10, i18n.language);

      if (!data || data.length === 0) {
        toast({
          title: "No questions found",
          description: "Please try again or select a different difficulty.",
          variant: "destructive"
        });
        return;
      }

      const shuffledQuestions = data
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(10, data.length))
        .map((q) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
          options: [q.correct_answer, ...(q.wrong_answers || [])].sort(() => Math.random() - 0.5),
        }));

      setQuizSession({
        questions: shuffledQuestions,
        currentQuestion: 0,
        score: 0,
        answers: [],
        completed: false,
        streak: 0,
        bonusPoints: 0,
        timeBonus: 0
      });
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: "Error loading quiz",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizSession && !quizSession.completed && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      submitAnswer();
    }
  }, [timeLeft, quizSession, showResult]);

  const submitAnswer = () => {
    if (!quizSession || !selectedAnswer) return;

    const currentQ = quizSession.questions[quizSession.currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    
    let newStreak = isCorrect ? quizSession.streak + 1 : 0;
    let bonusPoints = 0;
    let timeBonus = 0;
    
    if (isCorrect) {
      if (timeLeft > 20) timeBonus = 50;
      else if (timeLeft > 10) timeBonus = 25;
      
      if (newStreak >= 3) bonusPoints = newStreak * 10;
    }

    const newAnswers = [...quizSession.answers, isCorrect];
    let newScore = isCorrect ? quizSession.score + 1 : quizSession.score;
    
    if (isCorrect) {
      if (newStreak === 5) {
        setCurrentReward('ðŸ”¥ AWESOME! 5-in-a-row streak!');
      } else if (newStreak >= 3) {
        setCurrentReward('⚡ STREAK! +' + (newStreak * 10) + ' points!');
      } else if (timeBonus > 0) {
        setCurrentReward('ðŸ’¨ SPEEDY ANSWER! +' + timeBonus + ' points!');
      } else {
        setCurrentReward('✅ CORRECT!');
      }
      setShowReward(true);
      setTimeout(() => setShowReward(false), 1500);
    }

    setQuizSession({
      ...quizSession,
      answers: newAnswers,
      score: newScore,
      streak: newStreak,
      bonusPoints: quizSession.bonusPoints + bonusPoints,
      timeBonus: quizSession.timeBonus + timeBonus
    });

    setShowResult(true);

    setTimeout(() => {
      if (quizSession.currentQuestion < quizSession.questions.length - 1) {
        setQuizSession(prev => prev ? {
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        } : null);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        setQuizSession(prev => prev ? { ...prev, completed: true } : null);
        saveQuizScore(newScore + bonusPoints + timeBonus, quizSession.questions.length);
      }
    }, 3000);
  };

  const saveQuizScore = async (score: number, total: number) => {
    try {
      const user = await getCurrentUser();

      if (user) {
        const percentage = Math.round((score / total) * 100);

        await updateProfile(user.uid, {
          quiz_scores: {
            latest_score: percentage,
            total_quizzes: 1,
            best_score: percentage,
            last_quiz_date: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      // Silent fail on score save
    }
  };

  const resetQuiz = () => {
    setQuizSession(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setShowReward(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— Preparing the questions</div>
          <DinoLoader size="lg" label="Loading" />
        </div>
      </div>
    );
  }

  if (quizSession && !quizSession.completed) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestion];
    const progress = ((quizSession.currentQuestion + 1) / quizSession.questions.length) * 100;
    const totalScore = quizSession.score + quizSession.bonusPoints + quizSession.timeBonus;

    return (
      <div className="min-h-screen bg-background relative">
        {showReward && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-jade text-canvas px-8 py-4 rounded-full font-display text-xl tracking-tighter shadow-2xl animate-bounce">
              {currentReward}
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
                <span className="text-jade">{currentQuestion.difficulty}</span>
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
                <div className="text-caption text-jade mb-4">— In play</div>
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
                    {totalScore}
                  </div>
                  <div className="text-caption text-foreground/40 font-mono mt-1">/ {quizSession.questions.length}</div>
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
                    onClick={submitAnswer}
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
              <div className="text-caption text-jade mb-6">— Quiz closed</div>
              <h1 className="font-display text-[clamp(5rem,15vw,12rem)] leading-[0.85] text-jade tracking-tighter">
                {percentage}<span className="text-foreground/40 text-[0.3em] align-top">%</span>
              </h1>
            </div>
            <div className="lg:col-span-7 lg:pl-12">
              <h2 className="font-display text-display-xl text-foreground tracking-tighter mb-4">
                {t('education.session.quizCompleted')}
              </h2>
              <p className="text-foreground/65 text-lg leading-relaxed mb-10 max-w-[44ch]">
                {t('education.session.answeredCorrectly', { score: quizSession.score, total: quizSession.questions.length })}
              </p>
              <div className="hairline-t pt-8 flex flex-col sm:flex-row gap-3">
                <Button onClick={() => startQuiz()} size="lg" className="bg-jade text-canvas hover:bg-jade/90 rounded-full">
                  {t('education.session.newQuiz')}
                </Button>
                <Button onClick={resetQuiz} variant="outline" size="lg" className="rounded-full">
                  {t('education.session.tryAgain')}
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
  const activities: Array<{ key: string; icon: any; difficulty?: string; disabled?: boolean }> = [
    { key: 'general', icon: Brain },
    { key: 'easy', icon: Target, difficulty: 'easy' },
    { key: 'medium', icon: Target, difficulty: 'medium' },
    { key: 'hard', icon: Target, difficulty: 'hard' }
  ];
  const upcoming: Array<{ titleKey: string; descKey: string; icon: any }> = [
    { titleKey: 'education.lessons.title', descKey: 'education.lessons.description', icon: BookOpen },
    { titleKey: 'education.simulations.title', descKey: 'education.simulations.description', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('editorial.rooms.schoolroom')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{activities.length} {t('editorial.routes')}</div>
          </div>
          <div className="grid gap-y-4 gap-x-12 lg:grid-cols-12">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('education.title')}
            </h1>
            <p className="lg:col-span-5 lg:pt-3 max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed">
              {t('education.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section className="hairline-t pt-16 pb-20">
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
              <div className="text-caption text-jade mb-3">— Coming to the floor</div>
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
              <div className="text-caption text-jade mb-3">— Notes from the docent</div>
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
