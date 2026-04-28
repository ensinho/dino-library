    import * as React from 'react';
import { cn } from '@/lib/utils';
import styles from './DinoLoader.module.css';

type DinoLoaderSize = 'sm' | 'md' | 'lg';

export interface DinoLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual size of the running track. Defaults to `md`. */
  size?: DinoLoaderSize;
  /** Optional caption rendered below the track (e.g. "Loading fossils…"). */
  label?: string;
  /** Accessible label announced to screen readers. Defaults to `label` or "Loading". */
  ariaLabel?: string;
}

export const DinoLoader = React.forwardRef<HTMLDivElement, DinoLoaderProps>(
  ({ size = 'md', label, ariaLabel, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel ?? label ?? 'Loading'}
        className={cn(styles.root, styles[size], className)}
        {...rest}
      >
        <span className={styles.logo} aria-hidden="true" />
        {label ? <span className={styles.label}>{label}</span> : null}
        <span className="sr-only">{ariaLabel ?? label ?? 'Loading'}</span>
      </div>
    );
  }
);
DinoLoader.displayName = 'DinoLoader';

export interface LoadingScreenProps extends Omit<DinoLoaderProps, 'size'> {
  /** Size of the inner loader. Defaults to `lg` for full-screen presentation. */
  size?: DinoLoaderSize;
}

/**
 * LoadingScreen
 * -------------
 * Fixed, blurred overlay anchoring the DinoLoader in the viewport center.
 * Drop-in replacement for any "page is loading" state.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  size = 'lg',
  label,
  className,
  ...rest
}) => {
  return (
    <div className={cn(styles.overlay, className)}>
      <DinoLoader size={size} label={label} {...rest} />
    </div>
  );
};

export default DinoLoader;
