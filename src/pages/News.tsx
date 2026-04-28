import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DinoLoader } from '@/components/loader';
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
      research: 'bg-jade/20 text-jade border-jade/30',
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— {t('editorial.pressDesk')}</div>
          <DinoLoader size="lg" label={t('news.loading')} />
        </div>
      </div>
    );
  }

  const categories: Array<{ value: NewsCategory | 'all'; label: string; icon?: any }> = [
    { value: 'all', label: t('news.categories.all') },
    { value: 'discoveries', label: t('news.categories.discoveries'), icon: TrendingUp },
    { value: 'research', label: t('news.categories.research'), icon: Microscope },
    { value: 'technology', label: t('news.categories.technology'), icon: Microscope },
    { value: 'exhibitions', label: t('news.categories.exhibitions'), icon: Building2 },
    { value: 'conservation', label: t('news.categories.conservation'), icon: Leaf },
    { value: 'education', label: t('news.categories.education'), icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           HEADER
           ============================================================ */}
      <section className="pt-16 lg:pt-20 pb-6">
        <div className="container-editorial">
          <div className="flex items-center justify-between mb-6">
            <div className="text-caption text-jade">— {t('editorial.rooms.news')}</div>
            <div className="text-caption text-foreground/40 hidden sm:block">{filteredArticles.length} {t('editorial.dispatches')}</div>
          </div>
          <div className="grid gap-y-4 gap-x-12 lg:grid-cols-12">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('news.title')}
            </h1>
            <p className="lg:col-span-5 lg:pt-3 max-w-[44ch] text-sm md:text-base text-foreground/60 leading-relaxed">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
           FEATURED — front page
           ============================================================ */}
      {featuredArticles.length > 0 && (
        <section className="hairline-t hairline-b py-16">
          <div className="container-editorial">
            <div className="text-caption text-jade mb-8 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('editorial.frontPage')}
            </div>
            <div className="grid gap-10 lg:gap-12 lg:grid-cols-12">
              {/* Lead */}
              {featuredArticles[0] && (() => {
                const a = featuredArticles[0];
                const Icon = getCategoryIcon(a.category);
                return (
                  <Link to={`/news/${a.id}`} className="group lg:col-span-7 flex flex-col">
                    <figure className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1 mb-6">
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.title} className="absolute inset-0 w-full h-full object-cover img-duotone-hover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
                      )}
                      <div className="absolute top-4 left-4 z-10 text-caption text-foreground/85 bg-background/55 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/10 flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        {t(`news.categories.${a.category}`)}
                      </div>
                    </figure>
                    <div className="text-caption text-foreground/40 mb-3 flex items-center gap-3">
                      <span>{formatDate(a.publishedDate)}</span>
                      <span className="opacity-30">·</span>
                      <span>{a.readTime} {t('news.card.minutes')}</span>
                    </div>
                    <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-4 transition-colors duration-300 group-hover:text-jade">
                      {a.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed line-clamp-3">{a.excerpt}</p>
                  </Link>
                );
              })()}

              {/* Sidebar features */}
              <div className="lg:col-span-5 flex flex-col divide-y divide-foreground/8">
                {featuredArticles.slice(1, 4).map((a) => {
                  const Icon = getCategoryIcon(a.category);
                  return (
                    <Link key={a.id} to={`/news/${a.id}`} className="group py-6 first:pt-0 last:pb-0 grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-4 relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-foreground/8 bg-surface-1">
                        {a.imageUrl ? (
                          <img src={a.imageUrl} alt={a.title} className="absolute inset-0 w-full h-full object-cover img-duotone-hover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
                        )}
                      </div>
                      <div className="col-span-8">
                        <div className="text-caption text-foreground/40 mb-1.5 flex items-center gap-2">
                          <Icon className="w-3 h-3 text-jade" />
                          <span>{t(`news.categories.${a.category}`)}</span>
                        </div>
                        <h4 className="font-display text-base tracking-[-0.025em] text-foreground line-clamp-2 transition-colors duration-300 group-hover:text-jade">
                          {a.title}
                        </h4>
                        <div className="mt-2 text-caption text-foreground/40">{formatDate(a.publishedDate)}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
           FILTER BAR + LIST
           ============================================================ */}
      <section className="pb-32 pt-16">
        <div className="container-editorial">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-9 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder={t('news.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 rounded-full bg-surface-1 border-foreground/10"
              />
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="md:col-span-3 text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              {t('news.filters.clear')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-12 hairline-b pb-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                  selectedCategory === cat.value
                    ? 'bg-jade text-canvas ring-jade'
                    : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade hover:ring-jade/40'
                }`}
              >
                {cat.icon && <cat.icon className="w-3 h-3" />}
                {cat.label}
              </button>
            ))}
          </div>

          {filteredArticles.length > 0 ? (
            <>
              <ol>
                {filteredArticles.slice(0, visibleCount).map((article) => {
                  const Icon = getCategoryIcon(article.category);
                  return (
                    <li key={article.id} className="hairline-t py-10">
                      <Link to={`/news/${article.id}`} className="group grid grid-cols-12 gap-6 items-start">
                        <div className="col-span-12 md:col-span-2">
                          <div className="text-caption text-jade flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            {t(`news.categories.${article.category}`)}
                          </div>
                          <div className="mt-2 text-caption text-foreground/40">{formatDate(article.publishedDate)}</div>
                        </div>
                        <div className={article.imageUrl ? 'col-span-12 md:col-span-7' : 'col-span-12 md:col-span-10'}>
                          <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-3 transition-colors duration-300 group-hover:text-jade">
                            {article.title}
                          </h3>
                          <p className="text-foreground/70 leading-relaxed line-clamp-2 mb-4 max-w-[60ch]">
                            {article.excerpt}
                          </p>
                          <div className="text-caption text-foreground/40 flex items-center gap-3">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{article.author}</span>
                            <span className="opacity-30">·</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{article.readTime} {t('news.card.minutes')}</span>
                          </div>
                        </div>
                        {article.imageUrl && (
                          <figure className="col-span-12 md:col-span-3 relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-foreground/8 bg-surface-1">
                            <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover img-duotone-hover" />
                          </figure>
                        )}
                      </Link>
                    </li>
                  );
                })}
                <li className="hairline-t" aria-hidden="true" />
              </ol>

              {visibleCount < filteredArticles.length && (
                <div className="text-center mt-12">
                  <Button onClick={loadMore} variant="outline" size="lg">
                    {t('news.loadMore')} ({filteredArticles.length - visibleCount} {t('timeline.remaining')})
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center">
              <div className="text-caption text-jade mb-4">— {t('editorial.pressDeskQuiet')}</div>
              <h3 className="font-display text-display-lg text-foreground tracking-tighter mb-3">
                {t('news.noResults.title')}
              </h3>
              <p className="text-foreground/60 mb-8 max-w-[44ch] mx-auto">{t('news.noResults.subtitle')}</p>
              <Button onClick={clearFilters} variant="outline" size="lg">
                {t('news.noResults.action')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
