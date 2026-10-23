import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  short: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en',    short: 'EN', name: 'English',    flag: '🇺🇸' },
  { code: 'pt-BR', short: 'PT', name: 'Português',  flag: '🇧🇷' },
  { code: 'es',    short: 'ES', name: 'Español',    flag: '🇪🇸' },
];

/**
 * Floating language switcher.
 *
 * Editorial pill-style trigger that matches the museum/monograph aesthetic of
 * the rest of the site (hairline ring, jade accents, backdrop-blur, mono caps).
 */
export function LanguageSwitcherFloat() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 animate-fade-in">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 sm:h-11 pl-3 sm:pl-4 pr-3.5 sm:pr-5 rounded-full bg-background/80 backdrop-blur-xl
                       border border-foreground/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)]
                       hover:border-jade/40 hover:bg-background/95
                       transition-all duration-300 ease-spring
                       flex items-center gap-2 sm:gap-2.5 group"
            aria-label={t('common.language')}
          >
            <Globe className="w-4 h-4 text-jade transition-transform duration-500 ease-spring group-hover:rotate-[18deg]" />
            <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/75">
              {current.short}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-56 p-1.5 rounded-2xl bg-background/85 backdrop-blur-xl
                     border border-foreground/10 shadow-2xl"
        >
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/40">
            — {t('common.language')}
          </div>
          {languages.map((language) => {
            const active = i18n.language === language.code;
            return (
              <DropdownMenuItem
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`cursor-pointer rounded-xl px-3 py-2.5 my-0.5
                            focus:bg-foreground/[0.04] hover:bg-foreground/[0.04]
                            transition-colors duration-200
                            ${active ? 'text-foreground' : 'text-foreground/70'}`}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg leading-none" aria-hidden="true">{language.flag}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium tracking-[-0.01em] truncate">
                        {language.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                        {language.short}
                      </span>
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-jade shrink-0" />}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
