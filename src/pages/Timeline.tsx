import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Search, Filter, Eye, Zap } from 'lucide-react';
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

export default function Timeline() {
  const [discoveries, setDiscoveries] = useState<ArchaeologicalDiscovery[]>([]);
  const [filteredDiscoveries, setFilteredDiscoveries] = useState<ArchaeologicalDiscovery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [visibleItems, setVisibleItems] = useState(6);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
            Archaeological Discoveries Timeline 
          </h1>
          <p className="text-lg md:text-base text-white/90 max-w-3xl mx-auto">
            A journey through the paleontological discoveries that revolutionized our understanding of dinosaurs. 
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar descobertas..."
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
              <option value="">Todos os anos</option>
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
              Limpar
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
                {/* Timeline dot - mais dinâmico */}
                <div className="absolute left-4 w-4 h-4 bg-gradient-to-r from-amber to-amber-glow rounded-full border-2 border-background shadow-lg group-hover:scale-125 transition-all duration-300 hidden md:block">
                  <div className="absolute inset-0 bg-amber/30 rounded-full animate-ping"></div>
                </div>

                {/* Content - Cards mais compactos */}
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
                                  <h4 className="font-semibold mb-1 text-amber text-sm">Scientific Significance:</h4>
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
                                      <span>Researcher: {discovery.researcher_name}</span>
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

          {/* Load More Button */}
          {visibleItems < filteredDiscoveries.length && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMoreItems}
                className="bg-gradient-to-r from-amber to-amber-glow hover:from-amber-glow hover:to-amber text-black font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                Ver Mais Descobertas ({filteredDiscoveries.length - visibleItems} restantes)
              </Button>
            </div>
          )}

          {filteredDiscoveries.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-muted/20 rounded-2xl p-8 max-w-md mx-auto">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma descoberta encontrada</h3>
                <p className="text-muted-foreground text-sm">
                  Tente ajustar os filtros ou termos de busca.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}