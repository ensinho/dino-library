import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FirebaseError } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { DinoLoader } from '@/components/loader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { sendPasswordReset, signInWithEmail, signUpWithEmail } from '@/services/firebaseAuthService';
import paleoArt from '@/assets/backgrounds/Paleoart2.jpg';

/** Firebase error code → translation key. */
const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'auth.errors.invalidCredentials',
  'auth/wrong-password': 'auth.errors.invalidCredentials',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/user-not-found': 'auth.errors.userNotFound',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'auth.errors.network',
};

const INPUT_CLASS = 'h-11 rounded-full bg-surface-1 border-foreground/10 px-4 text-sm';

export default function Auth() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  usePageTitle(t('auth.signIn'));

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  // Send people back to the page that asked them to sign in.
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const describe = (err: unknown) =>
    t(err instanceof FirebaseError && AUTH_ERRORS[err.code] ? AUTH_ERRORS[err.code] : 'auth.errors.generic');

  const run = async (action: () => Promise<unknown>) => {
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(describe(err));
    } finally {
      setLoading(false);
    }
  };

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await signInWithEmail(email, password);
      toast({ title: t('auth.loginSuccess'), description: t('auth.welcomeToast') });
    });
  };

  const signUp = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await signUpWithEmail(email, password, displayName.trim() || undefined);
      toast({ title: t('auth.accountCreated'), description: t('auth.accountReady') });
    });
  };

  const resetPassword = () => {
    if (!email) {
      setError(t('auth.errors.emailRequired'));
      return;
    }
    run(async () => {
      await sendPasswordReset(email);
      toast({ title: t('auth.resetSent'), description: t('auth.resetSentDesc', { email }) });
    });
  };

  if (user) return <Navigate to={from} replace />;

  const errorAlert = error && (
    <Alert variant="destructive" className="bg-surface-1 border-destructive/40" role="alert">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="text-foreground/80">{error}</AlertDescription>
    </Alert>
  );

  const submitButton = (label: string) => (
    <Button type="submit" size="lg" variant="accent" className="w-full h-11" disabled={loading}>
      {loading && <DinoLoader size="sm" className="!h-6 !max-w-[120px] !border-0 mr-2" ariaLabel={t('auth.loading')} />}
      {label}
    </Button>
  );

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
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2 text-caption text-foreground/50 hover:text-jade transition-colors duration-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('auth.backHome')}
          </Link>
          <div className="mb-12">
            <div className="text-caption text-jade mb-4">— {t('auth.readingDesk')}</div>
            <h1 className="font-display text-display-xl text-foreground tracking-tighter mb-4">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-foreground/65 leading-relaxed">
              {t('auth.welcomeDesc')}
            </p>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as 'signin' | 'signup');
              setError('');
            }}
            className="w-full"
          >
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
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-caption text-foreground/55">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`${INPUT_CLASS} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {errorAlert}
                {submitButton(t('auth.signIn'))}
                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={loading}
                  className="w-full text-center text-caption text-foreground/50 hover:text-jade transition-colors duration-300"
                >
                  {t('auth.forgotPassword')}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={signUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-caption text-foreground/55">{t('auth.displayName')}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder={t('auth.displayNamePlaceholder')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-caption text-foreground/55">{t('auth.email')}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-caption text-foreground/55">{t('auth.password')}</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('auth.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className={`${INPUT_CLASS} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {errorAlert}
                {submitButton(t('auth.signUp'))}
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
