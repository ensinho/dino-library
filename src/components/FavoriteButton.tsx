import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  speciesId: string;
  name: string;
  /** `overlay` sits on top of a card image; `inline` is a text button. */
  variant?: 'overlay' | 'inline';
  className?: string;
}

export default function FavoriteButton({ speciesId, name, variant = 'overlay', className }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(speciesId);
  const label = active ? t('favorites.remove', { name }) : t('favorites.add', { name });

  const onClick = (e: React.MouseEvent) => {
    // Cards are links — keep the click from navigating.
    e.preventDefault();
    e.stopPropagation();
    toggle(speciesId);
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        className={cn(
          'text-caption flex items-center gap-2 transition-colors duration-300',
          active ? 'text-jade' : 'text-foreground/50 hover:text-jade',
          className,
        )}
      >
        <Bookmark className={cn('h-3.5 w-3.5', active && 'fill-current')} />
        {active ? t('favorites.saved') : t('favorites.save')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-background/55 backdrop-blur-md ring-1 ring-foreground/10',
        'transition-all duration-300 ease-spring hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade',
        active ? 'text-jade' : 'text-foreground/70 hover:text-jade',
        className,
      )}
    >
      <Bookmark className={cn('h-4 w-4', active && 'fill-current')} />
    </button>
  );
}
