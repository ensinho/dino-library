import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { dietGroupOf, periodGroupOf, regionOf } from '@/lib/taxonomy';

/**
 * Localised labels for the dataset's free-text columns. Known values map to
 * translated buckets; anything else is shown verbatim rather than hidden.
 */
export function useDinoLabels() {
  const { t } = useTranslation();

  const diet = useCallback(
    (value: string | null | undefined) => {
      const group = dietGroupOf(value);
      return group ? t(`catalog.diet.${group}`) : value || '—';
    },
    [t],
  );

  const period = useCallback(
    (value: string | null | undefined) => {
      const group = periodGroupOf(value);
      if (!group) return value || '—';
      // Keep the qualifier ("Late", "Early") in English-free form: "Late Jurassic" → "Jurassic · late".
      const stage = /\b(early|middle|mid|late)\b/i.exec(value ?? '')?.[1]?.toLowerCase();
      const label = t(`catalog.periods.${group}`);
      return stage ? t(`catalog.periodStage.${stage === 'mid' ? 'middle' : stage}`, { period: label }) : label;
    },
    [t],
  );

  const region = useCallback(
    (livedIn: string | null | undefined, fossilLocation?: string | null) => {
      const r = regionOf(livedIn, fossilLocation);
      return r ? t(`catalog.locations.${r}`) : livedIn || '—';
    },
    [t],
  );

  return { diet, period, region };
}
