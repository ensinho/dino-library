import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

  const getPeriodEmoji = (period: string | null) => {
    switch (period?.toLowerCase()) {
      case 'triassic': return '🌋';
      case 'jurassic': return '🌲';
      case 'cretaceous': return '🌺';
      default: return '🦕';
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
          <div className="text-6xl mb-4 animate-bounce">🦕</div>
          <div className="text-xl text-muted-foreground">{t('species.loading')}</div>
        </div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">{t('species.notFound.title')}</h1>
          <p className="text-muted-foreground mb-4">{error || t('species.notFound.message')}</p>
          <Button onClick={() => navigate('/catalog')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('species.backToCatalog')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-amber/20 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/catalog')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('species.backToCatalog')}
            </Button>
            
            <Button variant="outline" onClick={shareSpecies}>
              <Share2 className="mr-2 h-4 w-4" />
              {t('species.share')}
            </Button>
          </div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {getPeriodEmoji(species.geological_period)} {species.geological_period}
                </Badge>
                <Badge className={`${getDietColor(species.diet)} text-white text-lg px-3 py-1`}>
                  {getDietIcon(species.diet)} {species.diet}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {species.common_name || 'Unknown Species'}
              </h1>
              
              <p className="text-2xl text-amber italic mb-6">
                {species.scientific_name || 'Species scientificus'}
              </p>

              {species.meaning && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-amber mb-2 flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t('species.nameOrigin')}
                  </h3>
                  <p className="text-muted-foreground">{species.meaning}</p>
                </div>
              )}

              {species.behavior_notes && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {species.behavior_notes}
                </p>
              )}
            </div>

            {/* Right Column - Image */}
            <div className="flex justify-center">
              {species.image_url ? (
                <div className="relative">
                  <img
                    src={species.image_url}
                    alt={species.common_name || species.scientific_name || 'Dinosaur'}
                    className="max-w-full h-auto rounded-xl shadow-fossil max-h-96 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-96 h-96 bg-muted rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🦕</div>
                    <p className="text-muted-foreground">{t('species.noImage')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{t('species.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="gallery">{t('species.tabs.gallery')}</TabsTrigger>
            <TabsTrigger value="anatomy">{t('species.tabs.anatomy')}</TabsTrigger>
            <TabsTrigger value="ecology">{t('species.tabs.ecology')}</TabsTrigger>
            <TabsTrigger value="discovery">{t('species.tabs.discovery')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fact File */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bone className="mr-2 h-5 w-5 text-amber" />
                    {t('species.factFile.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Ruler className="mx-auto h-6 w-6 text-amber mb-2" />
                      <div className="text-sm text-muted-foreground">{t('species.factFile.length')}</div>
                      <div className="font-semibold">
                        {species.length_m ? `${species.length_m}m` : t('species.unknown')}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Ruler className="mx-auto h-6 w-6 text-amber mb-2 rotate-90" />
                      <div className="text-sm text-muted-foreground">{t('species.factFile.height')}</div>
                      <div className="font-semibold">
                        {species.height_m ? `${species.height_m}m` : t('species.unknown')}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Weight className="mx-auto h-6 w-6 text-amber mb-2" />
                      <div className="text-sm text-muted-foreground">{t('species.factFile.weight')}</div>
                      <div className="font-semibold">
                        {species.weight_kg ? `${species.weight_kg}kg` : t('species.unknown')}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Heart className="mx-auto h-6 w-6 text-amber mb-2" />
                      <div className="text-sm text-muted-foreground">{t('species.factFile.diet')}</div>
                      <div className="font-semibold">
                        {species.diet || t('species.unknown')}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('species.factFile.locomotion')}</span>
                      <span className="font-medium">{species.locomotion || t('species.unknown')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('species.factFile.intelligence')}</span>
                      <span className="font-medium">{species.intelligence_level || t('species.unknown')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Diet and Feeding */}
                {species.diet && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {getDietIcon(species.diet)} 
                        <span className="ml-2">{t('species.diet.title')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {species.diet === 'Carnivore' && t('species.diet.carnivore')}
                        {species.diet === 'Herbivore' && t('species.diet.herbivore')}
                        {species.diet === 'Omnivore' && t('species.diet.omnivore')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Notable Features */}
                {species.notable_features && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Eye className="mr-2 h-5 w-5 text-amber" />
                        {t('species.features.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {species.notable_features}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-amber" />
                  {t('species.gallery.title')}
                </CardTitle>
                <CardDescription>
                  {t('species.gallery.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpeciesGallery species={species} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anatomy Tab */}
          <TabsContent value="anatomy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('species.anatomy.title')}</CardTitle>
                <CardDescription>{t('species.anatomy.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">{t('species.anatomy.physicalCharacteristics')}</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>{t('species.factFile.length')}:</strong> {species.length_m ? `${species.length_m}m` : t('species.unknown')}</p>
                      <p><strong>{t('species.factFile.height')}:</strong> {species.height_m ? `${species.height_m}m` : t('species.unknown')}</p>
                      <p><strong>{t('species.factFile.weight')}:</strong> {species.weight_kg ? `${species.weight_kg}kg` : t('species.unknown')}</p>
                      <p><strong>{t('species.factFile.locomotion')}:</strong> {species.locomotion || t('species.unknown')}</p>
                    </div>
                  </div>
                  
                  {species.notable_features && (
                    <div>
                      <h4 className="font-semibold mb-3">{t('species.anatomy.specialFeatures')}</h4>
                      <p className="text-muted-foreground">{species.notable_features}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ecology Tab */}
          <TabsContent value="ecology" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mountain className="mr-2 h-5 w-5 text-amber" />
                    {t('species.ecology.environment')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{t('species.ecology.period')}</h4>
                      <p className="text-muted-foreground">
                        {getPeriodEmoji(species.geological_period)} {species.geological_period || t('species.unknown')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">{t('species.ecology.habitat')}</h4>
                      <p className="text-muted-foreground">
                        {species.lived_in || t('species.unknown')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trees className="mr-2 h-5 w-5 text-amber" />
                    {t('species.ecology.behavior')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {species.behavior_notes ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {species.behavior_notes}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {t('species.ecology.noBehaviorInfo')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Discovery Tab */}
          <TabsContent value="discovery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-amber" />
                  {t('species.discovery.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{t('species.discovery.firstDiscovered')}</h4>
                      <p className="text-muted-foreground">
                        {species.first_discovered || t('species.unknown')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        {t('species.discovery.fossilLocation')}
                      </h4>
                      <p className="text-muted-foreground">
                        {species.fossil_location || t('species.unknown')}
                      </p>
                    </div>
                  </div>
                  
                  {species.source_link && (
                    <div>
                      <h4 className="font-semibold mb-2">{t('species.discovery.source')}</h4>
                      <Button variant="outline" asChild>
                        <a href={species.source_link} target="_blank" rel="noopener noreferrer">
                          {t('species.discovery.learnMore')}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Species CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-amber/10 to-orange/10 border-amber/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">{t('species.relatedSpecies.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('species.relatedSpecies.description')}</p>
              <Button asChild>
                <Link to="/catalog">
                  {t('species.relatedSpecies.exploreCatalog')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}