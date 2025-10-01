import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  Filter,
  Newspaper,
  TrendingUp,
  Microscope,
  Building2,
  Leaf,
  BookOpen
} from 'lucide-react';
import { 
  getAllArticles, 
  getArticlesByCategory, 
  getFeaturedArticles,
  searchArticles,
  NewsArticle,
  NewsCategory
} from '@/services/newsService';

export default function News() {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    loadArticles();
  }, [i18n.language]);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const loadArticles = async () => {
    try {
      const [allArticles, featured] = await Promise.all([
        getAllArticles(i18n.language),
        getFeaturedArticles(i18n.language)
      ]);
      setArticles(allArticles);
      setFeaturedArticles(featured);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = async () => {
    let filtered = articles;

    if (searchTerm) {
      const searchResults = await searchArticles(searchTerm, i18n.language);
      filtered = searchResults;
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sort by date, most recent first
    filtered = filtered.sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );

    setFilteredArticles(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: NewsCategory) => {
    const icons = {
      discoveries: TrendingUp,
      research: Microscope,
      technology: Microscope,
      exhibitions: Building2,
      conservation: Leaf,
      education: BookOpen
    };
    return icons[category] || Newspaper;
  };

  const getCategoryColor = (category: NewsCategory) => {
    const colors = {
      discoveries: 'bg-amber/20 text-amber-dark border-amber/30',
      research: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      technology: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
      exhibitions: 'bg-green-500/20 text-green-700 border-green-500/30',
      conservation: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
      education: 'bg-orange-500/20 text-orange-700 border-orange-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, filteredArticles.length));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setVisibleCount(6);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('news.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-amber animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber to-amber-glow bg-clip-text text-transparent">
              {t('news.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-amber" />
              Featured Stories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map(article => {
                const CategoryIcon = getCategoryIcon(article.category);
                return (
                  <Card 
                    key={article.id} 
                    className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border-2 border-amber/20 hover:border-amber/50"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-amber/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber/30 to-primary/30 group-hover:from-amber/50 group-hover:to-primary/50 transition-all duration-500" />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${getCategoryColor(article.category)} border`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {t(`news.categories.${article.category}`)}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                        🦖
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-amber transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {article.subtitle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.publishedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime} {t('news.card.minutes')}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/news/${article.id}`} className="w-full">
                        <Button className="w-full group-hover:bg-amber group-hover:text-black transition-all">
                          {t('news.card.readMore')}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder={t('news.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-amber/50"
              />
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-12 hover:bg-amber/10 hover:border-amber transition-all"
            >
              <Filter className="w-5 h-5 mr-2" />
              {t('news.filters.clear')}
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as NewsCategory | 'all')}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto bg-transparent">
              <TabsTrigger value="all" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                {t('news.categories.all')}
              </TabsTrigger>
              <TabsTrigger value="discoveries" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('news.categories.discoveries')}
              </TabsTrigger>
              <TabsTrigger value="research" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                <Microscope className="w-4 h-4 mr-2" />
                {t('news.categories.research')}
              </TabsTrigger>
              <TabsTrigger value="technology" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                <Microscope className="w-4 h-4 mr-2" />
                {t('news.categories.technology')}
              </TabsTrigger>
              <TabsTrigger value="exhibitions" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                <Building2 className="w-4 h-4 mr-2" />
                {t('news.categories.exhibitions')}
              </TabsTrigger>
              <TabsTrigger value="conservation" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                <Leaf className="w-4 h-4 mr-2" />
                {t('news.categories.conservation')}
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:bg-amber data-[state=active]:text-black">
                <BookOpen className="w-4 h-4 mr-2" />
                {t('news.categories.education')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredArticles.slice(0, visibleCount).map((article) => {
                const CategoryIcon = getCategoryIcon(article.category);
                return (
                  <Card 
                    key={article.id} 
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-amber/10 group-hover:from-primary/20 group-hover:to-amber/20 transition-all duration-500" />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getCategoryColor(article.category)} border`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {t(`news.categories.${article.category}`)}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                        🦕
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-amber transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        <div className="flex items-center gap-2 text-xs">
                          <User className="w-3 h-3" />
                          {article.author}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 text-sm mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.publishedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime} {t('news.card.minutes')}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/news/${article.id}`} className="w-full">
                        <Button variant="outline" className="w-full group-hover:border-amber group-hover:text-amber transition-all">
                          {t('news.card.readMore')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredArticles.length && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  size="lg"
                  className="bg-gradient-to-r from-amber to-amber-glow hover:from-amber-glow hover:to-amber text-black font-semibold px-8 transition-all duration-300 hover:scale-105"
                >
                  {t('news.loadMore')} ({filteredArticles.length - visibleCount} {t('timeline.remaining')})
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-2xl p-12 max-w-md mx-auto">
              <Newspaper className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-semibold mb-2">{t('news.noResults.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('news.noResults.subtitle')}
              </p>
              <Button onClick={clearFilters} variant="outline">
                {t('news.noResults.action')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
