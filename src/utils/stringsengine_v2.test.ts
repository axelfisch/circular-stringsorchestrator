import { describe, expect, it } from 'vitest';
import { StringsEngine } from './stringsengine_v2';

describe('StringsEngine harmonic foundation', () => {
  it('creates six clearly assigned string voices', () => {
    const result = new StringsEngine().orchestrateChord([60, 64, 67, 62], 'Cadd9');

    expect(result.voices).toHaveLength(6);
    expect(result.voices.map((voice) => voice.voice)).toEqual([
      'Contrabass',
      'Cello',
      'Viola2',
      'Viola1',
      'Violin2',
      'Violin1'
    ]);
    expect(result.voicingType).toBe('add9');
  });

  it('honours an alternate bass in the contrabass voice', () => {
    const result = new StringsEngine().orchestrateChord([52, 60, 64, 67, 71], 'Cmaj7');
    const bass = result.voices.find((voice) => voice.voice === 'Contrabass');

    expect(bass).toBeDefined();
    expect(bass!.midiNote % 12).toBe(4);
  });
});
