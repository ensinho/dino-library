import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Editorial colophon — three columns, hairline dividers, oversized caption labels.
 * Designed to feel like the back-page of a museum monograph.
 */
const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative bg-background text-foreground">
      <div className="hairline-t" />

      <div className="container-editorial pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-12 mb-16">
          <div className="md:col-span-6">
            <Link to="/" className="inline-flex items-baseline gap-1 group">
              <span className="font-display text-3xl lowercase tracking-[-0.04em] text-foreground">
                dino<span className="text-jade">.</span>library
              </span>
            </Link>
            <p className="mt-6 max-w-md font-display text-2xl leading-tight tracking-[-0.025em] text-foreground/80">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-caption text-foreground/40 mb-4">{t('footer.explore')}</div>
            <ul className="space-y-3 font-sans text-base">
              <li><Link to="/catalog"   className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.collection')}</Link></li>
              <li><Link to="/discover"  className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.discover')}</Link></li>
              <li><Link to="/map"       className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.atlas')}</Link></li>
              <li><Link to="/timeline"  className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.timeline')}</Link></li>
              <li><Link to="/education" className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.learning')}</Link></li>
              <li><Link to="/news"      className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.fieldNotes')}</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-caption text-foreground/40 mb-4">{t('footer.sources')}</div>
            <ul className="space-y-3 font-sans text-base">
              <li>
                <a
                  href="https://www.kaggle.com/datasets/canozensoy/dinosaur-genera-dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-jade transition-colors duration-300"
                >
                  {t('footer.dataset')} ↗
                </a>
              </li>
              <li><Link to="/glossary" className="text-foreground/70 hover:text-jade transition-colors duration-300">{t('footer.glossary')}</Link></li>
            </ul>

            <div className="text-caption text-foreground/40 mt-8 mb-4">{t('footer.elsewhere')}</div>
            <div className="flex items-center gap-4">
              <a
                href="https://www.github.com/ensinho"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="social-link text-foreground/60"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/enzoesmeraldo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-link text-foreground/60"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:enzopo625@gmail.com"
                aria-label="Email"
                className="social-link text-foreground/60"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="hairline-t pt-8">
          <div className="font-display text-display-lg lowercase tracking-[-0.04em] text-foreground/10 leading-none select-none">
            dino.library — mmxxvi
          </div>

          <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <p className="text-caption text-foreground/40">
              © 2026 · {t('footer.designedBy')}{' '}
              <a
                href="https://www.github.com/ensinho"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-jade transition-colors"
              >
                Enzo Esmeraldo
              </a>
            </p>
            <p className="text-caption text-foreground/40">
              Bricolage Grotesque · Geist · Geist Mono
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
