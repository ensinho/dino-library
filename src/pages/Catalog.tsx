import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DinoLoader } from '@/components/loader';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, Filter, Ruler, Calendar, MapPin, Weight, Bone } from 'lucide-react';
import { dinosaurService, DinosaurSpecies } from '@/services/dinosaurService';
import { useAnalytics } from '@/services/analyticsService';
import LanguageSwitcher from '@/components/ui/language-switcher';
import PeriodTimeline from '@/components/PeriodTimeline';
import SizeFilter from '@/components/SizeFilter';
import SmartImage from '@/components/SmartImage';

// Using DinosaurSpecies type from the service

export default function Catalog() {
  const { t, i18n } = useTranslation();
  const analytics = useAnalytics();
  const navigate = useNavigate();
  
  const [species, setSpecies] = useState<DinosaurSpecies[]>([]);
  const [filteredSpecies, setFilteredSpecies] = useState<DinosaurSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [livedInFilter, setLivedInFilter] = useState('all');
  const [lengthRange, setLengthRange] = useState<[number, number]>([0, 50]);
  const [heightRange, setHeightRange] = useState<[number, number]>([0, 20]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [gridCols, setGridCols] = useState<'2' | '3' | '4' | '5'>('4');

  useEffect(() => {
    fetchSpecies();
    analytics.trackPageView('/catalog');
  }, []);

  useEffect(() => {
    fetchSpecies();
  }, [searchTerm, periodFilter, dietFilter, livedInFilter, lengthRange, heightRange, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, periodFilter, dietFilter, livedInFilter, lengthRange, heightRange, itemsPerPage]);

  // Removed client-side filtering - now handled by the service

  const fetchSpecies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dinosaurService.getDinosaurs({
        search: searchTerm || undefined,
        period: periodFilter === 'all' ? undefined : periodFilter,
        diet: dietFilter === 'all' ? undefined : dietFilter,
        location: livedInFilter === 'all' ? undefined : livedInFilter,
        lengthRange: lengthRange[0] === 0 && lengthRange[1] === 50 ? undefined : lengthRange,
        heightRange: heightRange[0] === 0 && heightRange[1] === 20 ? undefined : heightRange,
        page: currentPage,
        limit: itemsPerPage
      });
      
      setSpecies(response.data);
      setFilteredSpecies(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      
      // Track search analytics
      if (searchTerm) {
        analytics.trackSearch(searchTerm, response.total, {
          period: periodFilter,
          diet: dietFilter,
          location: livedInFilter,
          lengthRange: lengthRange,
          heightRange: heightRange
        });
      }
      
    } catch (error) {
      console.error('Error fetching species:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dinosaurs');
      analytics.trackError(error instanceof Error ? error : new Error('Failed to fetch dinosaurs'));
    } finally {
      setLoading(false);
    }
  };


  const handleFilterChange = (filterType: string, value: string) => {
    analytics.trackFilterUsage(filterType, value);
    
    switch (filterType) {
      case 'period':
        setPeriodFilter(value);
        break;
      case 'diet':
        setDietFilter(value);
        break;
      case 'location':
        setLivedInFilter(value);
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPeriodFilter('all');
    setDietFilter('all');
    setLivedInFilter('all');
    setLengthRange([0, 50]);
    setHeightRange([0, 20]);
    analytics.track('filters_cleared');
  };

  const resetSizeFilters = () => {
    setLengthRange([0, 50]);
    setHeightRange([0, 20]);
  };

  const handleSpeciesClick = (species: DinosaurSpecies) => {
    // Never let analytics block navigation if it errors for any reason.
    try {
      const speciesId = Number(species.row_index);
      analytics.trackSpeciesView(Number.isFinite(speciesId) ? speciesId : -1, species.common_name);
    } catch (e) {
      console.warn('Analytics trackSpeciesView failed:', e);
    }
    navigate(`/species/${species.row_index}`);
  };

  const dietLabel = (diet: string | null) => {
    if (diet === 'Carnivore') return t('catalog.diet.carnivore');
    if (diet === 'Herbivore') return t('catalog.diet.herbivore');
    if (diet === 'Omnivore') return t('catalog.diet.omnivore');
    return '—';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— {t('editorial.loadingArchive')}</div>
          <DinoLoader size="lg" label={t('catalog.loading')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           HEADER — wall plaque
           ============================================================ */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('editorial.rooms.catalog')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">
              {total} {t('editorial.specimensOnRecord')}
            </div>
          </div>

          <div className="grid gap-y-4 gap-x-12 lg:grid-cols-12">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('catalog.title')}
            </h1>
            <p className="lg:col-span-5 lg:pt-3 max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed">
              {t('catalog.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
           FILTER RAIL — hairline-bound, no card chrome
           ============================================================ */}
      <section className="hairline-t hairline-b">
        <div className="container-editorial py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder={t('catalog.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-full bg-surface-1 border-foreground/10"
              />
            </div>

            <div className="md:col-span-3">
              <Select value={dietFilter} onValueChange={(value) => handleFilterChange('diet', value)}>
                <SelectTrigger className="h-11 rounded-full bg-surface-1 border-foreground/10">
                  <SelectValue placeholder={t('catalog.filters.diet')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.filters.allDiets')}</SelectItem>
                  <SelectItem value="Carnivore">{t('catalog.diet.carnivore')}</SelectItem>
                  <SelectItem value="Herbivore">{t('catalog.diet.herbivore')}</SelectItem>
                  <SelectItem value="Omnivore">{t('catalog.diet.omnivore')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Select value={livedInFilter} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="h-11 rounded-full bg-surface-1 border-foreground/10">
                  <SelectValue placeholder={t('catalog.filters.location')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.filters.allLocations')}</SelectItem>
                  <SelectItem value="North America">{t('catalog.locations.north_america')}</SelectItem>
                  <SelectItem value="South America">{t('catalog.locations.south_america')}</SelectItem>
                  <SelectItem value="Europe">{t('catalog.locations.europe')}</SelectItem>
                  <SelectItem value="Asia">{t('catalog.locations.asia')}</SelectItem>
                  <SelectItem value="Africa">{t('catalog.locations.africa')}</SelectItem>
                  <SelectItem value="Australia">{t('catalog.locations.australia')}</SelectItem>
                  <SelectItem value="Antarctica">{t('catalog.locations.antarctica')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1 flex md:justify-end">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-caption text-jade flex items-center gap-2 hover:text-foreground transition-colors duration-300"
              >
                <Filter className="w-3.5 h-3.5" />
                {t('catalog.filters.advanced')} {showAdvancedFilters ? '−' : '+'}
              </button>
              <span className="text-caption text-foreground/30">/</span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-caption text-foreground/50 hover:text-jade transition-colors duration-300"
              >
                {t('catalog.filters.clear')}
              </button>
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="mt-8 pt-8 hairline-t grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <PeriodTimeline
                  selectedPeriod={periodFilter}
                  onPeriodChange={(period) => handleFilterChange('period', period)}
                />
              </div>
              <div>
                <SizeFilter
                  lengthRange={lengthRange}
                  onLengthRangeChange={setLengthRange}
                  heightRange={heightRange}
                  onHeightRangeChange={setHeightRange}
                  onReset={resetSizeFilters}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
           META BAR — result count + density controls
           ============================================================ */}
      <section className="py-6">
        <div className="container-editorial flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-foreground/50">
            {t('catalog.pagination.showing')} {Math.min(itemsPerPage, filteredSpecies.length)} {t('catalog.pagination.of')} {total} {t('catalog.pagination.species')} · {t('catalog.pagination.page')} {currentPage}/{totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-caption text-foreground/40">{t('catalog.pagination.perPage')}</span>
              <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-[78px] h-9 rounded-full bg-surface-1 border-foreground/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-foreground/40">{t('catalog.pagination.grid')}</span>
              <Select value={gridCols} onValueChange={(v) => setGridCols(v as any)}>
                <SelectTrigger className="w-[78px] h-9 rounded-full bg-surface-1 border-foreground/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           SPECIES GRID — plate-style cards
           ============================================================ */}
      <section className="pb-32">
        <div className="container-editorial">
          <div
            className={
              gridCols === '2'
                ? 'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10'
                : gridCols === '3'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'
                  : gridCols === '5'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 lg:gap-6'
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7'
            }
          >
            {filteredSpecies.map((dino) => (
              <article key={dino.row_index} className="group relative flex flex-col">
                <button
                  type="button"
                  onClick={() => handleSpeciesClick(dino)}
                  className="absolute inset-0 z-20 cursor-pointer rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`${t('catalog.viewSpecies', { name: dino.common_name || '' })}`}
                />

                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-foreground/8 mb-5 bg-surface-1">
                  {dino.image_url ? (
                    <SmartImage
                      src={dino.image_url}
                      alt={dino.scientific_name || dino.common_name || t('editorial.dinosaurAlt')}
                      className="absolute inset-0 w-full h-full"
                      skeletonClassName="rounded-3xl"
                      imgClassName="object-cover w-full h-full img-duotone-hover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-caption text-foreground/30">
                      no plate
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                    {dino.geological_period || '—'}
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="font-display text-xl tracking-[-0.025em] text-foreground transition-colors duration-300 ease-spring group-hover:text-jade">
                    {dino.common_name}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-widest text-jade">
                    {dietLabel(dino.diet)}
                  </span>
                </div>
                <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mb-3 italic">
                  {dino.scientific_name}
                </p>
                <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2 mb-4">
                  {dino.meaning}{dino.behavior_notes ? ` — ${dino.behavior_notes}` : ''}
                </p>

                <dl className="mt-auto pt-4 hairline-t grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-caption text-foreground/40 mb-0.5">L</dt>
                    <dd className="font-display text-foreground tracking-tight">
                      {dino.length_m ? `${dino.length_m}m` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-foreground/40 mb-0.5">H</dt>
                    <dd className="font-display text-foreground tracking-tight">
                      {dino.height_m ? `${dino.height_m}m` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-foreground/40 mb-0.5">Wt</dt>
                    <dd className="font-display text-foreground tracking-tight">
                      {dino.weight_kg ? `${dino.weight_kg}kg` : '—'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-20 pt-10 hairline-t flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && <PaginationEllipsis />}
                    </>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => page >= currentPage - 2 && page <= currentPage + 2)
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <PaginationEllipsis />}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filteredSpecies.length === 0 && !loading && (
            <div className="py-24 text-center">
              <div className="text-caption text-jade mb-4">— No specimens match</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-4">
                {t('catalog.noResults.title')}
              </h3>
              <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">
                {t('catalog.noResults.subtitle')}
              </p>
              <Button onClick={clearFilters} variant="outline" size="lg">
                {t('catalog.noResults.action')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}