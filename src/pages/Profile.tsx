import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DinoLoader } from '@/components/loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Trophy, 
  Calendar, 
  BookOpen, 
  Edit3, 
  Save, 
  X,
  Settings,
  Award,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOutUser } from '@/services/firebaseAuthService';
import { getOrCreateProfile, updateProfile, type ProfileDoc } from '@/services/profileService';

type Profile = ProfileDoc;

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    organization: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);
      await fetchProfile(user.uid);
    } catch (error) {
      console.error('Authentication error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const data = await getOrCreateProfile(userId, {
        display_name: user?.displayName || user?.email?.split('@')?.[0] || 'User',
      });

      setProfile(data);
      setEditForm({
        display_name: data.display_name || '',
        bio: data.bio || '',
        organization: data.organization || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      await updateProfile(profile.user_id, {
        display_name: editForm.display_name,
        bio: editForm.bio,
        organization: editForm.organization,
      });

      setProfile(prev => prev ? {
        ...prev,
        display_name: editForm.display_name,
        bio: editForm.bio,
        organization: editForm.organization
      } : null);

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/auth');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-700';
      case 'researcher': return 'bg-jade/20 text-jade';
      case 'educator': return 'bg-green-500/20 text-green-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getScoreLevel = (score?: number) => {
    if (!score) return { level: 'Beginner', color: 'text-gray-500' };
    if (score >= 90) return { level: 'Expert', color: 'text-purple-500' };
    if (score >= 75) return { level: 'Advanced', color: 'text-jade' };
    if (score >= 60) return { level: 'Intermediate', color: 'text-green-500' };
    return { level: 'Beginner', color: 'text-yellow-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— Reading desk</div>
          <DinoLoader size="lg" label="Loading" />
        </div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-4">— Reading desk closed</div>
          <h2 className="font-display text-display-lg text-foreground tracking-tighter mb-6">Error loading profile</h2>
          <Button onClick={() => navigate('/auth')} variant="outline" size="lg">Go to login</Button>
        </div>
      </div>
    );
  }

  const { level: scoreLevel } = getScoreLevel((profile.quiz_scores as any)?.best_score);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— Reading desk · Visitor file</div>
            <div className="text-caption text-foreground/40 hidden sm:block font-mono">
              Nº {String(user.uid || '').slice(0, 8)}
            </div>
          </div>

          <div className="grid gap-y-10 gap-x-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-1 ring-foreground/15">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-3xl font-display bg-surface-1 text-jade">
                    {(profile.display_name || user.email)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="lg:col-span-9">
              <h1 className="font-display text-display-2xl text-foreground tracking-tighter mb-4 leading-[0.95]">
                {profile.display_name || 'User'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-foreground/55 mb-6">
                {profile.role && (
                  <span className="text-jade">— {profile.role}</span>
                )}
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-jade" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-jade" /> {t('profile.memberSince', { date: new Date(profile.created_at).toLocaleDateString() })}</span>
              </div>
              {profile.bio && (
                <p className="text-foreground/70 leading-relaxed text-lg max-w-[60ch] mb-4">{profile.bio}</p>
              )}
              {profile.organization && (
                <p className="text-caption text-foreground/55 mb-6">
                  <span className="text-foreground/40 mr-2">{t('profile.organization')}</span>
                  {profile.organization}
                </p>
              )}
              <div className="hairline-t pt-5 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-full"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-2" />
                  {isEditing ? t('profile.cancel') : t('profile.editProfile')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-caption text-foreground/55 hover:text-jade"
                >
                  {t('profile.signOut')} →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EDIT FORM (collapsible) */}
      {isEditing && (
        <section className="hairline-t hairline-b py-12">
          <div className="container-editorial">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-3">
                <div className="text-caption text-jade mb-3">— Edit file</div>
                <h2 className="font-display text-2xl text-foreground tracking-[-0.025em]">
                  <Settings className="inline w-5 h-5 mr-2 text-jade" />
                  {t('profile.editProfile')}
                </h2>
              </div>
              <div className="lg:col-span-9 space-y-6 max-w-[55ch]">
                <div className="space-y-2">
                  <label className="text-caption text-foreground/55">{t('profile.displayName')}</label>
                  <Input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder={t('profile.yourName')}
                    className="h-11 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-caption text-foreground/55">{t('profile.biography')}</label>
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('profile.bioPlaceholder')}
                    rows={4}
                    className="bg-surface-1 border-foreground/10 rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-caption text-foreground/55">{t('profile.organization')}</label>
                  <Input
                    value={editForm.organization}
                    onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder={t('profile.orgPlaceholder')}
                    className="h-11 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="hairline-t pt-5 flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="bg-jade text-canvas hover:bg-jade/90 rounded-full">
                    <Save className="w-3.5 h-3.5 mr-2" />
                    {saving ? t('profile.saving') : t('profile.save')}
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-foreground/55 hover:text-jade">
                    <X className="w-3.5 h-3.5 mr-2" />
                    {t('profile.cancel')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TABS */}
      <section className="pb-32 pt-12">
        <div className="container-editorial">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="w-full bg-transparent justify-start gap-8 hairline-b rounded-none p-0 h-auto mb-12">
              <TabsTrigger
                value="stats"
                className="text-caption text-foreground/45 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 -mb-px border-b border-transparent data-[state=active]:border-jade transition-colors"
              >
                {t('profile.statistics')}
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="text-caption text-foreground/45 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 -mb-px border-b border-transparent data-[state=active]:border-jade transition-colors"
              >
                {t('profile.achievements.title')}
              </TabsTrigger>
            </TabsList>

            {/* STATS */}
            <TabsContent value="stats" className="mt-0">
              <div className="grid lg:grid-cols-12 gap-12">
                {/* Quiz fact-file */}
                <div className="lg:col-span-7">
                  <div className="text-caption text-jade mb-4 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5" />
                    {t('profile.stats.quizStatistics')}
                  </div>
                  <dl className="hairline-t divide-y divide-foreground/8">
                    <div className="py-4 grid grid-cols-2 items-baseline">
                      <dt className="text-caption text-foreground/55">{t('profile.stats.bestScore')}</dt>
                      <dd className="text-right font-display text-display-lg text-jade tracking-tighter">
                        {(profile.quiz_scores as any)?.best_score || 0}<span className="text-2xl text-foreground/40">%</span>
                      </dd>
                    </div>
                    <div className="py-4 grid grid-cols-2 items-baseline">
                      <dt className="text-caption text-foreground/55">{t('profile.stats.latestScore')}</dt>
                      <dd className="text-right font-mono text-foreground">{(profile.quiz_scores as any)?.latest_score || 0}%</dd>
                    </div>
                    <div className="py-4 grid grid-cols-2 items-baseline">
                      <dt className="text-caption text-foreground/55">{t('profile.stats.totalQuizzes')}</dt>
                      <dd className="text-right font-mono text-foreground">{(profile.quiz_scores as any)?.total_quizzes || 0}</dd>
                    </div>
                    {(profile.quiz_scores as any)?.last_quiz_date && (
                      <div className="py-4 grid grid-cols-2 items-baseline">
                        <dt className="text-caption text-foreground/55">{t('profile.stats.lastQuiz')}</dt>
                        <dd className="text-right font-mono text-foreground/65 text-sm">
                          {new Date((profile.quiz_scores as any).last_quiz_date).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Knowledge level */}
                <div className="lg:col-span-5">
                  <div className="text-caption text-jade mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t('profile.stats.knowledgeLevel')}
                  </div>
                  <div className="hairline-t pt-6">
                    <div className="font-display text-display-2xl text-foreground tracking-tighter leading-[0.9] mb-3">
                      {scoreLevel}
                    </div>
                    <p className="text-foreground/60 mb-6 max-w-[40ch] leading-relaxed">
                      {t('profile.stats.basedOnScore')}
                    </p>
                    <Button variant="outline" onClick={() => navigate('/education')} className="rounded-full">
                      <BookOpen className="w-3.5 h-3.5 mr-2" />
                      {t('profile.stats.takeNewQuiz')}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ACHIEVEMENTS */}
            <TabsContent value="achievements" className="mt-0">
              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                  <div className="text-caption text-jade mb-3 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5" />
                    {t('profile.achievements.title')}
                  </div>
                  <h2 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                    Marks of progress
                  </h2>
                  <p className="text-foreground/60 leading-relaxed">{t('profile.achievements.description')}</p>
                </div>

                <ol className="lg:col-span-8 hairline-t divide-y divide-foreground/8">
                  <li className="py-6 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 font-mono text-caption text-jade">01</div>
                    <div className="col-span-2"><User className="w-5 h-5 text-jade" /></div>
                    <div className="col-span-8">
                      <h4 className="font-display text-lg tracking-[-0.025em] text-foreground mb-1">{t('profile.achievements.welcome')}</h4>
                      <p className="text-sm text-foreground/60">{t('profile.achievements.welcomeDesc')}</p>
                    </div>
                  </li>

                  {(profile.quiz_scores as any)?.total_quizzes > 0 && (
                    <li className="py-6 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2 font-mono text-caption text-jade">02</div>
                      <div className="col-span-2"><BookOpen className="w-5 h-5 text-jade" /></div>
                      <div className="col-span-8">
                        <h4 className="font-display text-lg tracking-[-0.025em] text-foreground mb-1">{t('profile.achievements.firstQuiz')}</h4>
                        <p className="text-sm text-foreground/60">{t('profile.achievements.firstQuizDesc')}</p>
                      </div>
                    </li>
                  )}

                  {(profile.quiz_scores as any)?.best_score >= 80 && (
                    <li className="py-6 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2 font-mono text-caption text-jade">03</div>
                      <div className="col-span-2"><Trophy className="w-5 h-5 text-jade" /></div>
                      <div className="col-span-8">
                        <h4 className="font-display text-lg tracking-[-0.025em] text-foreground mb-1">{t('profile.achievements.expert')}</h4>
                        <p className="text-sm text-foreground/60">{t('profile.achievements.expertDesc')}</p>
                      </div>
                    </li>
                  )}

                  <li className="py-12 text-center text-caption text-foreground/40">
                    {t('profile.achievements.keepLearning')}
                  </li>
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
