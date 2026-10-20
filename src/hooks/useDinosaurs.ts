import { useQuery } from '@tanstack/react-query';
import { dinosaurService, type DinosaurSpecies } from '@/services/dinosaurService';

/** The full species list — fetched once per session, shared by every page. */
export function useAllDinosaurs() {
  return useQuery({
    queryKey: ['dinosaurs'],
    queryFn: () => dinosaurService.getAll(),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useDinosaur(id: string | undefined) {
  return useQuery({
    queryKey: ['dinosaur', id],
    queryFn: () => dinosaurService.getDinosaurById(id!),
    enabled: Boolean(id),
    staleTime: Infinity,
    retry: (count, error) => error.message !== 'not-found' && count < 2,
  });
}

export function useSpeciesCount() {
  return useQuery({
    queryKey: ['dinosaurs', 'count'],
    queryFn: () => dinosaurService.getCount(),
    staleTime: Infinity,
  });
}

/**
 * Looks up public images for the species currently on screen. Returns a
 * `row_index → url` map; callers fall back to `image_url` while it resolves.
 */
export function useSpeciesImages(items: DinosaurSpecies[]) {
  const key = items.map((d) => d.row_index).join(',');
  const { data } = useQuery({
    queryKey: ['images', key],
    queryFn: async () => {
      await dinosaurService.enrichImages(items);
      return Object.fromEntries(items.map((d) => [d.row_index, d.image_url ?? null]));
    },
    enabled: items.length > 0,
    staleTime: Infinity,
  });
  return (data ?? {}) as Record<string, string | null>;
}
