import { useLocation, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();
  usePageTitle('404');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container-editorial w-full">
        <div className="grid lg:grid-cols-12 gap-y-10 gap-x-12 items-center">
          <div className="lg:col-span-7">
            <div className="text-caption text-jade mb-6">— {t('notFound.label')}</div>
            <h1 className="font-display text-[clamp(6rem,18vw,16rem)] leading-[0.85] text-foreground tracking-tighter">
              404
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pt-10">
            <p className="text-foreground/70 text-lg md:text-xl leading-relaxed mb-3 max-w-[40ch]">
              {t('notFound.message')}
            </p>
            <p className="font-mono text-xs italic text-foreground/40 mb-8 break-all">
              {location.pathname}
            </p>
            <Link
              to="/"
              className="text-caption text-jade hover:text-foreground transition-colors duration-300 inline-flex items-center gap-2 hairline-t pt-4"
            >
              {t('notFound.back')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
