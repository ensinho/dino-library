import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

export type SmartImageStatus = 'loading' | 'loaded' | 'error';

export interface SmartImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {

  smooth?: boolean;

  skeletonClassName?: string;

  imgClassName?: string;

  fallbackSrc?: string;

  onStatusChange?: (status: SmartImageStatus) => void;
}

export default function SmartImage({
  src,
  alt,
  smooth = true,
  className,
  skeletonClassName,
  imgClassName,
  fallbackSrc = '/placeholder.svg',
  onStatusChange,
  onLoad,
  onError,
  ...rest
}: SmartImageProps) {
  const [status, setStatus] = useState<SmartImageStatus>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const finalSrc = useMemo(() => {
    const s = (src || '').toString().trim();
    return s.length ? s : fallbackSrc;
  }, [src, fallbackSrc]);

  const showSkeleton = smooth && status === 'loading';

  return (
    <div className={cn('relative overflow-hidden rounded-2xl ring-1 ring-foreground/8 bg-surface-1', className)}>
      {showSkeleton && (
        <div
          className={cn(
            'absolute inset-0 h-full w-full img-shimmer',
            skeletonClassName
          )}
          aria-hidden="true"
        />
      )}

      <img
        src={finalSrc}
        alt={alt}
        className={cn(
          'h-full w-full',
          smooth ? 'transition-opacity duration-700 ease-spring' : '',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
        onLoad={(e) => {
          setStatus('loaded');
          onLoad?.(e);
        }}
        onError={(e) => {
          // swap to fallback if the current src isn't already fallback
          const target = e.currentTarget;
          if (target?.src && !target.src.endsWith(fallbackSrc)) {
            target.src = fallbackSrc;
          }
          setStatus('error');
          onError?.(e);
        }}
        {...rest}
      />
    </div>
  );
}
