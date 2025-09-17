
import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('handles falsy values', () => {
    const result = cn('base-class', false, null, undefined, 'another-class');
    expect(result).toBe('base-class another-class');
  });

  it('merges Tailwind classes correctly', () => {
    const result = cn('text-sm text-lg');
    expect(result).toBe('text-lg');
  });

  it('preserves non-conflicting classes', () => {
    const result = cn('text-red-500 bg-blue-500', 'text-green-500');
    expect(result).toBe('bg-blue-500 text-green-500');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class-1', 'class-2'], 'class-3');
    expect(result).toBe('class-1 class-2 class-3');
  });

  it('handles empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles complex tailwind merging', () => {
    const result = cn(
      'hover:bg-gray-100 hover:bg-opacity-50',
      'hover:bg-black'
    );
    expect(result).toBe('hover:bg-opacity-50 hover:bg-black');
  });
});
