import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Award, Crown, Feather, Gem, MapPin, Shield, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeciesCard from '@/components/SpeciesCard';
import { PageError, PageLoader } from '@/components/PageState';
import { useAllDinosaurs, useSpeciesImages } from '@/hooks/useDinosaurs';
import { usePageTitle } from '@/hooks/usePageTitle';
import { applyTheme, isThemeId, THEMES, type ThemeId } from '@/lib/themes';

const ICONS: Record<ThemeId, React.ComponentType<{ className?: string }>> = {
  giants: Crown,
  predators: Zap,
  brazil: MapPin,
  armored: Shield,
  rare: Gem,
  aerial: Feather,
};

const PREVIEW_SIZE = 8;

export default function Discover() {
  const { t } = useTranslation();
  usePageTitle(t('navigation.discover'));
  const { data: all, isPending, isError, refetch } = useAllDinosaurs();

  // The active theme lives in the URL so a theme can be linked to directly.
  const [params, setParams] = useSearchParams();
  const themeParam = params.get('theme');
  const active: ThemeId = isThemeId(themeParam) ? themeParam : 'giants';

  const counts = useMemo(
    () => Object.fromEntries(THEMES.map((th) => [th.id, applyTheme(all ?? [], th.id).length])) as Record<ThemeId, number>,
    [all],
  );
  const matches = useMemo(() => applyTheme(all ?? [], active), [all, active]);
  const preview = matches.slice(0, PREVIEW_SIZE);
  const images = useSpeciesImages(preview);

  if (isPending) return <PageLoader caption={t('editorial.curating')} label={t('discover.loading')} />;
  if (isError) return <PageError onRetry={() => refetch()} />;

  const ActiveIcon = ICONS[active];
  const ranked = active === 'giants' || active === 'predators';
  const catalogLink = `/catalog?theme=${active}`;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-4">
            <div className="text-caption text-jade">— {t('editorial.rooms.discover')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{THEMES.length} {t('editorial.routes')}</div>
          </div>
          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('discover.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {t('discover.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* THEME PICKER — sits under the sticky navigation bar */}
      <section className="hairline-t hairline-b py-4 sticky top-16 bg-background/80 backdrop-blur-md z-30">
        <div className="container-editorial">
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 [scrollbar-width:none]" role="tablist">
            {THEMES.map(({ id }) => {
              const Icon = ICONS[id];
              const selected = id === active;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setParams({ theme: id }, { replace: true })}
                  className={`shrink-0 text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                    selected
                      ? 'bg-jade text-canvas ring-jade'
                      : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${selected ? 'text-canvas' : 'text-jade'}`} />
                  {t(`discover.groups.${id}.title`)}
                  <span className={`font-mono ${selected ? 'text-canvas/70' : 'text-foreground/35'}`}>{counts[id]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* THEME OVERVIEW + GRID */}
      <section className="py-10 lg:py-12">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-12 gap-y-4 gap-x-10 mb-10">
            <div className="lg:col-span-1">
              <ActiveIcon className="h-6 w-6 text-jade" />
            </div>
            <div className="lg:col-span-8">
              <h2 className="font-display text-display-lg text-foreground tracking-tighter mb-2">
                {t(`discover.groups.${active}.title`)}
              </h2>
              <p className="text-foreground/70 leading-relaxed text-sm md:text-base max-w-[65ch]">
                {t(`discover.groups.${active}.description`)}
              </p>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-2.5 text-caption text-foreground/55">
              <div className="hairline-t pt-2.5 flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-jade" />{t('discover.speciesFound')}</span>
                <span className="font-mono text-foreground">{matches.length}</span>
              </div>
              {matches.length > PREVIEW_SIZE && (
                <Link
                  to={catalogLink}
                  className="hairline-t pt-2.5 text-caption text-jade hover:text-foreground transition-colors duration-300 inline-flex items-center gap-2"
                >
                  {t('discover.viewAll')}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {preview.length > 0 ? (
            <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3.5 gap-y-5">
              {preview.map((species, index) => (
                <li key={species.row_index}>
                  <SpeciesCard
                    species={species}
                    imageUrl={images[species.row_index]}
                    variant="compact"
                    badge={
                      ranked && index < 3 ? (
                        <span className="flex items-center gap-1.5">
                          <Award className="w-3 h-3 text-jade" />
                          Nº {index + 1}
                        </span>
                      ) : undefined
                    }
                  />
                </li>
              ))}
            </ol>
          ) : (
            <div className="py-24 text-center">
              <div className="text-caption text-jade mb-4">— {t('discover.noSpecies.caption')}</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                {t('discover.noSpecies.title')}
              </h3>
              <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">{t('discover.noSpecies.subtitle')}</p>
              <Button asChild variant="outline" size="lg">
                <Link to="/catalog">{t('discover.noSpecies.action')}</Link>
              </Button>
            </div>
          )}

          {preview.length > 0 && (
            <div className="hairline-t mt-20 pt-16 grid lg:grid-cols-12 gap-y-6 gap-x-12 items-center">
              <div className="lg:col-span-7">
                <div className="text-caption text-jade mb-3">— {t('discover.cta.caption')}</div>
                <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                  {t('discover.cta.title')}
                </h3>
                <p className="text-foreground/65 max-w-[55ch] leading-relaxed">{t('discover.cta.description')}</p>
              </div>
              <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button asChild variant="accent">
                  <Link to={catalogLink}>{t('discover.cta.viewAll')}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/catalog">{t('discover.cta.exploreAll')}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
