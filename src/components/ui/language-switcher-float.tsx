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

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcherFloat() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-2xl bg-gradient-primary hover:bg-gradient-primary/90 border-2 border-white/20 backdrop-blur-sm group"
            aria-label="Change language"
          >
            <div className="flex flex-col items-center justify-center">
              <Globe className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs mt-0.5 text-white/90">{currentLanguage.flag}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-card/95 backdrop-blur-lg border-border/50 shadow-xl mb-2"
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="cursor-pointer py-3 px-4 hover:bg-amber/10 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </div>
                {i18n.language === language.code && (
                  <Check className="w-5 h-5 text-amber" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
