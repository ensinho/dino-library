import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Trophy,
  Calendar,
  BookOpen,
  Bookmark,
  Edit3,
  Save,
  X,
  Settings,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import SpeciesCard from '@/components/SpeciesCard';
import { PageError, PageLoader } from '@/components/PageState';
import { useAuth } from '@/contexts/AuthContext';
import { useAllDinosaurs, useSpeciesImages } from '@/hooks/useDinosaurs';
import { useFavorites } from '@/hooks/useFavorites';
import { usePageTitle } from '@/hooks/usePageTitle';
import { signOutUser } from '@/services/firebaseAuthService';
import { getOrCreateProfile, updateProfile, type ProfileDoc } from '@/services/profileService';
import type { DinosaurSpecies } from '@/services/dinosaurService';

const TAB_CLASS =
  'text-caption text-foreground/45 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 -mb-px border-b border-transparent data-[state=active]:border-jade transition-colors';

function knowledgeLevel(score = 0): 'expert' | 'advanced' | 'intermediate' | 'beginner' {
  if (score >= 90) return 'expert';
  if (score >= 75) return 'advanced';
  if (score >= 60) return 'intermediate';
  return 'beginner';
}

function CollectionGrid({ favorites, images }: { favorites: DinosaurSpecies[]; images: Record<string, string | null> }) {
  const { t } = useTranslation();
  if (!favorites.length) {
    return (
      <div className="py-20 text-center hairline-t">
        <Bookmark className="mx-auto mb-6 h-6 w-6 text-jade" />
        <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
          {t('profile.collection.emptyTitle')}
        </h3>
        <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">{t('profile.collection.emptyDesc')}</p>
        <Button asChild variant="outline" size="lg">
          <Link to="/catalog">{t('profile.collection.browse')}</Link>
        </Button>
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
      {favorites.map((d) => (
        <li key={d.row_index}>
          <SpeciesCard species={d} imageUrl={images[d.row_index]} variant="compact" />
        </li>
      ))}
    </ol>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', organization: '' });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  usePageTitle(t('profile.title'));

  const { ids: favoriteIds } = useFavorites();
  const { data: all } = useAllDinosaurs();
  const favorites = useMemo(
    () => (all ?? []).filter((d) => favoriteIds.includes(d.row_index)),
    [all, favoriteIds],
  );
  const favoriteImages = useSpeciesImages(favorites);

  const loadProfile = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFailed(false);
    try {
      const data = await getOrCreateProfile(user.uid, {
        display_name: user.displayName || user.email?.split('@')[0] || null,
      });
      setProfile(data);
      setEditForm({
        display_name: data.display_name || '',
        bio: data.bio || '',
        organization: data.organization || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const patch = {
        display_name: editForm.display_name.trim() || null,
        bio: editForm.bio.trim() || null,
        organization: editForm.organization.trim() || null,
      };
      await updateProfile(profile.user_id, patch);
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
      setIsEditing(false);
      toast({ title: t('profile.toast.saved'), description: t('profile.toast.savedDesc') });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: t('profile.toast.saveFailed'), description: t('common.errorMessage'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  // Guests can still browse the species they saved on this device.
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <section className="pt-16 lg:pt-20 pb-12">
          <div className="container-editorial">
            <div className="text-caption text-jade mb-6">— {t('profile.readingDesk')} · {t('profile.collection.title')}</div>
            <div className="grid gap-y-6 gap-x-12 lg:grid-cols-12 items-end">
              <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
                {t('profile.collection.guestTitle')}
              </h1>
              <div className="lg:col-span-5">
                <p className="max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed mb-6">
                  {t('profile.collection.guestDesc')}
                </p>
                <Button asChild variant="accent">
                  <Link to="/auth" state={{ from: '/profile' }}>{t('navigation.auth')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="pb-32">
          <div className="container-editorial">
            <CollectionGrid favorites={favorites} images={favoriteImages} />
          </div>
        </section>
      </div>
    );
  }
  if (loading) return <PageLoader caption={t('profile.readingDesk')} />;
  if (failed || !profile) return <PageError onRetry={loadProfile} />;

  const scores = profile.quiz_scores ?? {};
  const level = knowledgeLevel(scores.best_score);
  const displayName = profile.display_name || user.email?.split('@')[0] || t('profile.visitor');
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const achievements = [
    { key: 'welcome', icon: User, unlocked: true },
    { key: 'firstQuiz', icon: BookOpen, unlocked: (scores.total_quizzes ?? 0) > 0 },
    { key: 'collector', icon: Bookmark, unlocked: favoriteIds.length >= 5 },
    { key: 'dedicated', icon: TrendingUp, unlocked: (scores.total_quizzes ?? 0) >= 10 },
    { key: 'expert', icon: Trophy, unlocked: (scores.best_score ?? 0) >= 80 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('profile.readingDesk')} · {t('profile.visitorFile')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block font-mono">
              Nº {String(user.uid || '').slice(0, 8)}
            </div>
          </div>

          <div className="grid gap-y-10 gap-x-12 lg:grid-cols-12 items-start">
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-1 ring-foreground/15">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="text-3xl font-display bg-surface-1 text-jade">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="lg:col-span-9">
              <h1 className="font-display text-display-2xl text-foreground tracking-tighter mb-4 leading-[0.95]">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-foreground/55 mb-6">
                {profile.role && (
                  <span className="text-jade">— {profile.role}</span>
                )}
                <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-jade" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-jade" /> {t('profile.memberSince', { date: formatDate(profile.created_at) })}</span>
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
                <div className="text-caption text-jade mb-3">— {t('profile.editFile')}</div>
                <h2 className="font-display text-2xl text-foreground tracking-[-0.025em]">
                  <Settings className="inline w-5 h-5 mr-2 text-jade" />
                  {t('profile.editProfile')}
                </h2>
              </div>
              <div className="lg:col-span-9 space-y-6 max-w-[55ch]">
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-caption text-foreground/55">{t('profile.displayName')}</label>
                  <Input
                    id="profile-name"
                    maxLength={60}
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder={t('profile.yourName')}
                    className="h-11 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-bio" className="text-caption text-foreground/55">{t('profile.biography')}</label>
                  <Textarea
                    id="profile-bio"
                    maxLength={280}
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('profile.bioPlaceholder')}
                    rows={4}
                    className="bg-surface-1 border-foreground/10 rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-org" className="text-caption text-foreground/55">{t('profile.organization')}</label>
                  <Input
                    id="profile-org"
                    maxLength={80}
                    value={editForm.organization}
                    onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder={t('profile.orgPlaceholder')}
                    className="h-11 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="hairline-t pt-5 flex gap-3">
                  <Button onClick={handleSave} disabled={saving} variant="accent">
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
          <Tabs defaultValue={favoriteIds.length ? 'collection' : 'stats'} className="w-full">
            <TabsList className="w-full bg-transparent justify-start gap-8 hairline-b rounded-none p-0 h-auto mb-12">
              <TabsTrigger value="collection" className={TAB_CLASS}>
                {t('profile.collection.title')} <span className="ml-1 font-mono text-foreground/35">{favoriteIds.length}</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className={TAB_CLASS}>
                {t('profile.statistics')}
              </TabsTrigger>
              <TabsTrigger value="achievements" className={TAB_CLASS}>
                {t('profile.achievements.title')}
              </TabsTrigger>
            </TabsList>

            {/* COLLECTION */}
            <TabsContent value="collection" className="mt-0">
              <CollectionGrid favorites={favorites} images={favoriteImages} />
            </TabsContent>

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
                        {scores.best_score ?? 0}<span className="text-2xl text-foreground/40">%</span>
                      </dd>
                    </div>
                    <div className="py-4 grid grid-cols-2 items-baseline">
                      <dt className="text-caption text-foreground/55">{t('profile.stats.latestScore')}</dt>
                      <dd className="text-right font-mono text-foreground">{scores.latest_score ?? 0}%</dd>
                    </div>
                    <div className="py-4 grid grid-cols-2 items-baseline">
                      <dt className="text-caption text-foreground/55">{t('profile.stats.averageScore')}</dt>
                      <dd className="text-right font-mono text-foreground">{scores.average_score ?? scores.latest_score ?? 0}%</dd>
                    </div>
                    <div className="py-4 grid grid-cols-2 items-baseline">
                      <dt className="text-caption text-foreground/55">{t('profile.stats.totalQuizzes')}</dt>
                      <dd className="text-right font-mono text-foreground">{scores.total_quizzes ?? 0}</dd>
                    </div>
                    {scores.last_quiz_date && (
                      <div className="py-4 grid grid-cols-2 items-baseline">
                        <dt className="text-caption text-foreground/55">{t('profile.stats.lastQuiz')}</dt>
                        <dd className="text-right font-mono text-foreground/65 text-sm">
                          {formatDate(scores.last_quiz_date)}
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
                      {t(`profile.levels.${level}`)}
                    </div>
                    <p className="text-foreground/60 mb-6 max-w-[40ch] leading-relaxed">
                      {t('profile.stats.basedOnScore')}
                    </p>
                    <Button variant="outline" onClick={() => navigate('/education')}>
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
                    {t('profile.achievements.heading')}
                  </h2>
                  <p className="text-foreground/60 leading-relaxed">{t('profile.achievements.description')}</p>
                </div>

                <ol className="lg:col-span-8 hairline-t divide-y divide-foreground/8">
                  {achievements.map(({ key, icon: Icon, unlocked }, i) => (
                    <li key={key} className={`py-6 grid grid-cols-12 gap-4 items-center ${unlocked ? '' : 'opacity-40'}`}>
                      <div className="col-span-2 font-mono text-caption text-jade">{String(i + 1).padStart(2, '0')}</div>
                      <div className="col-span-2"><Icon className={`w-5 h-5 ${unlocked ? 'text-jade' : 'text-foreground/40'}`} /></div>
                      <div className="col-span-6">
                        <h4 className="font-display text-lg tracking-[-0.025em] text-foreground mb-1">{t(`profile.achievements.${key}`)}</h4>
                        <p className="text-sm text-foreground/60">{t(`profile.achievements.${key}Desc`)}</p>
                      </div>
                      <div className="col-span-2 text-right text-caption text-foreground/45">
                        {unlocked ? t('profile.achievements.unlocked') : t('profile.achievements.locked')}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
