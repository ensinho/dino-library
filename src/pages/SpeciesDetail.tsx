import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpeciesGallery from '@/components/SpeciesGallery';
import SpeciesCard from '@/components/SpeciesCard';
import FavoriteButton from '@/components/FavoriteButton';
import SmartImage from '@/components/SmartImage';
import { PageLoader, PageMessage } from '@/components/PageState';
import { useToast } from '@/hooks/use-toast';
import { useAllDinosaurs, useDinosaur, useSpeciesImages } from '@/hooks/useDinosaurs';
import { useDinoLabels } from '@/hooks/useDinoLabels';
import { usePageTitle } from '@/hooks/usePageTitle';
import { dietGroupOf } from '@/lib/taxonomy';
import { displayName, relatedTo } from '@/services/dinosaurService';
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

export default function SpeciesDetail() {
  const { dinoId } = useParams<{ dinoId: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const labels = useDinoLabels();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: species, isPending, isError } = useDinosaur(dinoId);
  const { data: all } = useAllDinosaurs();
  const related = useMemo(() => (species && all ? relatedTo(species, all, 4) : []), [species, all]);
  const relatedImages = useSpeciesImages(related);
  const heroImages = useSpeciesImages(useMemo(() => (species ? [species] : []), [species]));
  usePageTitle(species ? displayName(species) : undefined);

  const shareSpecies = async () => {
    if (!species) return;
    const name = displayName(species);
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} · Dino Library`, text: t('species.shareText', { name }), url });
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t('species.linkCopied') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  if (isPending) {
    return <PageLoader caption={t('editorial.pullingSpecimen')} label={t('species.loading')} />;
  }

  if (isError || !species) {
    return (
      <PageMessage
        caption={t('editorial.specimenNotOnFile')}
        title={t('species.notFound.title')}
        message={t('species.notFound.message')}
        action={
          <Button asChild variant="outline" size="lg">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('species.backToCatalog')}
            </Link>
          </Button>
        }
      />
    );
  }

  const name = displayName(species);
  const heroImage = heroImages[species.row_index] ?? species.image_url;
  const dietGroup = dietGroupOf(species.diet);
  const metric = (value: number | null, unit: string) => (value ? `${value.toLocaleString()} ${unit}` : '—');

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           SPECIMEN FILE HEADER — wall-text layout
           ============================================================ */}
      <section className="pt-8 pb-12">
        <div className="container-editorial">
          {/* Back / Share bar */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/catalog"
              className="text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('species.backToCatalog')}
            </Link>
            <div className="flex items-center gap-6">
              <FavoriteButton speciesId={species.row_index} name={name} variant="inline" />
              <button
                type="button"
                onClick={shareSpecies}
                className="text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center gap-2"
              >
                <Share2 className="h-3.5 w-3.5" />
                {t('species.share')}
              </button>
            </div>
          </div>

          {/* Top label bar */}
          <div className="flex items-center justify-between mb-6 hairline-b pb-4">
            <div className="text-caption text-jade">— {t('editorial.specimenFile')} · Nº {species.row_index}</div>
            <div className="text-caption text-foreground/40 hidden sm:flex gap-3">
              <span>{labels.period(species.geological_period)}</span>
              <span className="opacity-30">·</span>
              <span>{labels.diet(species.diet)}</span>
            </div>
          </div>

          {/* Big-plate hero */}
          <div className="grid gap-y-10 gap-x-12 lg:grid-cols-12 items-start">
            {/* Plate */}
            <figure className="lg:col-span-7 relative overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1">
              <div className="aspect-[16/11]">
                {heroImage ? (
                  <SmartImage
                    src={heroImage}
                    alt={name || t('editorial.dinosaurAlt')}
                    className="absolute inset-0 w-full h-full rounded-none ring-0"
                    imgClassName="object-cover w-full h-full"
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-caption text-foreground/30">{t('species.noImage')}</div>
                  </div>
                )}
              </div>
              <figcaption className="absolute left-4 bottom-4 z-10 text-caption text-foreground/85 bg-background/70 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10">
                {t('editorial.plate')} · {name}
              </figcaption>
            </figure>

            {/* Wall text */}
            <div className="lg:col-span-5">
              <h1 className="font-display text-display-xl text-foreground tracking-tighter">
                {name || t('editorial.unknownSpecies')}
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
              <dl className="mt-8 grid grid-cols-3 gap-x-6 gap-y-2 hairline-t pt-5">
                {[
                  [t('species.factFile.length'), metric(species.length_m, 'm')],
                  [t('species.factFile.height'), metric(species.height_m, 'm')],
                  [t('species.factFile.weight'), metric(species.weight_kg, 'kg')],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-caption text-foreground/40 mb-1">{label}</dt>
                    <dd className="font-display text-lg sm:text-xl text-foreground tracking-tight">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           CONTENT TABS
           ============================================================ */}
      <section className="pb-20">
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
                      { icon: Ruler, label: t('species.factFile.length'), value: metric(species.length_m, 'm') },
                      { icon: Ruler, label: t('species.factFile.height'), value: metric(species.height_m, 'm') },
                      { icon: Weight, label: t('species.factFile.weight'), value: metric(species.weight_kg, 'kg') },
                      { icon: Heart, label: t('species.factFile.diet'), value: labels.diet(species.diet) },
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
                  {dietGroup && (
                    <div>
                      <div className="text-caption text-jade mb-4">— {t('species.diet.title')}</div>
                      <p className="text-foreground/75 leading-relaxed">{t(`species.diet.${dietGroup}`)}</p>
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
                      [t('species.factFile.length'), metric(species.length_m, 'm')],
                      [t('species.factFile.height'), metric(species.height_m, 'm')],
                      [t('species.factFile.weight'), metric(species.weight_kg, 'kg')],
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
                      <dd className="text-right font-display text-foreground tracking-tight">
                        {species.lived_in || '—'}
                        <span className="block text-caption text-foreground/40 mt-1">{labels.region(species.lived_in, species.fossil_location)}</span>
                      </dd>
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

          {/* Related species */}
          <div className="mt-24 pt-10 hairline-t">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <div className="text-caption text-jade mb-3">— {t('species.relatedSpecies.title')}</div>
                <p className="font-display text-display-lg text-foreground tracking-tighter max-w-[20ch]">
                  {t('species.relatedSpecies.description')}
                </p>
              </div>
              <Button asChild variant="accent" size="lg">
                <Link to="/catalog">{t('species.relatedSpecies.exploreCatalog')}</Link>
              </Button>
            </div>
            {related.length > 0 && (
              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {related.map((d) => (
                  <li key={d.row_index}>
                    <SpeciesCard species={d} imageUrl={relatedImages[d.row_index]} variant="compact" />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
