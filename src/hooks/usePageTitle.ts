import { useEffect } from 'react';

const SITE = 'Dino Library';

/** Sets `document.title` for the current route and restores it on unmount. */
export function usePageTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = `${title} · ${SITE}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
