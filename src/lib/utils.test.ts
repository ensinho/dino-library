import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('keeps custom font sizes next to text colours', () => {
    expect(cn('text-caption', 'text-foreground/50')).toBe('text-caption text-foreground/50');
  });

  it('still resolves real conflicts', () => {
    expect(cn('text-caption', 'text-display-lg')).toBe('text-display-lg');
    expect(cn('text-jade', 'text-foreground')).toBe('text-foreground');
  });
});
