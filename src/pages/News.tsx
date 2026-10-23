import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DinoLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import SmartImage from '@/components/SmartImage';
import { 
  Search, 
  User, 
  Clock, 
  Filter,
  Newspaper,
  TrendingUp,
  Microscope,
  BookOpen,
  ExternalLink,
  Award,
  FileText,
  Copy,
  Check,
  Globe2,
  Sparkles,
  Layers,
  type LucideIcon,
} from 'lucide-react';
import { 
  getAllArticles, 
  getFeaturedArticles,
  NewsArticle,
  NewsCategory
} from '@/services/newsService';

export default function News() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  usePageTitle(t('navigation.news'));
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'curated' | 'live'>('all');
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(false);
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getAllArticles(i18n.language, true), getFeaturedArticles(i18n.language)])
      .then(([allArticles, featured]) => {
        if (cancelled) return;
        setArticles(allArticles);
        setFeaturedArticles(featured);
      })
      .catch((error) => console.error('Error loading articles:', error))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm, selectedCategory, viewMode, peerReviewedOnly, openAccessOnly]);

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return articles
      .filter((a) => {
        if (viewMode === 'curated' && a.isLiveFeed) return false;
        if (viewMode === 'live' && !a.isLiveFeed) return false;
        if (peerReviewedOnly && !a.peerReviewed) return false;
        if (openAccessOnly && !a.openAccess) return false;
        if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;

        if (!query) return true;
        const matchesQuery = [
          a.title,
          a.subtitle,
          a.excerpt,
          a.journal,
          a.doi,
          a.author,
          ...(a.tags || []),
          ...((a.taxa || []).map((tax) => tax.scientificName)),
        ].some((f) => (f || '').toLowerCase().includes(query));

        return matchesQuery;
      })
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
  }, [articles, searchTerm, selectedCategory, viewMode, peerReviewedOnly, openAccessOnly]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, LucideIcon> = {
      discoveries: TrendingUp,
      anatomy: Microscope,
      taxonomy: BookOpen,
      paleoecology: Layers,
      technology: Microscope,
      research: Microscope,
    };
    return icons[category] || Newspaper;
  };

  const copyCitation = (e: React.MouseEvent, article: NewsArticle) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(article.citationApa || `${article.author} (${article.publishedDate}). ${article.title}. ${article.journal}. ${article.doiUrl}`);
    setCopiedDoi(article.id);
    toast({
      title: i18n.language.startsWith('pt') ? 'Citação APA Copiada' : 'APA Citation Copied',
      description: article.title,
    });
    setTimeout(() => setCopiedDoi(null), 2500);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setViewMode('all');
    setPeerReviewedOnly(false);
    setOpenAccessOnly(false);
    setVisibleCount(8);
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

  const categories: Array<{ value: NewsCategory | 'all'; label: string; icon?: LucideIcon }> = [
    { value: 'all', label: t('news.categories.all') },
    { value: 'discoveries', label: i18n.language.startsWith('pt') ? 'Descobertas' : i18n.language.startsWith('es') ? 'Descubrimientos' : 'Discoveries', icon: TrendingUp },
    { value: 'anatomy', label: i18n.language.startsWith('pt') ? 'Anatomia & Biomecânica' : i18n.language.startsWith('es') ? 'Anatomía & Biomecánica' : 'Anatomy & Biomechanics', icon: Microscope },
    { value: 'taxonomy', label: i18n.language.startsWith('pt') ? 'Taxonomia & Espécies' : i18n.language.startsWith('es') ? 'Taxonomía & Especies' : 'Taxonomy & Species', icon: BookOpen },
    { value: 'paleoecology', label: i18n.language.startsWith('pt') ? 'Paleoecologia' : i18n.language.startsWith('es') ? 'Paleoecología' : 'Paleoecology', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ============================================================
           HEADER — Editorial Desk & Scientific Credentials
           ============================================================ */}
      <section className="pt-10 lg:pt-14 pb-5">
        <div className="container-editorial">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="text-caption text-jade flex items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              — {i18n.language.startsWith('pt') ? 'Feed Científico Verificado & DOIs' : i18n.language.startsWith('es') ? 'Feed Científico Verificado & DOIs' : 'Peer-Reviewed Scientific Feed'}
            </div>
            <div className="text-caption text-foreground/50 flex items-center gap-3">
              <span>{filteredArticles.length} {t('editorial.dispatches')}</span>
              <span className="opacity-30">·</span>
              <span className="flex items-center gap-1.5 text-jade">
                <Globe2 className="w-3 h-3" /> OpenAlex + PBDB
              </span>
            </div>
          </div>

          <div className="grid gap-y-3 gap-x-12 lg:grid-cols-12 items-baseline">
            <h1 className="lg:col-span-7 font-display text-display-xl text-foreground tracking-tighter">
              {t('news.title')}
            </h1>
            <p className="lg:col-span-5 max-w-[48ch] text-xs md:text-sm text-foreground/60 leading-relaxed">
              {i18n.language.startsWith('pt')
                ? 'Artigos acadêmicos revisados por pares, descobertas fósseis de campo e literatura paleontológica de periódicos internacionais de alto impacto com identificadores DOI verificados.'
                : i18n.language.startsWith('es')
                ? 'Artículos académicos revisados por pares, descubrimientos de fósiles y literatura paleontológica de revistas científicas internacionales con DOIs verificados.'
                : 'Peer-reviewed scholarly literature, pivotal fossil dispatches, and open paleontological research indexed from top-tier journals with persistent DOI identifiers.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
           FEED SOURCE TABS — Curated vs Live OpenAlex Feed
           ============================================================ */}
      <section className="hairline-t hairline-b py-4 bg-surface-1/40">
        <div className="container-editorial">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'all'}
                onClick={() => setViewMode('all')}
                className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                  viewMode === 'all'
                    ? 'bg-jade text-canvas ring-jade'
                    : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {i18n.language.startsWith('pt') ? 'Todos os Registros' : i18n.language.startsWith('es') ? 'Todos los Registros' : 'All Works'}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'curated'}
                onClick={() => setViewMode('curated')}
                className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                  viewMode === 'curated'
                    ? 'bg-jade text-canvas ring-jade'
                    : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {i18n.language.startsWith('pt') ? 'Caderno Editorial Aprofundado' : i18n.language.startsWith('es') ? 'Cuaderno Editorial Curado' : 'Curated In-Depth Dispatches'}
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'live'}
                onClick={() => setViewMode('live')}
                className={`text-caption px-4 py-2 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
                  viewMode === 'live'
                    ? 'bg-jade text-canvas ring-jade'
                    : 'bg-surface-1 text-foreground/60 ring-foreground/10 hover:text-jade'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                {i18n.language.startsWith('pt') ? 'Literatura Global em Tempo Real' : i18n.language.startsWith('es') ? 'Literatura Global en Tiempo Real' : 'Live Global Feed (OpenAlex)'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-caption text-foreground/60 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={openAccessOnly}
                  onChange={(e) => setOpenAccessOnly(e.target.checked)}
                  className="rounded border-foreground/20 text-jade focus:ring-jade/40 bg-surface-1"
                />
                <span>Open Access</span>
              </label>

              <label className="text-caption text-foreground/60 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={peerReviewedOnly}
                  onChange={(e) => setPeerReviewedOnly(e.target.checked)}
                  className="rounded border-foreground/20 text-jade focus:ring-jade/40 bg-surface-1"
                />
                <span>Peer-Reviewed</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           FEATURED MILESTONE ARTICLE (when on 'all' or 'curated')
           ============================================================ */}
      {viewMode !== 'live' && featuredArticles.length > 0 && !searchTerm && selectedCategory === 'all' && (
        <section className="hairline-b py-10 lg:py-12 bg-gradient-to-b from-surface-1/30 to-background">
          <div className="container-editorial">
            <div className="text-caption text-jade mb-6 flex items-center gap-2">
              <Award className="w-3.5 h-3.5" />
              {i18n.language.startsWith('pt') ? 'Artigo de Destaque · Marco da Paleontologia' : 'Featured Landmark Article'}
            </div>

            {featuredArticles[0] && (() => {
              const a = featuredArticles[0];
              const Icon = getCategoryIcon(a.category);
              return (
                <div className="grid gap-10 lg:gap-14 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-7">
                    <figure className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-jade/30 shadow-[0_0_50px_-20px_hsl(158_86%_72%/0.35)] bg-surface-1 group">
                      <SmartImage
                        src={a.imageUrl}
                        alt={a.title}
                        className="absolute inset-0 w-full h-full rounded-3xl ring-0"
                        imgClassName="w-full h-full object-cover img-duotone-hover transition-transform duration-700 ease-spring group-hover:scale-105"
                        fallbackSrc="/placeholder.svg"
                        loading="eager"
                      />
                      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-none">
                        <span className="text-caption text-foreground/90 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-foreground/15 flex items-center gap-1.5 shadow-sm">
                          <Icon className="w-3 h-3 text-jade" />
                          {a.journal}
                        </span>
                        {a.openAccess && (
                          <span className="text-caption text-canvas bg-jade px-2.5 py-1.5 rounded-full font-medium shadow-sm">
                            Open Access
                          </span>
                        )}
                      </div>
                      <figcaption className="absolute bottom-4 left-4 right-4 z-10 text-caption text-foreground/90 bg-background/80 backdrop-blur-md px-3.5 py-2 rounded-2xl ring-1 ring-foreground/15 line-clamp-1 shadow-sm">
                        {a.image?.caption || a.title} · {a.image?.credit}
                      </figcaption>
                    </figure>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="text-caption text-jade mb-2 font-mono uppercase tracking-wider">
                      DOI: {a.doi}
                    </div>

                    <h2 className="font-display text-display-lg text-foreground tracking-tighter mb-4 leading-[1.05]">
                      <Link to={`/news/${a.id}`} className="hover:text-jade transition-colors duration-300">
                        {a.title}
                      </Link>
                    </h2>

                    <p className="text-foreground/70 leading-relaxed text-base mb-6 line-clamp-3">
                      {a.excerpt}
                    </p>

                    <div className="hairline-t pt-4 mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-foreground/50">
                      <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-jade" /> {a.author}</span>
                      <span>{formatDate(a.publishedDate)}</span>
                      <span>{a.readTime} min read</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button asChild className="bg-jade text-canvas hover:bg-jade/90" size="lg">
                        <Link to={`/news/${a.id}`}>
                          {i18n.language.startsWith('pt') ? 'Ler Análise Completa' : 'Read Full Analysis'}
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={(e) => copyCitation(e, a)}
                        className="text-foreground/75 hover:text-jade"
                      >
                        {copiedDoi === a.id ? <Check className="mr-2 w-4 h-4 text-jade" /> : <Copy className="mr-2 w-4 h-4" />}
                        {i18n.language.startsWith('pt') ? 'Copiar Citação' : 'Copy APA Citation'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ============================================================
           SEARCH & CATEGORY FILTER BAR
           ============================================================ */}
      <section className="pb-24 pt-8">
        <div className="container-editorial">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-5 items-center">
            <div className="md:col-span-9 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                placeholder={i18n.language.startsWith('pt') ? 'Buscar por táxon (ex: Spinosaurus), autor, periódico ou DOI...' : 'Search by taxon, author, journal or DOI...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-full bg-surface-1 border-foreground/10 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="md:col-span-3 text-caption text-foreground/50 hover:text-jade transition-colors duration-300 flex items-center justify-center gap-2 h-10"
            >
              <Filter className="w-3.5 h-3.5" />
              {t('news.filters.clear')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 hairline-b pb-5">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-caption px-3.5 py-1.5 rounded-full ring-1 transition-all duration-300 ease-spring flex items-center gap-2 ${
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

          {/* ============================================================
               ARTICLES LIST
               ============================================================ */}
          {filteredArticles.length > 0 ? (
            <>
              <ol className="divide-y divide-foreground/8">
                {filteredArticles.slice(0, visibleCount).map((article) => {
                  const Icon = getCategoryIcon(article.category);
                  return (
                    <li key={article.id} className="py-6 lg:py-7 first:pt-0">
                      <article className="grid grid-cols-12 gap-5 items-start">
                        {/* Column 1: Journal badge, Date, DOI */}
                        <div className="col-span-12 md:col-span-3">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 text-caption font-semibold px-2.5 py-1 rounded-full bg-surface-2 ring-1 ring-foreground/10 text-jade">
                              <Icon className="w-3 h-3" />
                              {article.journal}
                            </span>
                            {article.openAccess && (
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
                                OA
                              </span>
                            )}
                          </div>

                          <div className="text-caption text-foreground/40 mb-1">{formatDate(article.publishedDate)}</div>
                          
                          <a
                            href={article.doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-foreground/50 hover:text-jade transition-colors duration-300"
                            title={article.doi}
                          >
                            <span>doi:{article.doi.slice(0, 20)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* Column 2: Title, Excerpt, Taxa, Authors */}
                        <div className={article.imageUrl ? 'col-span-12 md:col-span-6' : 'col-span-12 md:col-span-9'}>
                          <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-3 leading-snug">
                            <Link to={`/news/${article.id}`} className="hover:text-jade transition-colors duration-300">
                              {article.title}
                            </Link>
                          </h3>

                          <p className="text-foreground/70 leading-relaxed text-sm mb-4 line-clamp-3">
                            {article.excerpt}
                          </p>

                          {/* Linked Taxa chips */}
                          {article.taxa && article.taxa.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="text-caption text-foreground/40">{i18n.language.startsWith('pt') ? 'Táxons:' : 'Taxa:'}</span>
                              {article.taxa.map((tax, i) => (
                                tax.speciesRowIndex ? (
                                  <Link
                                    key={i}
                                    to={`/species/${tax.speciesRowIndex}`}
                                    className="text-caption px-2.5 py-0.5 rounded-full ring-1 ring-jade/30 bg-jade/10 text-jade hover:bg-jade hover:text-canvas transition-colors duration-300"
                                  >
                                    🦴 {tax.scientificName}
                                  </Link>
                                ) : (
                                  <span
                                    key={i}
                                    className="text-caption px-2 py-0.5 rounded-full ring-1 ring-foreground/10 bg-surface-1 text-foreground/60 italic"
                                  >
                                    {tax.scientificName}
                                  </span>
                                )
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-caption text-foreground/50">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-jade" /> {article.author}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> {article.readTime} min read
                            </span>

                            <button
                              type="button"
                              onClick={(e) => copyCitation(e, article)}
                              className="inline-flex items-center gap-1 text-caption text-foreground/60 hover:text-jade transition-colors ml-auto"
                            >
                              {copiedDoi === article.id ? <Check className="w-3 h-3 text-jade" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedDoi === article.id ? 'Copiado!' : 'Citação APA'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Column 3: Figure thumbnail */}
                        {article.imageUrl && (
                          <figure className="col-span-12 md:col-span-3 relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-foreground/8 bg-surface-1 group">
                            <Link to={`/news/${article.id}`} className="block w-full h-full">
                              <SmartImage
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full rounded-2xl ring-0"
                                imgClassName="w-full h-full object-cover img-duotone-hover transition-transform duration-500 group-hover:scale-105"
                                fallbackSrc="/placeholder.svg"
                                loading="lazy"
                              />
                            </Link>
                            {article.image?.license && (
                              <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-background/85 backdrop-blur-md px-2 py-0.5 rounded-full text-foreground/75 ring-1 ring-foreground/10 pointer-events-none z-10">
                                {article.image.license}
                              </span>
                            )}
                          </figure>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ol>

              {visibleCount < filteredArticles.length && (
                <div className="text-center mt-14">
                  <Button onClick={() => setVisibleCount((prev) => prev + 8)} variant="outline" size="lg">
                    {t('news.loadMore')} ({filteredArticles.length - visibleCount} {i18n.language.startsWith('pt') ? 'restantes' : 'remaining'})
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
