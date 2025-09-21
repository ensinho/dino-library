import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
      color: 'from-blue-500 to-cyan-500',
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
      color: 'from-sky-500 to-blue-500',
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
          <div className="text-6xl mb-4 animate-bounce">🔍</div>
          <div className="text-xl text-muted-foreground">{t('discover.loading')}</div>
        </div>
      </div>
    );
  }

  const activeGroupData = thematicGroups.find(g => g.id === activeGroup);
  const filteredSpecies = activeGroupData ? activeGroupData.filter(allSpecies) : [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="bg-gradient-amber bg-clip-text text-transparent">{t('discover.title')}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('discover.subtitle')}
          </p>
        </div>

        {/* Thematic Groups Tabs */}
        <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {thematicGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id} className="flex flex-col items-center gap-1 p-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${group.color} text-white`}>
                  {group.icon}
                </div>
                <span className="text-xs text-center leading-tight">{group.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {thematicGroups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="mt-6">
              {/* Group Header */}
              <Card className={`mb-8 bg-gradient-to-r ${group.color} text-white border-none`}>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    {group.icon}
                    <span className="ml-3">{group.title}</span>
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg">
                    {group.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        <span>{filteredSpecies.length} {t('discover.speciesFound')}</span>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2" />
                        <span>{t('discover.worldwide')}</span>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleViewAllClick(group.id)}
                      className="text-black"
                    >
                      {t('discover.viewAll')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Species Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSpecies.map((species, index) => (
                  <Card
                    key={species.row_index}
                    className="group hover:shadow-fossil transition-all duration-300 hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                    onClick={() => handleSpeciesClick(species)}
                  >
                    {/* Ranking Badge for some categories */}
                    {(group.id === 'giants' || group.id === 'predators') && index < 3 && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge className="bg-amber text-black font-bold flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          #{index + 1}
                        </Badge>
                      </div>
                    )}

                    {species.image_url && (
                      <div className="h-48 w-full overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={species.image_url}
                          alt={species.scientific_name || species.common_name || 'Dinosaur'}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1 line-clamp-1">
                            {species.common_name || 'Unknown Species'}
                          </CardTitle>
                          <CardDescription className="italic text-amber line-clamp-1">
                            {species.scientific_name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          {species.geological_period}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`${getDietColor(species.diet)} text-white text-xs`}>
                          {getDietIcon(species.diet)} {species.diet}
                        </Badge>
                        {species.length_m && group.id === 'giants' && (
                          <Badge variant="outline" className="text-xs">
                            {species.length_m}m
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {species.behavior_notes || species.notable_features || t('discover.noDescription')}
                      </p>
                      
                      {/* Special stats for certain groups */}
                      {group.id === 'giants' && species.length_m && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center text-sm">
                            <Crown className="h-4 w-4 text-amber mr-1" />
                            <span className="font-semibold">{species.length_m}m</span>
                            <span className="text-muted-foreground ml-1">{t('discover.length')}</span>
                          </div>
                        </div>
                      )}
                      
                      {group.id === 'brazil' && species.fossil_location && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-muted-foreground line-clamp-1">
                              {species.fossil_location}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {filteredSpecies.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t('discover.noSpecies.title')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('discover.noSpecies.subtitle')}
                  </p>
                  <Button onClick={() => navigate('/catalog')} variant="outline">
                    {t('discover.noSpecies.action')}
                  </Button>
                </div>
              )}

              {/* Call to Action */}
              {filteredSpecies.length > 0 && (
                <div className="mt-12 text-center">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-2">{t('discover.cta.title')}</h3>
                      <p className="text-muted-foreground mb-4">{t('discover.cta.description')}</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => handleViewAllClick(group.id)}>
                          {t('discover.cta.viewAll')}
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/catalog')}>
                          {t('discover.cta.exploreAll')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}