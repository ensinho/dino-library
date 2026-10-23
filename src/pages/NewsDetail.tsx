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
  ExternalLink,
  Award,
  FileText,
  Copy,
  Check,
  Building,
  BookmarkCheck,
  Share2,
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedApa, setCopiedApa] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  usePageTitle(article?.title);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getArticleById(id, i18n.language), getRelatedArticles(id, i18n.language)])
      .then(([articleData, related]) => {
        if (cancelled) return;
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
    try {
      return new Date(dateString).toLocaleDateString(i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast({
      title: t('news.linkCopied'),
      description: t('news.linkCopiedDesc')
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyApaCitation = () => {
    if (!article) return;
    navigator.clipboard.writeText(article.citationApa || `${article.author} (${article.publishedDate}). ${article.title}. ${article.journal}. ${article.doiUrl}`);
    setCopiedApa(true);
    toast({
      title: i18n.language.startsWith('pt') ? 'Citação APA Copiada' : 'APA Citation Copied',
      description: article.title
    });
    setTimeout(() => setCopiedApa(false), 2000);
  };

  const copyBibtexCitation = () => {
    if (!article) return;
    navigator.clipboard.writeText(article.citationBibtex || `@article{dino_${article.id},\n  title={${article.title}},\n  author={${article.author}},\n  journal={${article.journal}},\n  doi={${article.doi}}\n}`);
    setCopiedBibtex(true);
    toast({
      title: i18n.language.startsWith('pt') ? 'Citação BibTeX Copiada' : 'BibTeX Citation Copied',
      description: article.title
    });
    setTimeout(() => setCopiedBibtex(false), 2000);
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
    <div className="min-h-screen bg-background pb-24">
      {/* Top navigation */}
      <section className="pt-20 lg:pt-24 pb-6">
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

      {/* Article Header & Dossier */}
      <article>
        <header className="pb-12">
          <div className="container-editorial">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-caption text-jade flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                {article.journal}
              </span>
              <span className="text-caption text-foreground/40">·</span>
              {article.peerReviewed && (
                <span className="text-caption px-2.5 py-0.5 rounded-full bg-surface-2 ring-1 ring-jade/30 text-jade">
                  ✓ Peer-Reviewed
                </span>
              )}
              {article.openAccess && (
                <span className="text-caption px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
                  Open Access
                </span>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-y-8 gap-x-12">
              <h1 className="lg:col-span-10 font-display text-display-xl lg:text-[clamp(2.75rem,5.5vw,4.5rem)] leading-[1.0] text-foreground tracking-tighter">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="lg:col-span-9 text-lg md:text-xl text-foreground/65 leading-relaxed max-w-[65ch]">
                  {article.subtitle}
                </p>
              )}
            </div>

            {/* Scientific Credentials Bar */}
            <div className="hairline-t hairline-b mt-10 py-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-foreground/55">
                <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                  <User className="w-3.5 h-3.5 text-jade" /> {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-jade" /> {formatDate(article.publishedDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-jade" /> {article.readTime} min read
                </span>
                <a
                  href={article.doiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-jade hover:underline inline-flex items-center gap-1"
                >
                  <span>DOI: {article.doi}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-caption h-9 text-foreground/60 hover:text-jade"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 mr-1.5 text-jade" /> : <Share2 className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedLink ? (i18n.language.startsWith('pt') ? 'Link Copiado' : 'Link Copied') : t('news.detail.share')}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Figure */}
        {article.imageUrl && (
          <div className="container-editorial mb-16">
            <figure className="relative overflow-hidden rounded-3xl ring-1 ring-foreground/10 bg-surface-1">
              <div className="aspect-[16/9] max-h-[580px]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="p-5 hairline-t bg-surface-1/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-caption text-foreground/70">
                <div className="max-w-[70ch]">
                  {article.image?.caption || article.title}
                </div>
                <div className="flex items-center gap-3 text-foreground/50 font-mono text-xs">
                  <span>{article.image?.credit || article.author}</span>
                  {article.image?.license && (
                    <span className="px-2 py-0.5 rounded-full ring-1 ring-foreground/15 bg-surface-2 text-foreground/75">
                      {article.image.license}
                    </span>
                  )}
                </div>
              </figcaption>
            </figure>
          </div>
        )}

        {/* Scientific Dossier Box (DOI, Citations, Authors) */}
        <section className="container-editorial mb-16">
          <div className="p-6 md:p-8 rounded-3xl ring-1 ring-jade/30 bg-surface-1/60 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="text-caption text-jade flex items-center gap-2 font-mono uppercase tracking-wider">
                <BookmarkCheck className="w-4 h-4" />
                {i18n.language.startsWith('pt') ? 'Dossiê Bibliográfico & Citação Acadêmica' : 'Scholarly Dossier & Citation'}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyApaCitation}
                  className="h-8 text-xs font-mono"
                >
                  {copiedApa ? <Check className="w-3 h-3 mr-1 text-jade" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copiedApa ? 'APA Copiado' : 'Copiar APA'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyBibtexCitation}
                  className="h-8 text-xs font-mono"
                >
                  {copiedBibtex ? <Check className="w-3 h-3 mr-1 text-jade" /> : <FileText className="w-3 h-3 mr-1" />}
                  {copiedBibtex ? 'BibTeX Copiado' : 'Copiar BibTeX'}
                </Button>
                {article.pdfUrl && (
                  <Button asChild size="sm" className="h-8 text-xs bg-jade text-canvas hover:bg-jade/90">
                    <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      PDF Open Access
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6 text-sm">
              <div className="md:col-span-8 space-y-3">
                <div>
                  <span className="text-caption text-foreground/45 block mb-1">
                    {i18n.language.startsWith('pt') ? 'Referência em Formato APA' : 'APA Citation Format'}
                  </span>
                  <div className="font-mono text-xs p-3 rounded-xl bg-background/60 ring-1 ring-foreground/10 text-foreground/80 leading-relaxed select-all">
                    {article.citationApa || `${article.author} (${article.publishedDate}). ${article.title}. ${article.journal}. ${article.doiUrl}`}
                  </div>
                </div>

                {article.authors && article.authors.length > 0 && (
                  <div>
                    <span className="text-caption text-foreground/45 block mb-1">
                      {i18n.language.startsWith('pt') ? 'Pesquisadores & Afiliações' : 'Authors & Affiliations'}
                    </span>
                    <ul className="grid sm:grid-cols-2 gap-2 text-xs">
                      {article.authors.map((auth, idx) => (
                        <li key={idx} className="flex flex-col">
                          <span className="font-medium text-foreground/85">{auth.name}</span>
                          {auth.affiliation && (
                            <span className="text-foreground/50 text-[11px] leading-tight">{auth.affiliation}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:col-span-4 space-y-4 border-t md:border-t-0 md:border-l border-foreground/8 md:pl-6">
                <div>
                  <span className="text-caption text-foreground/45 block mb-1">
                    {i18n.language.startsWith('pt') ? 'Identificador Digital' : 'Persistent Identifier'}
                  </span>
                  <a
                    href={article.doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-jade hover:underline flex items-center gap-1.5"
                  >
                    <span>{article.doi}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {article.taxa && article.taxa.length > 0 && (
                  <div>
                    <span className="text-caption text-foreground/45 block mb-1.5">
                      {i18n.language.startsWith('pt') ? 'Táxons Estudados' : 'Studied Taxa'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {article.taxa.map((tax, i) => (
                        tax.speciesRowIndex ? (
                          <Link
                            key={i}
                            to={`/species/${tax.speciesRowIndex}`}
                            className="text-caption px-2.5 py-1 rounded-full ring-1 ring-jade/40 bg-jade/10 text-jade hover:bg-jade hover:text-canvas transition-colors duration-300"
                          >
                            🦴 {tax.scientificName}
                          </Link>
                        ) : (
                          <span key={i} className="text-caption px-2 py-0.5 rounded-full ring-1 ring-foreground/10 bg-surface-2 text-foreground/70 italic">
                            {tax.scientificName}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Long-form Editorial Markdown */}
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
                  <span
                    key={index}
                    className="text-caption px-3 py-1 rounded-full ring-1 ring-foreground/10 bg-surface-1 text-foreground/60 hover:text-jade hover:ring-jade/40 transition-all duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Colophon */}
        <div className="container-editorial pb-20">
          <div className="hairline-t pt-10 lg:pl-[16.666%] grid grid-cols-12 gap-6 items-start">
            <div className="col-span-12 md:col-span-3">
              <div className="text-caption text-jade">— {i18n.language.startsWith('pt') ? 'Metodologia & Revisão' : 'Methodology & Peer Review'}</div>
            </div>
            <div className="col-span-12 md:col-span-9 text-sm text-foreground/65 leading-relaxed space-y-2">
              <p>
                {i18n.language.startsWith('pt')
                  ? `Este trabalho foi submetido a rigorosa revisão por pares duplo-cega perante o conselho editorial de ${article.journal}. Fósseis associados estão depositados em instituições e museus públicos credenciados com livre acesso acadêmico.`
                  : `This research underwent formal peer review through the editorial board of ${article.journal}. Specimen catalog numbers and repository data are publicly accessible for anatomical verification.`}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Scientific Literature */}
      {relatedArticles.length > 0 && (
        <section className="hairline-t py-20 bg-surface-1/20">
          <div className="container-editorial">
            <div className="text-caption text-jade mb-8">— {t('news.detail.relatedArticles')}</div>
            <ol className="grid md:grid-cols-2 gap-12">
              {relatedArticles.map((r) => (
                <li key={r.id}>
                  <Link to={`/news/${r.id}`} className="group block">
                    <figure className="relative aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-foreground/8 bg-surface-1 mb-5">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.title} className="absolute inset-0 w-full h-full object-cover img-duotone-hover" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
                      )}
                      <div className="absolute top-3 left-3 text-caption text-foreground/80 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-full ring-1 ring-foreground/10">
                        {r.journal}
                      </div>
                    </figure>
                    <div className="font-mono text-xs text-jade mb-2">DOI: {r.doi}</div>
                    <h3 className="font-display text-2xl tracking-[-0.025em] text-foreground transition-colors duration-300 group-hover:text-jade mb-3">
                      {r.title}
                    </h3>
                    <p className="text-foreground/65 line-clamp-2 text-sm">{r.excerpt}</p>
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
