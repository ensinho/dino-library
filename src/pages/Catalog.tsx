import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  const getDietIcon = (diet: string | null) => {
    switch (diet) {
      case 'Carnivore': return '🥩';
      case 'Herbivore': return '🌿';
      case 'Omnivore': return '🍽️';
      default: return '❓';
    }
  };

  const getDietColor = (diet: string | null) => {
    switch (diet) {
      case 'Carnivore': return 'bg-destructive';
      case 'Herbivore': return 'bg-forest-green';
      case 'Omnivore': return 'bg-amber';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🦕🦴</div>
          <div className="text-xl text-muted-foreground">{t('catalog.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-amber bg-clip-text text-transparent">{t('catalog.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('catalog.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-6 mb-8">
          {/* Basic Filters Row */}
          <div className="bg-card rounded-xl shadow-fossil p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('catalog.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={dietFilter} onValueChange={(value) => handleFilterChange('diet', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('catalog.filters.diet')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('catalog.filters.allDiets')}</SelectItem>
                  <SelectItem value="Carnivore">{t('catalog.diet.carnivore')}</SelectItem>
                  <SelectItem value="Herbivore">{t('catalog.diet.herbivore')}</SelectItem>
                  <SelectItem value="Omnivore">{t('catalog.diet.omnivore')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={livedInFilter} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger>
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

              <LanguageSwitcher />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>{t('catalog.filters.advanced')}</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center space-x-2"
                >
                  <span>{t('catalog.filters.clear')}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-card rounded-xl shadow-fossil p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Period Timeline */}
                <div>
                  <PeriodTimeline 
                    selectedPeriod={periodFilter}
                    onPeriodChange={(period) => handleFilterChange('period', period)}
                  />
                </div>

                {/* Size Filter */}
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
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground">
              {t('catalog.pagination.showing')} {Math.min(itemsPerPage, filteredSpecies.length)} {t('catalog.pagination.of')} {total} {t('catalog.pagination.species')}
              ({t('catalog.pagination.page')} {currentPage} {t('catalog.pagination.of')} {totalPages})
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('catalog.pagination.perPage')}</span>
                <Select
                  value={String(itemsPerPage)}
                  onValueChange={(v) => setItemsPerPage(Number(v))}
                >
                  <SelectTrigger className="w-[92px]">
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

              {/* Grid density */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('catalog.pagination.grid')}</span>
                <Select value={gridCols} onValueChange={(v) => setGridCols(v as any)}>
                  <SelectTrigger className="w-[92px]">
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
        </div>

        {/* Species Grid */}
        <div
          className={
            gridCols === '2'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-8'
              : gridCols === '3'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                : gridCols === '5'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
          }
        >
          {filteredSpecies.map((dino) => (
            <Card
              key={dino.row_index}
              className="group relative hover:shadow-fossil transition-all duration-300 hover:-translate-y-2"
            >
              {/* Full-card clickable overlay (prevents inner elements/overlays from swallowing click) */}
              <button
                type="button"
                onClick={() => handleSpeciesClick(dino)}
                className="absolute inset-0 z-10 cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`${t('catalog.viewSpecies', { name: dino.common_name || '' })}`}
              />

              {dino.image_url && (
                <div className="h-48 w-full overflow-hidden rounded-t-xl bg-muted flex items-center justify-center">
                  <SmartImage
                    src={dino.image_url}
                    alt={dino.scientific_name || dino.common_name || 'Dinosaur'}
                    className="w-full h-full"
                    skeletonClassName="rounded-none"
                    imgClassName="object-cover w-full h-full rounded-none transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                  <CardTitle className="text-xl mb-1">{dino.common_name}</CardTitle>
                    <CardDescription className="italic text-amber">
                      {dino.scientific_name}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {dino.geological_period}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Badge className={`${getDietColor(dino.diet)} text-white`}>
                    {getDietIcon(dino.diet)} {dino.diet === 'Carnivore' ? t('catalog.diet.carnivore') :
                     dino.diet === 'Herbivore' ? t('catalog.diet.herbivore') : t('catalog.diet.omnivore')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                 {dino.meaning} - {dino.behavior_notes}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-amber" />
                      <span>{t('catalog.stats.length')}: {dino.length_m ? `${dino.length_m}${t('catalog.stats.meters')}` : t('catalog.stats.unknown')}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Ruler className="w-4 h-4 text-amber" />
                      <span>{t('catalog.stats.height')}: {dino.height_m ? `${dino.height_m}${t('catalog.stats.meters')}` : t('catalog.stats.unknown')}</span>
                    </div>
                    
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Weight className="w-4 h-4 text-amber" />
                      <span>{t('catalog.stats.weight')}: {dino.weight_kg ? `${dino.weight_kg}${t('catalog.stats.kilograms')}` : t('catalog.stats.unknown')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-amber" />
                      <span>{t('catalog.stats.found')}: {dino.first_discovered || t('catalog.stats.unknown')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber" />
                    <span>{dino.lived_in || t('catalog.stats.unknown')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Bone className="w-4 h-4 text-amber" />
                    <span>{dino.fossil_location || t('catalog.stats.unknown')}</span>
                  </div>
                  </div>
                </div>

                {dino.notable_features && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium text-amber mb-2">Notable Feature:</h4>
                    <p className="text-xs text-muted-foreground">
                      {dino.notable_features}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
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
                
                {/* First page */}
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
                
                {/* Nearby pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
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
                
                {/* Last page */}
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
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('catalog.noResults.title')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('catalog.noResults.subtitle')}
            </p>
            <Button onClick={clearFilters} variant="outline">
              {t('catalog.noResults.action')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}