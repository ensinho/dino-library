import React from 'react';
import { useTranslation } from 'react-i18next';
import { DinoLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';

/** Full-height loading state used by every route while its data resolves. */
export function PageLoader({ caption, label }: { caption?: string; label?: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background">
      <div className="text-center">
        {caption && <div className="mb-6 text-caption text-jade">— {caption}</div>}
        <DinoLoader size="lg" label={label ?? t('common.loading')} />
      </div>
    </div>
  );
}

interface PageMessageProps {
  caption: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

/** Empty / error / not-found states share one editorial layout. */
export function PageMessage({ caption, title, message, action }: PageMessageProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-caption text-jade">— {caption}</div>
        <h1 className="mb-4 font-display text-display-lg tracking-tighter text-foreground">{title}</h1>
        {message && <p className="mb-8 text-foreground/60">{message}</p>}
        {action}
      </div>
    </div>
  );
}

export function PageError({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <PageMessage
      caption={t('common.error')}
      title={t('common.errorTitle')}
      message={t('common.errorMessage')}
      action={
        onRetry && (
          <Button variant="outline" size="lg" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )
      }
    />
  );
}
