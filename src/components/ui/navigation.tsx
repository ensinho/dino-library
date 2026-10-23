import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Home,
  Search,
  Map,
  Clock,
  GraduationCap,
  User,
  Menu,
  X,
  Compass,
  Newspaper,
  Bookmark,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { ids: favoriteIds } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close the drawer whenever the route changes (back button included).
  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const account = user
    ? { href: '/profile', label: t('navigation.profile') }
    : { href: '/auth', label: t('navigation.auth') };

  const navigationItems = [
    { name: t('navigation.home'), href: '/', icon: Home },
    { name: t('navigation.catalog'), href: '/catalog', icon: Search },
    { name: t('navigation.discover'), href: '/discover', icon: Compass },
    { name: t('navigation.map'), href: '/map', icon: Map },
    { name: t('navigation.timeline'), href: '/timeline', icon: Clock },
    { name: t('navigation.education'), href: '/education', icon: GraduationCap },
    { name: t('navigation.news'), href: '/news', icon: Newspaper },
  ];

  // Detail pages light up their parent section (/species/12 → Catalog).
  const isActive = (path: string) => {
    const { pathname } = location;
    if (path === '/') return pathname === '/';
    if (path === '/catalog' && pathname.startsWith('/species/')) return true;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav
      className={cn(
        // Sticky translucent shell — Awwwards-style hairline + jade-tinted blur
        'sticky top-0 z-50 w-full border-b border-foreground/8 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50',
        className
      )}
    >
      <div className="container-editorial">
        <div className="flex items-center justify-between h-16">
          {/* Wordmark — display font, lowercase, tight tracking */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-foreground/[0.04] ring-1 ring-jade/30 overflow-hidden shadow-[0_0_18px_-4px_hsl(158_86%_72%/0.45)] transition-all duration-300 ease-spring group-hover:ring-jade/60">
              <img src="/LogoCuteDino.png" alt="DinoLibrary logo" className="h-full w-full object-cover" />
            </span>
            <span className="font-display text-lg lowercase tracking-[-0.04em] text-foreground">
              dino<span className="text-jade">.</span>library
            </span>
          </Link>

          {/* Desktop nav — text-only, jade underline on active */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium tracking-[-0.01em] transition-colors duration-300 ease-spring',
                    active
                      ? 'text-foreground'
                      : 'text-foreground/60 hover:text-foreground'
                  )}
                >
                  {item.name}
                  <span
                    className={cn(
                      'pointer-events-none absolute left-3.5 right-3.5 -bottom-px h-px origin-left scale-x-0 bg-jade transition-transform duration-500 ease-spring',
                      active && 'scale-x-100'
                    )}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Search trigger (desktop) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-search'))}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/10 bg-foreground/[0.03] hover:border-jade/40 hover:bg-foreground/[0.06] text-foreground/55 hover:text-foreground text-xs font-sans transition-all duration-300 group"
              aria-label={t('navigation.searchPlaceholder', { defaultValue: 'Buscar no museu (⌘K)' })}
              title={t('navigation.searchPlaceholder', { defaultValue: 'Buscar no museu (⌘K)' })}
            >
              <Search className="w-3.5 h-3.5 text-jade transition-transform duration-300 group-hover:scale-110" />
              <span className="hidden xl:inline">{t('navigation.searchPlaceholder', { defaultValue: 'Buscar espécimes...' })}</span>
              <kbd className="hidden md:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-foreground/10 text-foreground/50">
                ⌘K
              </kbd>
            </button>

            {/* Quick Search trigger (mobile) */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-search'))}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:text-jade hover:bg-foreground/[0.04] transition-colors"
              aria-label={t('navigation.quickSearch', { defaultValue: 'Buscar' })}
            >
              <Search className="w-4 h-4 text-jade" />
            </button>

            {!user && favoriteIds.length > 0 && (
              <Link
                to="/profile"
                aria-label={t('navigation.collection', { count: favoriteIds.length })}
                title={t('navigation.collection', { count: favoriteIds.length })}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset transition-colors duration-300',
                  isActive('/profile') ? 'text-jade ring-jade/40' : 'text-foreground/70 ring-foreground/15 hover:text-jade',
                )}
              >
                <Bookmark className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-jade px-1 text-center font-mono text-[10px] leading-[18px] text-canvas">
                  {favoriteIds.length}
                </span>
              </Link>
            )}
            <Button
              asChild
              variant={isActive(account.href) ? 'accent' : 'outline'}
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link to={account.href}>
                <User className="w-4 h-4" />
                {account.label}
              </Link>
            </Button>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('navigation.menu')}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-foreground/8 py-4">
            <div className="grid gap-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-quick-search'));
                }}
                className="flex items-center justify-between rounded-2xl px-4 py-3 mb-2 text-sm font-medium bg-foreground/[0.04] border border-foreground/10 text-foreground/80 hover:bg-foreground/[0.08] hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-jade" />
                  <span>{t('navigation.searchPlaceholder', { defaultValue: 'Buscar no museu...' })}</span>
                </div>
                <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-foreground/10 text-foreground/60">
                  ⌘K
                </kbd>
              </button>

              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-300',
                      active
                        ? 'bg-foreground/[0.04] text-foreground ring-1 ring-jade/30'
                        : 'text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4 text-jade" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to={account.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground/70 hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <User className="w-4 h-4 text-jade" />
                <span>{account.label}</span>
              </Link>
            </div>

            {/* Mobile language switch bar */}
            <div className="mt-3 pt-3 border-t border-foreground/8 flex items-center justify-between px-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-foreground/45 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-jade" />
                {t('common.language')}
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { code: 'pt-BR', flag: '🇧🇷', label: 'PT' },
                  { code: 'en', flag: '🇺🇸', label: 'EN' },
                  { code: 'es', flag: '🇪🇸', label: 'ES' },
                ].map((l) => {
                  const active = i18n.language === l.code || (l.code === 'pt-BR' && i18n.language.startsWith('pt'));
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => i18n.changeLanguage(l.code)}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all',
                        active
                          ? 'bg-jade text-canvas font-semibold shadow-sm'
                          : 'bg-surface-2 text-foreground/60 hover:text-foreground hover:bg-surface-3'
                      )}
                    >
                      <span className="text-xs">{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}