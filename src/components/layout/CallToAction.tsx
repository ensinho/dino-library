import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CallToActionProps {
  user: { isAuthenticated: boolean };
}

const CallToAction: React.FC<CallToActionProps> = ({ user }) => {
  const { t } = useTranslation();
  if (user.isAuthenticated) return null;

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="hero-halo" aria-hidden="true" />
      <div className="hairline-t" />
      <div className="container-editorial relative pt-20">
        <div className="grid gap-12 md:grid-cols-12 items-end">
          <div className="md:col-span-8">
            <div className="text-caption text-jade mb-6 fade-rise">— {t('cta.joinField')}</div>
            <h2 className="font-display text-display-xl text-foreground max-w-[14ch] fade-rise fade-rise-delay-1">
              {t('cta.headline')}
            </h2>
          </div>
          <div className="md:col-span-4 flex md:justify-end fade-rise fade-rise-delay-2">
            <Link to="/auth">
              <Button variant="accent" size="xl">
                {t('cta.begin')}
                <ArrowRight className="ml-1 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;