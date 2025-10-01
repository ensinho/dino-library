import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Share2, 
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
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadArticle(id);
    }
  }, [id, i18n.language]);

  const loadArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const [articleData, related] = await Promise.all([
        getArticleById(articleId, i18n.language),
        getRelatedArticles(articleId, i18n.language)
      ]);
      
      if (!articleData) {
        navigate('/news');
        return;
      }

      setArticle(articleData);
      setRelatedArticles(related);
    } catch (error) {
      console.error('Error loading article:', error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Article link has been copied to clipboard"
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
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('news.loading')}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('news.noResults.title')}</h2>
          <Link to="/news">
            <Button>{t('news.detail.backToNews')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-primary text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/news">
            <Button variant="ghost" className="text-white hover:text-amber mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('news.detail.backToNews')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <article className="mb-12">
          <div className="mb-6">
            <Badge className="mb-4 bg-amber/20 text-amber-dark border-amber/30">
              {t(`news.categories.${article.category}`)}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {article.subtitle}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{article.author}</span>
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(article.publishedDate)}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readTime} {t('news.card.minutes')}
              </span>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium mr-2">{t('news.detail.share')}:</span>
              <Button variant="outline" size="sm" onClick={shareOnTwitter} className="gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnFacebook} className="gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnLinkedIn} className="gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-amber/20 rounded-lg mb-8 flex items-center justify-center text-8xl overflow-hidden">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-amber/30 to-primary/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                🦕
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl md:text-4xl font-bold mt-8 mb-4 text-foreground" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-3 text-foreground" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl md:text-2xl font-semibold mt-4 mb-2 text-foreground" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-muted-foreground ml-4" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-foreground" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-amber pl-4 italic my-4 text-muted-foreground bg-muted/30 py-2" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t('news.detail.tags')}:</span>
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="hover:bg-amber/20 hover:text-amber transition-colors cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-amber flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{article.author}</h3>
                <p className="text-sm text-muted-foreground">
                  Paleontology researcher and science communicator specializing in dinosaur evolution and behavior.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8">{t('news.detail.relatedArticles')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Card key={relatedArticle.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-amber/10 group-hover:from-primary/20 group-hover:to-amber/20 transition-all duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                      🦖
                    </div>
                  </div>
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-amber/20 text-amber-dark border-amber/30">
                      {t(`news.categories.${relatedArticle.category}`)}
                    </Badge>
                    <CardTitle className="text-lg group-hover:text-amber transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                      {relatedArticle.excerpt}
                    </p>
                    <Link to={`/news/${relatedArticle.id}`}>
                      <Button variant="outline" className="w-full group-hover:border-amber group-hover:text-amber transition-all">
                        {t('news.card.readMore')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
