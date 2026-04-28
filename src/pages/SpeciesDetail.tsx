import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DinoLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpeciesGallery from '@/components/SpeciesGallery';
import { 
  ArrowLeft, 
  Ruler, 
  Calendar, 
  MapPin, 
  Weight, 
  Bone, 
  Heart,
  Eye,
  Mountain,
  Trees,
  BookOpen,
  Share2,
  Camera
} from 'lucide-react';
import { dinosaurService, DinosaurSpecies } from '@/services/dinosaurService';
import { useAnalytics } from '@/services/analyticsService';

export default function SpeciesDetail() {
  const { dinoId } = useParams<{ dinoId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const analytics = useAnalytics();
  
  const [species, setSpecies] = useState<DinosaurSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (dinoId) {
      fetchSpeciesDetail(dinoId);
      analytics.trackPageView(`/species/${dinoId}`);
    }
  }, [dinoId]);

  const fetchSpeciesDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dinosaurService.getDinosaurById(id);
      setSpecies(data);
      analytics.trackSpeciesView(data.row_index, data.common_name || data.scientific_name || 'Unknown');
    } catch (error) {
      console.error('Error fetching species detail:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch species details');
      analytics.trackError(error instanceof Error ? error : new Error('Failed to fetch species details'));
    } finally {
      setLoading(false);
    }
  };

  const getDietIcon = (diet: string | null) => {
    switch (diet) {
      case 'Carnivore': return 'ðŸ¥©';
      case 'Herbivore': return 'ðŸŒ¿';
      case 'Omnivore': return 'ðŸ½ï¸';
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

  const getPeriodEmoji = (period: string | null) => {
    switch (period?.toLowerCase()) {
      case 'triassic': return 'ðŸŒ‹';
      case 'jurassic': return 'ðŸŒ²';
      case 'cretaceous': return 'ðŸŒº';
      default: return 'ðŸ¦•';
    }
  };

  const shareSpecies = async () => {
    if (navigator.share && species) {
      try {
        await navigator.share({
          title: `${species.common_name || species.scientific_name} - Dino Library`,
          text: `Descubra mais sobre ${species.common_name || species.scientific_name} na Dino Library!`,
          url: window.location.href,
        });
        analytics.track('species_shared', { species_id: species.row_index });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      analytics.track('species_link_copied', { species_id: species?.row_index });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— {t('editorial.pullingSpecimen')}</div>
          <DinoLoader size="lg" label={t('species.loading')} />
        </div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-caption text-jade mb-4">— {t('editorial.specimenNotOnFile')}</div>
          <h1 className="font-display text-display-lg text-foreground tracking-tighter mb-4">
            {t('species.notFound.title')}
          </h1>
          <p className="text-foreground/60 mb-8">{error || t('species.notFound.message')}</p>
          <Button onClick={() => navigate('/catalog')} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('species.backToCatalog')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           SPECIMEN FILE HEADER — wall-text layout
           ============================================================ */}
      <section className="pt-12 pb-16">
        <div className="container-editorial">
          {/* Back / Share bar */}
          <div className="flex items-center justify-between mb-12">
            <button
              type="button"
              onClick={() => navigate('/catalog')}
              className="text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('species.backToCatalog')}
            </button>
            <button
              type="button"
              onClick={shareSpecies}
              className="text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center gap-2"
            >
              <Share2 className="h-3.5 w-3.5" />
              {t('species.share')}
            </button>
          </div>

          {/* Top label bar */}
          <div className="flex items-center justify-between mb-8 hairline-b pb-6">
            <div className="text-caption text-jade">— Specimen file · Nº {species.row_index}</div>
            <div className="text-caption text-foreground/40 hidden sm:flex gap-3">
              <span>{species.geological_period || '—'}</span>
              <span className="opacity-30">·</span>
              <span>{species.diet || '—'}</span>
            </div>
          </div>

          {/* Big-plate hero */}
          <div className="grid gap-y-12 gap-x-12 lg:grid-cols-12">
            {/* Plate */}
            <figure className="lg:col-span-7 relative overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1">
              <div className="aspect-[4/5]">
                {species.image_url ? (
                  <img
                    src={species.image_url}
                    alt={species.common_name || species.scientific_name || t('editorial.dinosaurAlt')}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-caption text-foreground/30">{t('species.noImage')}</div>
                  </div>
                )}
              </div>
              <figcaption className="absolute left-5 bottom-5 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                {t('editorial.plate')} · {species.common_name}
              </figcaption>
            </figure>

            {/* Wall text */}
            <div className="lg:col-span-5">
              <h1 className="font-display text-display-xl text-foreground tracking-tighter">
                {species.common_name || t('editorial.unknownSpecies')}
              </h1>
              <p className="mt-3 font-mono text-sm uppercase tracking-widest text-jade italic">
                {species.scientific_name || t('editorial.speciesPlaceholder')}
              </p>

              {species.meaning && (
                <div className="mt-8 hairline-t pt-6">
                  <div className="text-caption text-foreground/40 mb-2 flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t('species.nameOrigin')}
                  </div>
                  <p className="text-foreground/75 leading-relaxed">{species.meaning}</p>
                </div>
              )}

              {species.behavior_notes && (
                <p className="mt-8 text-base md:text-lg text-foreground/65 leading-relaxed">
                  {species.behavior_notes}
                </p>
              )}

              {/* Compact specimen index */}
              <dl className="mt-10 grid grid-cols-3 gap-x-6 gap-y-2 hairline-t pt-6">
                <div>
                  <dt className="text-caption text-foreground/40 mb-1">Length</dt>
                  <dd className="font-display text-2xl text-foreground tracking-tight">
                    {species.length_m ? `${species.length_m}m` : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-foreground/40 mb-1">Height</dt>
                  <dd className="font-display text-2xl text-foreground tracking-tight">
                    {species.height_m ? `${species.height_m}m` : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-foreground/40 mb-1">Weight</dt>
                  <dd className="font-display text-2xl text-foreground tracking-tight">
                    {species.weight_kg ? `${species.weight_kg}kg` : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           CONTENT TABS
           ============================================================ */}
      <section className="pb-32">
        <div className="container-editorial">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto gap-1 hairline-b w-full justify-start rounded-none">
              {[
                { v: 'overview', label: t('species.tabs.overview') },
                { v: 'gallery', label: t('species.tabs.gallery') },
                { v: 'anatomy', label: t('species.tabs.anatomy') },
                { v: 'ecology', label: t('species.tabs.ecology') },
                { v: 'discovery', label: t('species.tabs.discovery') }
              ].map(tab => (
                <TabsTrigger
                  key={tab.v}
                  value={tab.v}
                  className="rounded-none px-4 py-3 text-caption text-foreground/50 data-[state=active]:bg-transparent data-[state=active]:text-jade data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-jade -mb-px"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="mt-12">
              <div className="grid gap-12 lg:gap-16 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <div className="text-caption text-jade mb-4 flex items-center gap-2">
                    <Bone className="h-3.5 w-3.5" />
                    {t('species.factFile.title')}
                  </div>
                  <dl className="divide-y divide-foreground/8">
                    {[
                      { icon: Ruler, label: t('species.factFile.length'), value: species.length_m ? `${species.length_m}m` : '—' },
                      { icon: Ruler, label: t('species.factFile.height'), value: species.height_m ? `${species.height_m}m` : '—' },
                      { icon: Weight, label: t('species.factFile.weight'), value: species.weight_kg ? `${species.weight_kg}kg` : '—' },
                      { icon: Heart, label: t('species.factFile.diet'), value: species.diet || '—' },
                      { icon: Bone, label: t('species.factFile.locomotion'), value: species.locomotion || '—' },
                      { icon: Eye, label: t('species.factFile.intelligence'), value: species.intelligence_level || '—' }
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-12 items-baseline gap-3 py-4">
                        <dt className="col-span-7 flex items-center gap-2 text-caption text-foreground/55">
                          <row.icon className="h-3.5 w-3.5 text-jade" strokeWidth={1.5} />
                          {row.label}
                        </dt>
                        <dd className="col-span-5 text-right font-display text-base text-foreground tracking-tight">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="lg:col-span-7 space-y-12">
                  {species.diet && (
                    <div>
                      <div className="text-caption text-jade mb-4">— {t('species.diet.title')}</div>
                      <p className="text-foreground/75 leading-relaxed">
                        {species.diet === 'Carnivore' && t('species.diet.carnivore')}
                        {species.diet === 'Herbivore' && t('species.diet.herbivore')}
                        {species.diet === 'Omnivore' && t('species.diet.omnivore')}
                      </p>
                    </div>
                  )}

                  {species.notable_features && (
                    <div className="hairline-t pt-12">
                      <div className="text-caption text-jade mb-4 flex items-center gap-2">
                        <Eye className="h-3.5 w-3.5" />
                        {t('species.features.title')}
                      </div>
                      <p className="text-foreground/75 leading-relaxed">
                        {species.notable_features}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Gallery */}
            <TabsContent value="gallery" className="mt-12">
              <div className="text-caption text-jade mb-4 flex items-center gap-2">
                <Camera className="h-3.5 w-3.5" />
                {t('species.gallery.title')}
              </div>
              <p className="text-foreground/60 mb-10 max-w-[60ch]">
                {t('species.gallery.description')}
              </p>
              <SpeciesGallery species={species} />
            </TabsContent>

            {/* Anatomy */}
            <TabsContent value="anatomy" className="mt-12">
              <div className="text-caption text-jade mb-4">— {t('species.anatomy.title')}</div>
              <p className="text-foreground/60 mb-10 max-w-[60ch]">{t('species.anatomy.description')}</p>
              <div className="grid gap-12 md:grid-cols-2">
                <div>
                  <h4 className="font-display text-xl tracking-[-0.025em] text-foreground mb-6">{t('species.anatomy.physicalCharacteristics')}</h4>
                  <dl className="divide-y divide-foreground/8">
                    {[
                      [t('species.factFile.length'), species.length_m ? `${species.length_m}m` : '—'],
                      [t('species.factFile.height'), species.height_m ? `${species.height_m}m` : '—'],
                      [t('species.factFile.weight'), species.weight_kg ? `${species.weight_kg}kg` : '—'],
                      [t('species.factFile.locomotion'), species.locomotion || '—']
                    ].map(([label, value], i) => (
                      <div key={i} className="grid grid-cols-2 py-3 text-sm">
                        <dt className="text-foreground/50">{label}</dt>
                        <dd className="text-right font-display text-foreground tracking-tight">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {species.notable_features && (
                  <div>
                    <h4 className="font-display text-xl tracking-[-0.025em] text-foreground mb-6">{t('species.anatomy.specialFeatures')}</h4>
                    <p className="text-foreground/70 leading-relaxed">{species.notable_features}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Ecology */}
            <TabsContent value="ecology" className="mt-12">
              <div className="grid gap-12 lg:grid-cols-2">
                <div>
                  <div className="text-caption text-jade mb-4 flex items-center gap-2">
                    <Mountain className="h-3.5 w-3.5" />
                    {t('species.ecology.environment')}
                  </div>
                  <dl className="divide-y divide-foreground/8">
                    <div className="grid grid-cols-2 py-3 text-sm">
                      <dt className="text-foreground/50">{t('species.ecology.period')}</dt>
                      <dd className="text-right font-display text-foreground tracking-tight">{species.geological_period || '—'}</dd>
                    </div>
                    <div className="grid grid-cols-2 py-3 text-sm">
                      <dt className="text-foreground/50">{t('species.ecology.habitat')}</dt>
                      <dd className="text-right font-display text-foreground tracking-tight">{species.lived_in || '—'}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <div className="text-caption text-jade mb-4 flex items-center gap-2">
                    <Trees className="h-3.5 w-3.5" />
                    {t('species.ecology.behavior')}
                  </div>
                  {species.behavior_notes ? (
                    <p className="text-foreground/70 leading-relaxed">{species.behavior_notes}</p>
                  ) : (
                    <p className="text-foreground/40 italic">{t('species.ecology.noBehaviorInfo')}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Discovery */}
            <TabsContent value="discovery" className="mt-12">
              <div className="text-caption text-jade mb-4 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {t('species.discovery.title')}
              </div>
              <div className="grid gap-12 md:grid-cols-2 mt-6">
                <dl className="divide-y divide-foreground/8">
                  <div className="grid grid-cols-2 py-4 text-sm">
                    <dt className="text-foreground/50">{t('species.discovery.firstDiscovered')}</dt>
                    <dd className="text-right font-display text-foreground tracking-tight">{species.first_discovered || '—'}</dd>
                  </div>
                  <div className="grid grid-cols-2 py-4 text-sm">
                    <dt className="text-foreground/50 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {t('species.discovery.fossilLocation')}
                    </dt>
                    <dd className="text-right font-display text-foreground tracking-tight">{species.fossil_location || '—'}</dd>
                  </div>
                </dl>
                {species.source_link && (
                  <div>
                    <div className="text-caption text-foreground/40 mb-3">{t('species.discovery.source')}</div>
                    <Button variant="outline" asChild>
                      <a href={species.source_link} target="_blank" rel="noopener noreferrer">
                        {t('species.discovery.learnMore')}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Related CTA */}
          <div className="mt-24 pt-10 hairline-t flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-caption text-jade mb-3">— {t('species.relatedSpecies.title')}</div>
              <p className="font-display text-display-lg text-foreground tracking-tighter max-w-[20ch]">
                {t('species.relatedSpecies.description')}
              </p>
            </div>
            <Button asChild variant="accent" size="lg">
              <Link to="/catalog">
                {t('species.relatedSpecies.exploreCatalog')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
