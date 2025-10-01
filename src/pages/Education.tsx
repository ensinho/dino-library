import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface QuizQuestion {
  id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
  explanation?: string;
  species_id?: string;
}

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
  const { t } = useTranslation();
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
      let query = supabase.from('quiz_questions').select('*');
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      
      const { data, error } = await query.limit(10);

      if (error) throw error;

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
        .map(q => ({
          ...q,
          options: [q.correct_answer, ...q.wrong_answers].sort(() => Math.random() - 0.5)
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
        setCurrentReward('🔥 AWESOME! 5-in-a-row streak!');
      } else if (newStreak >= 3) {
        setCurrentReward('⚡ STREAK! +' + (newStreak * 10) + ' points!');
      } else if (timeBonus > 0) {
        setCurrentReward('💨 SPEEDY ANSWER! +' + timeBonus + ' points!');
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const percentage = Math.round((score / total) * 100);
        
        const { error } = await supabase
          .from('profiles')
          .update({
            quiz_scores: {
              latest_score: percentage,
              total_quizzes: 1,
              best_score: percentage,
              last_quiz_date: new Date().toISOString()
            }
          })
          .eq('user_id', user.id);

        if (error) throw error;
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
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber"></div>
      </div>
    );
  }

  if (quizSession && !quizSession.completed) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestion];
    const progress = ((quizSession.currentQuestion + 1) / quizSession.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-subtle p-4 relative">
        {showReward && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gradient-primary text-white px-8 py-4 rounded-lg text-2xl font-bold animate-bounce shadow-2xl">
              {currentReward}
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={resetQuiz}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('education.session.exitQuiz')}
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                {timeLeft}s
              </Badge>
              <Badge className={difficultyColors[currentQuestion.difficulty as keyof typeof difficultyColors]}>
                {currentQuestion.difficulty}
              </Badge>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Sidebar com estatísticas */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-amber" />
                <div className="text-2xl font-bold text-primary">{quizSession.score}</div>
                <div className="text-xs text-muted-foreground">{t('education.session.correct')}</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <Zap className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-orange-500">{quizSession.streak}</div>
                <div className="text-xs text-muted-foreground">{t('education.session.streak')}</div>
              </Card>
              <Card className="p-4 text-center bg-gradient-to-br from-green-500/10 to-green-500/5">
                <Award className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-500">{quizSession.timeBonus}</div>
                <div className="text-xs text-muted-foreground">{t('education.session.speed')}</div>
              </Card>
              
              <div className="mt-6">  
                <Progress value={progress} className="mb-4" />
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    {t('education.session.question')} {quizSession.currentQuestion + 1} {t('education.session.of')} {quizSession.questions.length}
                  </p>
                </div>
              </div>
              
              <Card className="p-4 bg-gradient-to-r from-amber/10 to-orange-500/10">
                <p className="text-sm font-semibold text-primary text-center">
                  🏆 {t('education.session.totalScore')}
                </p>
                <p className="text-xl font-bold text-center text-primary">
                  {quizSession.score + quizSession.bonusPoints + quizSession.timeBonus} / {quizSession.questions.length}
                </p>
                {quizSession.streak > 0 && (
                  <p className="text-xs text-orange-500 font-medium text-center mt-2">
                    🔥 {t('education.session.currentStreak')}: {quizSession.streak}
                  </p>
                )}
              </Card>
            </div>

            {/* Área principal do quiz */}
            <div className="lg:col-span-4">
              <Card className="mb-8 shadow-xl border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-amber/5">
              <CardTitle className="text-xl mb-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber animate-pulse" />
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-5">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full text-left justify-start p-6 h-auto transition-all duration-300 transform ${
                      selectedAnswer === option 
                        ? 'border-amber bg-amber/20 scale-105 shadow-lg border-2' 
                        : showResult 
                          ? option === currentQuestion.correct_answer
                            ? 'border-green-500 bg-green-500/20 scale-105 shadow-lg border-2'
                            : option === selectedAnswer
                            ? 'border-red-500 bg-red-500/20 border-2'
                            : 'opacity-50'
                          : 'hover:bg-muted hover:scale-102 hover:shadow-md'
                    }`}
                    onClick={() => !showResult && setSelectedAnswer(option)}
                    disabled={showResult}
                  >
                    <span className="mr-4 font-bold text-lg bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-base">{option}</span>
                    {showResult && option === currentQuestion.correct_answer && (
                      <CheckCircle className="w-6 h-6 ml-auto text-green-500" />
                    )}
                    {showResult && option === selectedAnswer && option !== currentQuestion.correct_answer && (
                      <XCircle className="w-6 h-6 ml-auto text-red-500 animate-shake" />
                    )}
                  </Button>
                ))}
              </div>

              {!showResult && (
                <Button 
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="w-full mt-6 h-12 text-lg font-semibold bg-gradient-primary hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('education.session.confirmAnswer')}
                </Button>
              )}

              {showResult && currentQuestion.explanation && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 animate-fade-in">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                    <BookOpen className="w-5 h-5" />
                    {t('education.session.explanation')}:
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizSession && quizSession.completed) {
    const percentage = Math.round((quizSession.score / quizSession.questions.length) * 100);
    const getScoreColor = () => {
      if (percentage >= 80) return 'text-green-500';
      if (percentage >= 60) return 'text-yellow-500';
      return 'text-red-500';
    };

    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${getScoreColor()}`} />
            <CardTitle className="text-2xl">{t('education.session.quizCompleted')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
                {percentage}%
              </div>
              <p className="text-muted-foreground">
                {t('education.session.answeredCorrectly', { score: quizSession.score, total: quizSession.questions.length })}
              </p>
            </div>

            <div className="space-y-4">
              <Button onClick={resetQuiz} variant="outline" className="w-full">
                {t('education.session.tryAgain')}
              </Button>
              <Button onClick={() => startQuiz()} className="w-full">
                {t('education.session.newQuiz')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="bg-gradient-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl text-amber font-bold mb-6 animate-fade-in">
            {t('education.title')}
          </h1>
          <p className="text-xl md:text-xl text-white/90 max-w-3xl mx-auto animate-fade-in">
            {t('education.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('education.activities')}</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardHeader >

                <div className="flex items-center justify-start mb-4 space-x-2">
                  <Brain className="w-12 h-12 text-amber" />
                  <CardTitle>{t('education.quiz.general.title')}</CardTitle>
                </div>

                <CardDescription>
                  {t('education.quiz.general.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => startQuiz()} className="w-full" disabled={loading}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {t('education.quiz.general.start')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-start mb-4 space-x-2">
                  <Target className="w-12 h-12 text-green-500" />
                  <CardTitle>{t('education.quiz.easy.title')}</CardTitle>
                </div>
                <CardDescription>
                  {t('education.quiz.easy.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startQuiz('easy')} 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  disabled={loading}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {t('education.quiz.easy.start')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-start mb-4 space-x-2">
                  <Target className="w-12 h-12 text-yellow-500" />
                  <CardTitle>{t('education.quiz.medium.title')}</CardTitle>
                </div>
                <CardDescription>
                  {t('education.quiz.medium.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startQuiz('medium')} 
                  className="w-full bg-yellow-500 hover:bg-yellow-600" 
                  disabled={loading}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {t('education.quiz.medium.start')}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-start mb-4 space-x-2">
                  <Target className="w-12 h-12 text-red-500" />
                  <CardTitle>{t('education.quiz.hard.title')}</CardTitle>
                </div>
                <CardDescription>
                  {t('education.quiz.hard.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => startQuiz('hard')} 
                  className="w-full bg-red-500 hover:bg-red-600" 
                  disabled={loading}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {t('education.quiz.hard.start')}
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-75">
              <CardHeader>
                <div className="flex items-center justify-start mb-4 space-x-2">
                  <BookOpen className="w-12 h-12 text-muted-foreground" />
                  <CardTitle className="text-muted-foreground">{t('education.lessons.title')}</CardTitle>
                </div>
                <CardDescription>
                  {t('education.lessons.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled className="w-full">
                  {t('education.lessons.inDevelopment')}
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-75">
              <CardHeader>
                <div className="flex items-center justify-start mb-4 space-x-2">
                  <Trophy className="w-12 h-12 text-muted-foreground" />
                  <CardTitle className="text-muted-foreground">{t('education.simulations.title')}</CardTitle>
                </div>
                <CardDescription>
                  {t('education.simulations.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" disabled className="w-full">
                  {t('education.lessons.inDevelopment')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-amber/10 to-forest/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-amber" />
              {t('education.tips.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• {t('education.tips.tip1')}</li>
              <li>• {t('education.tips.tip2')}</li>
              <li>• {t('education.tips.tip3')}</li>
              <li>• {t('education.tips.tip4')}</li>
              <li>• {t('education.tips.tip5')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}