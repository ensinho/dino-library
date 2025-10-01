import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Search, Filter, Eye, Zap, Mountain, Skull, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ArchaeologicalDiscovery {
  id: string;
  title: string;
  description: string;
  location: string;
  discovery_date: string;
  researcher_name?: string;
  organization?: string;
  significance?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

interface GeologicalEvent {
  id: string;
  title: string;
  description: string;
  period: string;
  years_ago: number;
  type: 'period_start' | 'period_end' | 'extinction' | 'climate_change' | 'geological';
  icon: React.ReactNode;
  color: string;
}

export default function Timeline() {
  const { t } = useTranslation();
  const [discoveries, setDiscoveries] = useState<ArchaeologicalDiscovery[]>([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState<ArchaeologicalDiscovery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [visibleItems, setVisibleItems] = useState(6);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('discoveries');

  // Geological events data
  const geologicalEvents: GeologicalEvent[] = [
    {
      id: 'cretaceous_end',
      title: 'End-Cretaceous Mass Extinction',
      description: 'The asteroid impact that ended the age of dinosaurs. A massive asteroid struck Earth, causing global climate change and the extinction of non-avian dinosaurs.',
      period: 'Cretaceous',
      years_ago: 66,
      type: 'extinction',
      icon: <Skull className="w-6 h-6" />,
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 'cretaceous_start',
      title: 'Cretaceous Period Begins',
      description: 'The final period of the Mesozoic Era begins. Flowering plants appear and dinosaurs reach their peak diversity.',
      period: 'Cretaceous',
      years_ago: 145,
      type: 'period_start',
      icon: <Mountain className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'jurassic_start',
      title: 'Jurassic Period Begins',
      description: 'The golden age of dinosaurs begins. Supercontinent Pangaea breaks apart, creating new ocean basins and climate patterns.',
      period: 'Jurassic',
      years_ago: 201,
      type: 'period_start',
      icon: <Globe className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'triassic_jurassic_extinction',
      title: 'Triassic-Jurassic Extinction Event',
      description: 'A major extinction event that eliminated many competitors of dinosaurs, allowing them to become the dominant terrestrial vertebrates.',
      period: 'Triassic',
      years_ago: 201,
      type: 'extinction',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-600 to-red-600'
    },
    {
      id: 'triassic_start',
      title: 'Triassic Period Begins',
      description: 'The first period of the Mesozoic Era. Early dinosaurs evolve and the supercontinent Pangaea dominates Earth\'s geography.',
      period: 'Triassic',
      years_ago: 252,
      type: 'period_start',
      icon: <Mountain className="w-6 h-6" />,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'permian_extinction',
      title: 'Permian-Triassic Extinction',
      description: 'The Great Dying - the most severe mass extinction event in Earth\'s history. Sets the stage for dinosaur evolution.',
      period: 'Permian',
      years_ago: 252,
      type: 'extinction',
      icon: <Skull className="w-6 h-6" />,
      color: 'from-gray-600 to-black'
    }
  ];

  useEffect(() => {
    fetchDiscoveries();
  }, []);

  useEffect(() => {
    filterDiscoveries();
  }, [discoveries, searchTerm, selectedYear]);

  const fetchDiscoveries = async () => {
    try {
      const { data, error } = await supabase
        .from('archaeological_discoveries')
        .select('*')
        .order('discovery_date', { ascending: false });

      if (error) throw error;
      
      setDiscoveries(data || []);
    } catch (error) {
      console.error('Error loading discoveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDiscoveries = () => {
    let filtered = discoveries;

    if (searchTerm) {
      filtered = filtered.filter(discovery =>
        discovery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discovery.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        discovery.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedYear) {
      filtered = filtered.filter(discovery =>
        new Date(discovery.discovery_date).getFullYear().toString() === selectedYear
      );
    }

    setFilteredDiscoveries(filtered);
  };

  const getUniqueYears = () => {
    const years = discoveries.map(discovery => 
      new Date(discovery.discovery_date).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 6, filteredDiscoveries.length));
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="bg-gradient-primary text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber to-amber-glow bg-clip-text text-transparent">
            {t('timeline.title')}
          </h1>
          <p className="text-lg md:text-base text-white/90 max-w-3xl mx-auto">
            {t('timeline.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="discoveries" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('timeline.tabs.discoveries')}
            </TabsTrigger>
            <TabsTrigger value="geological" className="flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              {t('timeline.tabs.geological')}
            </TabsTrigger>
          </TabsList>

          {/* Archaeological Discoveries Tab */}
          <TabsContent value="discoveries">
            <div className="mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('timeline.filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-amber/50"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-card text-foreground transition-all duration-200 hover:border-amber/50 focus:border-amber focus:ring-2 focus:ring-amber/30"
                >
                  <option value="">{t('timeline.filters.allYears')}</option>
                  {getUniqueYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedYear('');
                    setVisibleItems(6);
                  }}
                  className="hover:bg-amber/10 hover:border-amber transition-all duration-200"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t('timeline.filters.clear')}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-amber/30 via-amber/50 to-amber/30"></div>

              <div className="space-y-4">
                {filteredDiscoveries.slice(0, visibleItems).map((discovery, index) => (
                  <div 
                    key={discovery.id} 
                    className="relative group animate-slideInUp"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="absolute left-4 w-4 h-4 bg-gradient-to-r from-amber to-amber-glow rounded-full border-2 border-background shadow-lg group-hover:scale-125 transition-all duration-300 hidden md:block">
                      <div className="absolute inset-0 bg-amber/30 rounded-full animate-ping"></div>
                    </div>

                    <div className="md:ml-12">
                      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-border/50 hover:border-amber/30">
                        <CardHeader className="bg-gradient-to-r from-amber/5 to-forest/5 pb-3 pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2 group-hover:text-amber transition-colors duration-300">
                                {discovery.title}
                              </CardTitle>
                              <CardDescription className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-amber/70" />
                                  {formatDate(discovery.discovery_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-amber/70" />
                                  {discovery.location}
                                </span>
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-amber/20 text-amber-dark text-xs">
                                {new Date(discovery.discovery_date).getFullYear()}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCardExpansion(discovery.id)}
                                className="p-1 h-auto hover:bg-amber/10"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className={`grid ${discovery.image_url ? 'md:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                            <div className={discovery.image_url ? 'md:col-span-2' : 'col-span-1'}>
                              <p className={`text-muted-foreground leading-relaxed text-sm ${
                                expandedCard === discovery.id ? '' : 'line-clamp-3'
                              }`}>
                                {discovery.description}
                              </p>

                              {expandedCard === discovery.id && (
                                <div className="mt-4 space-y-3 animate-fadeIn">
                                  {discovery.significance && (
                                    <div>
                                      <h4 className="font-semibold mb-1 text-amber text-sm">{t('timeline.discovery.significance')}:</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {discovery.significance}
                                      </p>
                                    </div>
                                  )}

                                  {(discovery.researcher_name || discovery.organization) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                                      <Users className="w-3 h-3 text-amber/70" />
                                      <div>
                                        {discovery.researcher_name && (
                                          <span>{t('timeline.discovery.researcher')}: {discovery.researcher_name}</span>
                                        )}
                                        {discovery.organization && (
                                          <span className={discovery.researcher_name ? " • " : ""}>
                                            {discovery.organization}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {discovery.image_url && (
                              <div className="md:col-span-1">
                                <div className="relative overflow-hidden rounded-lg group">
                                  <img
                                    src={discovery.image_url}
                                    alt={discovery.title}
                                    className="w-full h-32 md:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              {visibleItems < filteredDiscoveries.length && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMoreItems}
                    className="bg-gradient-to-r from-amber to-amber-glow hover:from-amber-glow hover:to-amber text-black font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
                  >
                    {t('timeline.discovery.viewMore')} ({filteredDiscoveries.length - visibleItems} {t('timeline.discovery.remaining')})
                  </Button>
                </div>
              )}

              {filteredDiscoveries.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-muted/20 rounded-2xl p-8 max-w-md mx-auto">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">{t('timeline.discovery.noDiscoveries')}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t('timeline.discovery.adjustFilters')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Geological Timeline Tab */}
          <TabsContent value="geological">
            <div className="relative">
              <div className="absolute left-6 top-0 w-1 h-full bg-gradient-to-b from-red-500 via-green-500 to-purple-500 opacity-20"></div>

              <div className="space-y-6">
                {geologicalEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="relative group animate-slideInUp"
                    style={{
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    <div className={`absolute left-3 w-8 h-8 bg-gradient-to-r ${event.color} rounded-full border-4 border-background shadow-lg group-hover:scale-125 transition-all duration-300 flex items-center justify-center text-white hidden md:flex`}>
                      {event.icon}
                    </div>

                    <div className="md:ml-16">
                      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-border/50 hover:border-amber/30">
                        <CardHeader className={`bg-gradient-to-r ${event.color} text-white pb-3 pt-4`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2 flex items-center gap-3">
                                <span className="md:hidden">{event.icon}</span>
                                {event.title}
                              </CardTitle>
                              <CardDescription className="text-white/90 text-sm">
                                <Badge variant="secondary" className="bg-white/20 text-white mr-2">
                                  {event.years_ago} {t('timeline.geological.millionYearsAgo')}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/20 text-white">
                                  {event.period} {t('timeline.geological.period')}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-muted-foreground leading-relaxed">
                            {event.description}
                          </p>
                          
                          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="capitalize">
                              {event.type.replace('_', ' ')} {t('timeline.geological.event')}
                            </span>
                            <span>•</span>
                            <span>{t('timeline.geological.mesozoicEra')}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              {/* Era Legend */}
              <div className="mt-12">
                <Card className="bg-gradient-to-r from-amber/10 to-orange/10 border-amber/20">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">{t('timeline.geological.eraOverview')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-b from-red-100 to-red-50 rounded-lg">
                        <div className="text-2xl mb-2">🌋</div>
                        <h4 className="font-semibold text-red-700">{t('timeline.geological.triassic')}</h4>
                        <p className="text-sm text-red-600">252-201 {t('timeline.geological.mya')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('timeline.geological.triassicDesc')}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-b from-green-100 to-green-50 rounded-lg">
                        <div className="text-2xl mb-2">🌲</div>
                        <h4 className="font-semibold text-green-700">{t('timeline.geological.jurassic')}</h4>
                        <p className="text-sm text-green-600">201-145 {t('timeline.geological.mya')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('timeline.geological.jurassicDesc')}</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-b from-purple-100 to-purple-50 rounded-lg">
                        <div className="text-2xl mb-2">🌺</div>
                        <h4 className="font-semibold text-purple-700">{t('timeline.geological.cretaceous')}</h4>
                        <p className="text-sm text-purple-600">145-66 {t('timeline.geological.mya')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('timeline.geological.cretaceousDesc')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}