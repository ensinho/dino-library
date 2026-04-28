import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DinoLoader } from '@/components/loader';
import { useToast } from '@/hooks/use-toast';
import type { User } from 'firebase/auth';
import {
  listenToAuthChanges,
  signInWithEmail,
  signUpWithEmail,
} from '@/services/firebaseAuthService';
import paleoArt from '@/assets/backgrounds/Paleoart2.jpg';

export default function Auth() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsub = listenToAuthChanges((u) => {
      setUser(u);

      if (u) {
        navigate('/');
        toast({
          title: t('auth.loginSuccess'),
          description: t('auth.welcomeToast'),
        });
      }
    });

    return () => unsub();
  }, [navigate, toast, t]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(email, password);
    } catch (err) {
      const msg = String(err?.message || '');
      if (msg.toLowerCase().includes('auth/invalid-credential') || msg.toLowerCase().includes('auth/wrong-password')) {
        setError(t('auth.errors.invalidCredentials'));
      } else if (msg.toLowerCase().includes('auth/user-not-found')) {
        setError(t('auth.errors.userNotFound'));
      } else {
        setError(msg || t('auth.errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUpWithEmail(email, password, displayName || undefined);
      toast({
        title: t('auth.accountCreated'),
        description: t('auth.accountReady'),
      });
    } catch (err) {
      const msg = String(err?.message || '');
      if (msg.toLowerCase().includes('auth/email-already-in-use')) {
        setError(t('auth.errors.emailInUse'));
      } else if (msg.toLowerCase().includes('auth/weak-password')) {
        setError(t('auth.errors.weakPassword'));
      } else {
        setError(msg || t('auth.errors.generic'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-3">— {t('auth.verified')}</div>
          <div className="font-display text-2xl text-foreground/70">{t('auth.redirecting')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-12">
      {/* LEFT — quiet plate */}
      <aside className="hidden lg:block lg:col-span-5 relative overflow-hidden">
        <img
          src={paleoArt}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-[2px]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, hsl(240 8% 4% / 0.62) 0%, hsl(240 8% 4% / 0.78) 60%, hsl(240 8% 4% / 0.92) 100%)'
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16">
          <div className="text-caption text-jade">— {t('auth.plate')}</div>
          <div>
            <h2 className="font-display text-display-xl text-foreground tracking-tighter leading-[0.95] mb-6">
              {t('auth.libraryOpensLine1')}<br />{t('auth.libraryOpensLine2')}
            </h2>
            <p className="text-foreground/70 leading-relaxed max-w-[36ch]">
              {t('auth.libraryDesc')}
            </p>
          </div>
          <div className="text-caption text-foreground/40 font-mono">{t('auth.established')}</div>
        </div>
      </aside>

      {/* RIGHT — form */}
      <section className="lg:col-span-7 flex flex-col justify-center px-6 py-16 lg:py-24 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-12">
            <div className="text-caption text-jade mb-4">— {t('auth.readingDesk')}</div>
            <h1 className="font-display text-display-xl text-foreground tracking-tighter mb-4">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-foreground/65 leading-relaxed">
              {t('auth.welcomeDesc')}
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="w-full bg-transparent justify-start gap-8 hairline-b rounded-none p-0 h-auto mb-10">
              <TabsTrigger
                value="signin"
                className="text-caption text-foreground/45 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 -mb-px border-b border-transparent data-[state=active]:border-jade transition-colors"
              >
                {t('auth.signIn')}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-caption text-foreground/45 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 -mb-px border-b border-transparent data-[state=active]:border-jade transition-colors"
              >
                {t('auth.signUp')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={signIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-caption text-foreground/55">{t('auth.email')}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-caption text-foreground/55">{t('auth.password')}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="bg-surface-1 border-destructive/40">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-foreground/80">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-full bg-jade text-canvas hover:bg-jade/90"
                  disabled={loading}
                >
                  {loading ? (
                    <DinoLoader size="md" className="!h-6 !max-w-[140px] !border-0 mr-2" ariaLabel={t('auth.loading')} />
                  ) : null}
                  {t('auth.signIn')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={signUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-caption text-foreground/55">{t('auth.displayName')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t('auth.displayNamePlaceholder')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-caption text-foreground/55">{t('auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-caption text-foreground/55">{t('auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-full bg-surface-1 border-foreground/10 px-5"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="bg-surface-1 border-destructive/40">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-foreground/80">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-full bg-jade text-canvas hover:bg-jade/90"
                  disabled={loading}
                >
                  {loading ? (
                    <DinoLoader size="sm" className="!h-6 !max-w-[120px] !border-0 mr-2" ariaLabel={t('auth.loading')} />
                  ) : null}
                  {t('auth.signUp')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
