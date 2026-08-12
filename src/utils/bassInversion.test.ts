import { describe, expect, it } from 'vitest';
import { buildFullChord, calculateBassNote } from './bassInversion';

describe('bass inversions', () => {
  it('calculates interval bass notes in every key', () => {
    expect(calculateBassNote('C', 'M3')).toBe('E');
    expect(calculateBassNote('Bb', 'P5')).toBe('F');
  });

  it('builds a readable slash chord', () => {
    expect(buildFullChord('D', 'min9', 'b3', 'm3')).toBe('Dmin9/F');
  });
});
