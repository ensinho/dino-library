import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DinoLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Tag,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check
} from 'lucide-react';
import { getArticleById, getRelatedArticles, NewsArticle } from '@/services/newsService';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  usePageTitle(article?.title);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getArticleById(id, i18n.language), getRelatedArticles(id, i18n.language)])
      .then(([articleData, related]) => {
        if (cancelled) return;
        // Unknown ids fall through to the "out of file" state below.
        setArticle(articleData ?? null);
        setRelatedArticles(related);
      })
      .catch((error) => {
        console.error('Error loading article:', error);
        toast({ title: t('common.error'), description: t('common.errorMessage'), variant: 'destructive' });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, i18n.language, t, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: t('news.linkCopied'),
      description: t('news.linkCopiedDesc')
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(article?.title || '');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-6">— {t('editorial.loadingDispatch')}</div>
          <DinoLoader size="lg" label={t('news.loading')} />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-caption text-jade mb-3">— {t('editorial.outOfFile')}</div>
          <h2 className="font-display text-display-lg text-foreground tracking-tighter mb-6">{t('news.noResults.title')}</h2>
          <Button asChild variant="outline" size="lg"><Link to="/news">{t('news.detail.backToNews')}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top rail */}
      <section className="pt-20 lg:pt-28 pb-8">
        <div className="container-editorial">
          <Link
            to="/news"
            className="text-caption text-foreground/55 hover:text-jade transition-colors duration-300 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('news.detail.backToNews')}
          </Link>
        </div>
      </section>

      {/* Article header */}
      <article>
        <header className="pb-12">
          <div className="container-editorial">
            <div className="text-caption text-jade mb-6">— {t(`news.categories.${article.category}`)}</div>
            <div className="grid lg:grid-cols-12 gap-y-8 gap-x-12">
              <h1 className="lg:col-span-9 font-display text-display-2xl lg:text-[clamp(3rem,7vw,6rem)] leading-[0.95] text-foreground tracking-tighter">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="lg:col-span-9 text-xl md:text-2xl text-foreground/65 leading-relaxed max-w-[60ch]">
                  {article.subtitle}
                </p>
              )}
            </div>

            <div className="hairline-t hairline-b mt-12 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-foreground/55">
                <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-jade" /> {article.author}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-jade" /> {formatDate(article.publishedDate)}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-jade" /> {article.readTime} {t('news.card.minutes')}</span>
              </div>
              <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-1">
                <span className="text-caption text-foreground/40 mr-2">{t('news.detail.share')}</span>
                <Button variant="ghost" size="icon" onClick={shareOnTwitter} className="h-8 w-8 text-foreground/55 hover:text-jade"><Twitter className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={shareOnFacebook} className="h-8 w-8 text-foreground/55 hover:text-jade"><Facebook className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={shareOnLinkedIn} className="h-8 w-8 text-foreground/55 hover:text-jade"><Linkedin className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8 text-foreground/55 hover:text-jade">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {article.imageUrl && (
          <div className="container-editorial">
            <figure className="relative aspect-[16/9] overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1 mb-16">
              <img src={article.imageUrl} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
            </figure>
          </div>
        )}

        {/* Long-form */}
        <div className="container-editorial pb-16">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 lg:col-start-3 prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tighter prose-headings:text-foreground prose-p:text-foreground/75 prose-p:leading-[1.8] prose-strong:text-foreground prose-a:text-jade hover:prose-a:text-foreground prose-blockquote:border-l-jade prose-blockquote:text-foreground prose-blockquote:not-italic prose-blockquote:font-display prose-li:text-foreground/75">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="container-editorial pb-16">
            <div className="hairline-t pt-8 lg:pl-[16.666%]">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-jade" />
                <span className="text-caption text-foreground/55 mr-2">{t('news.detail.tags')}</span>
                {article.tags.map((tag, index) => (
                  <span key={index} className="text-caption px-3 py-1 rounded-full ring-1 ring-foreground/10 bg-surface-1 text-foreground/60 hover:text-jade hover:ring-jade/40 transition-all duration-300 cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Author colophon */}
        <div className="container-editorial pb-24">
          <div className="hairline-t pt-10 lg:pl-[16.666%] grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 md:col-span-2">
              <div className="text-caption text-jade">— {t('news.byline')}</div>
            </div>
            <div className="col-span-12 md:col-span-9">
              <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground mb-2">{article.author}</h3>
              <p className="text-foreground/65 leading-relaxed max-w-[55ch]">
                Paleontology researcher and science communicator specializing in dinosaur evolution and behavior.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related */}
      {relatedArticles.length > 0 && (
        <section className="hairline-t py-20">
          <div className="container-editorial">
            <div className="text-caption text-jade mb-8">— {t('news.detail.relatedArticles')}</div>
            <ol className="grid md:grid-cols-2 gap-12">
              {relatedArticles.map((r) => (
                <li key={r.id}>
                  <Link to={`/news/${r.id}`} className="group block">
                    <figure className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1 mb-5">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.title} className="absolute inset-0 w-full h-full object-cover img-duotone-hover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
                      )}
                    </figure>
                    <div className="text-caption text-jade mb-2">{t(`news.categories.${r.category}`)}</div>
                    <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground transition-colors duration-300 group-hover:text-jade mb-3">
                      {r.title}
                    </h3>
                    <p className="text-foreground/65 line-clamp-2">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
