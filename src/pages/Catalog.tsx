import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import PeriodTimeline from '@/components/PeriodTimeline';
import SizeFilter from '@/components/SizeFilter';
import SpeciesCard from '@/components/SpeciesCard';
import { PageError, PageLoader } from '@/components/PageState';
import { useAllDinosaurs, useSpeciesImages } from '@/hooks/useDinosaurs';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePageTitle } from '@/hooks/usePageTitle';
import { filterDinosaurs, paginate, type SortKey } from '@/services/dinosaurService';
import { DIET_GROUPS, PERIOD_GROUPS, REGIONS, type DietGroup, type PeriodGroup, type Region } from '@/lib/taxonomy';
import { isThemeId } from '@/lib/themes';

const LENGTH_MAX = 50;
const HEIGHT_MAX = 20;
const SORTS: SortKey[] = ['name', 'length', 'weight', 'discovered'];
const PER_PAGE = [12, 16, 24, 32, 48];

const GRID_CLASSES = {
  '2': 'grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6',
  '3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5',
  '4': 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 lg:gap-4',
  '5': 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-3.5',
  '6': 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3',
} as const;
type GridCols = keyof typeof GRID_CLASSES;

const oneOf = <T extends string>(values: readonly T[], value: string | null): T | undefined =>
  values.includes(value as T) ? (value as T) : undefined;

/** Page numbers to render, with `null` marking an ellipsis. */
function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

export default function Catalog() {
  const { t } = useTranslation();
  usePageTitle(t('navigation.catalog'));
  const { data: all, isPending, isError, refetch } = useAllDinosaurs();

  // Filters that define *what* is shown live in the URL, so results are
  // shareable and survive back/forward. View preferences stay local.
  const [params, setParams] = useSearchParams();
  const period = oneOf<PeriodGroup>(PERIOD_GROUPS, params.get('period'));
  const diet = oneOf<DietGroup>(DIET_GROUPS, params.get('diet'));
  const region = oneOf<Region>(REGIONS, params.get('region'));
  const themeParam = params.get('theme');
  const theme = isThemeId(themeParam) ? themeParam : undefined;
  const sort = oneOf<SortKey>(SORTS, params.get('sort'));
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(params.get('q') ?? '');
  const search = useDebouncedValue(searchInput.trim(), 250);
  const [lengthRange, setLengthRange] = useState<[number, number]>([0, LENGTH_MAX]);
  const [heightRange, setHeightRange] = useState<[number, number]>([0, HEIGHT_MAX]);
  const [showAdvanced, setShowAdvanced] = useState(Boolean(period));
  const [perPage, setPerPage] = useState(12);
  const [gridCols, setGridCols] = useState<GridCols>('4');

  /** Update query params; any filter change sends the user back to page 1. */
  const update = (patch: Record<string, string | undefined>, keepPage = false) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          if (value && value !== 'all') next.set(key, value);
          else next.delete(key);
        }
        if (!keepPage) next.delete('page');
        return next;
      },
      { replace: !('page' in patch) },
    );
  };

  // Mirror the debounced search box into the URL.
  useEffect(() => {
    if ((params.get('q') ?? '') !== search) update({ q: search || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sizeActive = lengthRange[0] > 0 || lengthRange[1] < LENGTH_MAX || heightRange[0] > 0 || heightRange[1] < HEIGHT_MAX;

  const filtered = useMemo(
    () =>
      filterDinosaurs(all ?? [], {
        search,
        period,
        diet,
        region,
        theme,
        sort,
        lengthRange: lengthRange[0] > 0 || lengthRange[1] < LENGTH_MAX ? lengthRange : undefined,
        heightRange: heightRange[0] > 0 || heightRange[1] < HEIGHT_MAX ? heightRange : undefined,
      }),
    [all, search, period, diet, region, theme, sort, lengthRange, heightRange],
  );
  const current = useMemo(() => paginate(filtered, page, perPage), [filtered, page, perPage]);
  const images = useSpeciesImages(current.data);

  const hasFilters = Boolean(search || period || diet || region || theme || sizeActive);

  const resetSize = () => {
    setLengthRange([0, LENGTH_MAX]);
    setHeightRange([0, HEIGHT_MAX]);
  };

  const clearFilters = () => {
    setSearchInput('');
    resetSize();
    setParams({}, { replace: true });
  };

  const goToPage = (p: number) => {
    update({ page: p > 1 ? String(p) : undefined }, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isPending) return <PageLoader caption={t('editorial.loadingArchive')} label={t('catalog.loading')} />;
  if (isError) return <PageError onRetry={() => refetch()} />;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER — wall plaque */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-4">
            <div className="text-caption text-jade">— {t('editorial.rooms.catalog')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">
              {all.length} {t('editorial.specimensOnRecord')}
            </div>
          </div>

          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('catalog.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {t('catalog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FILTER RAIL */}
      <section className="hairline-t hairline-b bg-surface-1/20">
        <div className="container-editorial py-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                type="search"
                placeholder={t('catalog.search')}
                aria-label={t('catalog.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-10 text-sm rounded-full bg-surface-1 border-foreground/10"
              />
            </div>

            <div className="md:col-span-2">
              <Select value={diet ?? 'all'} onValueChange={(v) => update({ diet: v })}>
                <SelectTrigger className="h-10 text-sm rounded-full bg-surface-1 border-foreground/10" aria-label={t('catalog.filters.diet')}>
                  <SelectValue placeholder={t('catalog.filters.diet')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.filters.allDiets')}</SelectItem>
                  {DIET_GROUPS.map((d) => (
                    <SelectItem key={d} value={d}>{t(`catalog.diet.${d}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={region ?? 'all'} onValueChange={(v) => update({ region: v })}>
                <SelectTrigger className="h-10 text-sm rounded-full bg-surface-1 border-foreground/10" aria-label={t('catalog.filters.location')}>
                  <SelectValue placeholder={t('catalog.filters.location')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.filters.allLocations')}</SelectItem>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>{t(`catalog.locations.${r}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Select value={sort ?? 'default'} onValueChange={(v) => update({ sort: v === 'default' ? undefined : v })}>
                <SelectTrigger className="h-10 text-sm rounded-full bg-surface-1 border-foreground/10" aria-label={t('catalog.sort.label')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">{t('catalog.sort.default')}</SelectItem>
                  {SORTS.filter((s) => s !== 'name').map((s) => (
                    <SelectItem key={s} value={s}>{t(`catalog.sort.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="text-caption text-jade flex items-center gap-2 hover:text-foreground transition-colors duration-300"
            >
              <Filter className="w-3.5 h-3.5" />
              {t('catalog.filters.advanced')} {showAdvanced ? '−' : '+'}
            </button>
            {hasFilters && (
              <>
                <span className="text-caption text-foreground/30">/</span>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-caption text-foreground/50 hover:text-jade transition-colors duration-300"
                >
                  {t('catalog.filters.clear')}
                </button>
              </>
            )}
            {theme && (
              <button
                type="button"
                onClick={() => update({ theme: undefined })}
                className="ml-auto text-caption flex items-center gap-2 rounded-full bg-jade/10 px-3 py-1.5 text-jade ring-1 ring-jade/30 hover:bg-jade/20 transition-colors"
              >
                {t('catalog.themeChip', { theme: t(`discover.groups.${theme}.title`) })}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {showAdvanced && (
            <div className="mt-6 pt-6 hairline-t grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <PeriodTimeline selectedPeriod={period ?? 'all'} onPeriodChange={(p) => update({ period: p })} />
              <SizeFilter
                lengthRange={lengthRange}
                onLengthRangeChange={setLengthRange}
                heightRange={heightRange}
                onHeightRangeChange={setHeightRange}
                onReset={resetSize}
              />
            </div>
          )}
        </div>
      </section>

      {/* META BAR */}
      <section className="py-4">
        <div className="container-editorial flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-foreground/50" aria-live="polite">
            {t('catalog.pagination.summary', {
              shown: current.data.length,
              total: current.total,
              page: current.page,
              pages: current.totalPages,
            })}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-caption text-foreground/40">{t('catalog.pagination.perPage')}</span>
              <Select
                value={String(perPage)}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  update({});
                }}
              >
                <SelectTrigger className="w-[72px] h-8 text-xs rounded-full bg-surface-1 border-foreground/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_PAGE.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-caption text-foreground/40">{t('catalog.pagination.grid')}</span>
              <Select value={gridCols} onValueChange={(v) => setGridCols(v as GridCols)}>
                <SelectTrigger className="w-[72px] h-8 text-xs rounded-full bg-surface-1 border-foreground/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(GRID_CLASSES) as GridCols[]).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIES GRID */}
      <section className="pb-24">
        <div className="container-editorial">
          {current.data.length > 0 ? (
            <div className={GRID_CLASSES[gridCols]}>
              {current.data.map((dino) => (
                <SpeciesCard key={dino.row_index} species={dino} imageUrl={images[dino.row_index]} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="text-caption text-jade mb-4">— {t('catalog.noResults.caption')}</div>
              <h2 className="font-display text-display-lg text-foreground tracking-tighter mb-4">
                {t('catalog.noResults.title')}
              </h2>
              <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">{t('catalog.noResults.subtitle')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={clearFilters} variant="outline" size="lg">
                  {t('catalog.noResults.action')}
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/discover">{t('catalog.noResults.discover')}</Link>
                </Button>
              </div>
            </div>
          )}

          {current.totalPages > 1 && (
            <nav className="mt-12 pt-6 hairline-t flex justify-center" aria-label={t('catalog.pagination.label')}>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (current.page > 1) goToPage(current.page - 1);
                      }}
                      aria-disabled={current.page === 1}
                      className={current.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {pageWindow(current.page, current.totalPages).map((p, i) =>
                    p === null ? (
                      <PaginationItem key={`gap-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === current.page}
                          onClick={(e) => {
                            e.preventDefault();
                            goToPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (current.page < current.totalPages) goToPage(current.page + 1);
                      }}
                      aria-disabled={current.page === current.totalPages}
                      className={current.page === current.totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
