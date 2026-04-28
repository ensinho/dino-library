import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DinoLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Zap, 
  MapPin, 
  Shield, 
  Skull, 
  Mountain,
  ArrowRight,
  TrendingUp,
  Globe,
  Award
} from 'lucide-react';
import { dinosaurService, DinosaurSpecies } from '@/services/dinosaurService';
import { useAnalytics } from '@/services/analyticsService';

interface ThematicGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  filter: (species: DinosaurSpecies[]) => DinosaurSpecies[];
}

export default function Discover() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const analytics = useAnalytics();
  
  const [loading, setLoading] = useState(true);
  const [allSpecies, setAllSpecies] = useState<DinosaurSpecies[]>([]);
  const [activeGroup, setActiveGroup] = useState('giants');

  useEffect(() => {
    fetchAllSpecies();
    analytics.trackPageView('/discover');
  }, []);

  const fetchAllSpecies = async () => {
    try {
      setLoading(true);
      // Fetch a large number to get all species for filtering
      const response = await dinosaurService.getDinosaurs({ limit: 1000 });
      setAllSpecies(response.data);
    } catch (error) {
      console.error('Error fetching species:', error);
    } finally {
      setLoading(false);
    }
  };

  const thematicGroups: ThematicGroup[] = [
    {
      id: 'giants',
      title: t('discover.groups.giants.title'),
      description: t('discover.groups.giants.description'),
      icon: <Crown className="h-6 w-6" />,
      color: 'from-yellow-500 to-orange-500',
      filter: (species) => species
        .filter(s => s.length_m && s.length_m > 15)
        .sort((a, b) => (b.length_m || 0) - (a.length_m || 0))
        .slice(0, 8)
    },
    {
      id: 'predators',
      title: t('discover.groups.predators.title'),
      description: t('discover.groups.predators.description'),
      icon: <Zap className="h-6 w-6" />,
      color: 'from-red-500 to-pink-500',
      filter: (species) => species
        .filter(s => s.diet === 'Carnivore' && s.notable_features?.toLowerCase().includes('fast'))
        .slice(0, 8)
    },
    {
      id: 'brazil',
      title: t('discover.groups.brazil.title'),
      description: t('discover.groups.brazil.description'),
      icon: <MapPin className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      filter: (species) => species
        .filter(s => s.lived_in?.toLowerCase().includes('brazil') || 
                     s.lived_in?.toLowerCase().includes('south america') ||
                     s.fossil_location?.toLowerCase().includes('brazil'))
        .slice(0, 8)
    },
    {
      id: 'armored',
      title: t('discover.groups.armored.title'),
      description: t('discover.groups.armored.description'),
      icon: <Shield className="h-6 w-6" />,
      color: 'from-jade to-jade/60',
      filter: (species) => species
        .filter(s => s.notable_features?.toLowerCase().includes('armor') ||
                     s.notable_features?.toLowerCase().includes('spikes') ||
                     s.notable_features?.toLowerCase().includes('plates') ||
                     s.notable_features?.toLowerCase().includes('horn'))
        .slice(0, 8)
    },
    {
      id: 'rare',
      title: t('discover.groups.rare.title'),
      description: t('discover.groups.rare.description'),
      icon: <Skull className="h-6 w-6" />,
      color: 'from-purple-500 to-violet-500',
      filter: (species) => species
        .filter(s => s.intelligence_level === 'High' || 
                     s.first_discovered && parseInt(s.first_discovered) > 2000)
        .slice(0, 8)
    },
    {
      id: 'aerial',
      title: t('discover.groups.aerial.title'),
      description: t('discover.groups.aerial.description'),
      icon: <Mountain className="h-6 w-6" />,
      color: 'from-jade to-jade/60',
      filter: (species) => species
        .filter(s => s.locomotion?.toLowerCase().includes('flying') ||
                     s.locomotion?.toLowerCase().includes('gliding') ||
                     s.notable_features?.toLowerCase().includes('wing'))
        .slice(0, 8)
    }
  ];

  const handleSpeciesClick = (species: DinosaurSpecies) => {
    analytics.trackSpeciesView(species.row_index, species.common_name);
    analytics.track('discover_species_click', { 
      species_id: species.row_index,
      group: activeGroup 
    });
    navigate(`/species/${species.row_index}`);
  };

  const handleViewAllClick = (groupId: string) => {
    analytics.track('discover_view_all_click', { group: groupId });
    navigate(`/catalog?group=${groupId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— {t('editorial.curating')}</div>
          <DinoLoader size="lg" label={t('discover.loading')} />
        </div>
      </div>
    );
  }

  const activeGroupData = thematicGroups.find(g => g.id === activeGroup);
  const filteredSpecies = activeGroupData ? activeGroupData.filter(allSpecies) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('editorial.rooms.discover')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{thematicGroups.length} {t('editorial.routes')}</div>
          </div>
          <div className="grid gap-y-4 gap-x-12 lg:grid-cols-12">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('discover.title')}
            </h1>
            <p className="lg:col-span-5 lg:pt-3 max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed">
              {t('discover.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* THEME PICKER */}
      <section className="hairline-t hairline-b py-6 sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <div className="container-editorial">
          <div className="flex flex-wrap gap-2">
            {thematicGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                  activeGroup === group.id
                    ? 'bg-jade text-canvas ring-jade'
                    : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
                }`}
              >
                <span className={activeGroup === group.id ? 'text-canvas' : 'text-jade'}>{group.icon}</span>
                {group.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* THEME OVERVIEW + GRID */}
      <section className="py-16">
        <div className="container-editorial">
          {activeGroupData && (
            <div className="grid lg:grid-cols-12 gap-y-6 gap-x-12 mb-16">
              <div className="lg:col-span-2">
                <div className="text-jade">{activeGroupData.icon}</div>
              </div>
              <div className="lg:col-span-7">
                <h2 className="font-display text-display-xl text-foreground tracking-tighter mb-4">
                  {activeGroupData.title}
                </h2>
                <p className="text-foreground/70 leading-relaxed text-lg max-w-[60ch]">
                  {activeGroupData.description}
                </p>
              </div>
              <div className="lg:col-span-3 lg:pt-3 flex flex-col gap-3 text-caption text-foreground/55">
                <div className="hairline-t pt-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-jade" />{t('discover.speciesFound')}</span>
                  <span className="font-mono text-foreground">{filteredSpecies.length}</span>
                </div>
                <div className="hairline-t pt-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Globe className="w-3 h-3 text-jade" />{t('discover.worldwide')}</span>
                  <span className="font-mono text-foreground/60">·</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewAllClick(activeGroupData.id)}
                  className="hairline-t pt-3 text-left text-caption text-jade hover:text-foreground transition-colors duration-300 inline-flex items-center gap-2"
                >
                  {t('discover.viewAll')}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* SPECIES GRID */}
          {filteredSpecies.length > 0 ? (
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filteredSpecies.map((species, index) => (
                <li key={species.row_index}>
                  <article className="group relative">
                    <button
                      type="button"
                      onClick={() => handleSpeciesClick(species)}
                      className="absolute inset-0 z-10"
                      aria-label={species.common_name || 'Open species'}
                    />
                    <figure className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-1 ring-1 ring-foreground/8 mb-4">
                      {species.image_url ? (
                        <img
                          src={species.image_url}
                          alt={species.scientific_name || species.common_name || t('editorial.dinosaurAlt')}
                          className="absolute inset-0 w-full h-full object-cover img-duotone-hover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
                      )}
                      {(activeGroup === 'giants' || activeGroup === 'predators') && index < 3 && (
                        <div className="absolute top-3 left-3 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-2.5 py-1 rounded-full ring-1 ring-foreground/10 flex items-center gap-1.5">
                          <Award className="w-3 h-3 text-jade" />
                          Nº {index + 1}
                        </div>
                      )}
                      {species.geological_period && (
                        <div className="absolute bottom-3 left-3 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-2.5 py-1 rounded-full ring-1 ring-foreground/10">
                          {species.geological_period}
                        </div>
                      )}
                    </figure>
                    <div>
                      <h3 className="font-display text-lg tracking-[-0.025em] text-foreground transition-colors duration-300 group-hover:text-jade truncate">
                        {species.common_name || t('editorial.unknownSpecies')}
                      </h3>
                      <p className="font-mono text-xs italic text-foreground/50 truncate mt-0.5">
                        {species.scientific_name}
                      </p>
                      <div className="hairline-t mt-3 pt-3 flex items-center justify-between text-caption text-foreground/55">
                        <span>{dietLabel(species.diet)}</span>
                        {activeGroup === 'giants' && species.length_m && (
                          <span className="font-mono text-foreground/70">{species.length_m} m</span>
                        )}
                        {activeGroup === 'brazil' && species.fossil_location && (
                          <span className="text-foreground/50 truncate max-w-[60%] text-right">{species.fossil_location}</span>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className="py-24 text-center">
              <div className="text-caption text-jade mb-4">— Empty case</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                {t('discover.noSpecies.title')}
              </h3>
              <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">{t('discover.noSpecies.subtitle')}</p>
              <Button onClick={() => navigate('/catalog')} variant="outline" size="lg">
                {t('discover.noSpecies.action')}
              </Button>
            </div>
          )}

          {/* CTA */}
          {filteredSpecies.length > 0 && activeGroupData && (
            <div className="hairline-t mt-20 pt-16 grid lg:grid-cols-12 gap-y-6 gap-x-12 items-center">
              <div className="lg:col-span-7">
                <div className="text-caption text-jade mb-3">— Continue</div>
                <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                  {t('discover.cta.title')}
                </h3>
                <p className="text-foreground/65 max-w-[55ch] leading-relaxed">{t('discover.cta.description')}</p>
              </div>
              <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button onClick={() => handleViewAllClick(activeGroupData.id)} className="bg-jade text-canvas hover:bg-jade/90">
                  {t('discover.cta.viewAll')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/catalog')}>
                  {t('discover.cta.exploreAll')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const dietLabel = (diet: string | null): string => {
  switch (diet) {
    case 'Carnivore': return 'Carnivore';
    case 'Herbivore': return 'Herbivore';
    case 'Omnivore': return 'Omnivore';
    default: return diet || '—';
  }
};
