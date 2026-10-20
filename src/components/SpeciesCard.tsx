import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SmartImage from '@/components/SmartImage';
import FavoriteButton from '@/components/FavoriteButton';
import { displayName, type DinosaurSpecies } from '@/services/dinosaurService';
import { useDinoLabels } from '@/hooks/useDinoLabels';

interface SpeciesCardProps {
  species: DinosaurSpecies;
  imageUrl?: string | null;
  /** Small label in the top-left corner (defaults to the period). */
  badge?: React.ReactNode;
  /** `full` shows the description and the L/H/Wt index. */
  variant?: 'full' | 'compact';
}

const metric = (value: number | null, unit: string) => (value ? `${value}${unit}` : '—');

export default function SpeciesCard({ species, imageUrl, badge, variant = 'full' }: SpeciesCardProps) {
  const { t } = useTranslation();
  const { diet, period } = useDinoLabels();
  const name = displayName(species) || t('editorial.unknownSpecies');
  const src = imageUrl ?? species.image_url;

  return (
    <article className="group relative flex h-full flex-col">
      <Link
        to={`/species/${species.row_index}`}
        className="absolute inset-0 z-20 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={t('catalog.viewSpecies', { name })}
      />

      <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-3xl bg-surface-1 ring-1 ring-foreground/8">
        {src ? (
          <SmartImage
            src={src}
            alt={species.scientific_name || name}
            className="absolute inset-0 h-full w-full"
            skeletonClassName="rounded-3xl"
            imgClassName="img-duotone-hover h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-2 to-surface-1">
            <img src="/logoDinosaur.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-10" />
          </div>
        )}
        <div className="absolute left-4 top-4 z-10 rounded-full bg-background/55 px-3 py-1.5 text-caption text-foreground/85 ring-1 ring-foreground/10 backdrop-blur-md">
          {badge ?? period(species.geological_period)}
        </div>
        <FavoriteButton speciesId={species.row_index} name={name} className="absolute right-3 top-3 z-30" />
      </div>

      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h3 className="truncate font-display text-xl tracking-[-0.025em] text-foreground transition-colors duration-300 ease-spring group-hover:text-jade">
          {name}
        </h3>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-jade">{diet(species.diet)}</span>
      </div>
      <p className="mb-3 truncate font-mono text-xs italic uppercase tracking-widest text-foreground/40">
        {species.scientific_name}
      </p>

      {variant === 'full' && (
        <>
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-foreground/60">
            {species.meaning}
            {species.behavior_notes ? ` — ${species.behavior_notes}` : ''}
          </p>
          <dl className="hairline-t mt-auto grid grid-cols-3 gap-2 pt-4 text-xs">
            {[
              [t('catalog.stats.lengthShort'), metric(species.length_m, 'm')],
              [t('catalog.stats.heightShort'), metric(species.height_m, 'm')],
              [t('catalog.stats.weightShort'), metric(species.weight_kg, 'kg')],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="mb-0.5 text-caption text-foreground/40">{label}</dt>
                <dd className="font-display tracking-tight text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </article>
  );
}
