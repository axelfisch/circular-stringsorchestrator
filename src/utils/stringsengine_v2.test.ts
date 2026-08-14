import { describe, expect, it } from 'vitest';
import { StringsEngine } from './stringsengine_v2';
import { evaluateSequence } from './voicingEvaluator';

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

  it('parses slash chords without losing their harmonic quality', () => {
    const engine = new StringsEngine();
    expect(engine.analyzeChordSymbol('Am/C').quality).toBe('min');
    expect(engine.analyzeChordSymbol('D/F#').quality).toBe('maj');
    expect(engine.analyzeChordSymbol('Cmaj7(#11)/D').quality).toBe('maj7(11+)');
  });

  it('supports the dominant flat-five color used in Doux Baiser', () => {
    const result = new StringsEngine().orchestrateChord([40], 'E7(b5)');
    expect(result.voicingType).toBe('7(b5)');
    expect(result.voices.some((voice) => voice.intervalName === '#11')).toBe(true);
  });

  it('keeps all six roles ordered inside the corpus-derived register corridor', () => {
    const result = new StringsEngine().orchestrateChord([48, 52, 55, 59, 62], 'Cmaj9');
    const notes = result.voices.map((voice) => voice.midiNote);

    expect(notes).toEqual([...notes].sort((first, second) => first - second));
    expect(result.voices.find((voice) => voice.voice === 'Contrabass')!.midiNote).toBeLessThanOrEqual(48);
    expect(result.voices.find((voice) => voice.voice === 'Violin1')!.midiNote).toBeLessThanOrEqual(83);
  });

  it('uses continuity for every role across a progression', () => {
    const engine = new StringsEngine();
    const first = engine.orchestrateChord([48, 52, 55, 59, 62], 'Cmaj9');
    const second = engine.orchestrateChord([45, 48, 52, 55, 59], 'Amin11');
    const previous = new Map(first.voices.map((voice) => [voice.voice, voice.midiNote]));

    second.voices.forEach((voice) => {
      expect(Math.abs(voice.midiNote - previous.get(voice.voice)!)).toBeLessThanOrEqual(9);
    });
  });

  it('improves the fixed evaluator progression beyond the V1 baseline', () => {
    const engine = new StringsEngine();
    const progression = [
      { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
      { notes: [45, 48, 52, 55, 59], symbol: 'Amin11' },
      { notes: [50, 53, 57, 60, 64], symbol: 'Dmin9' },
      { notes: [43, 47, 50, 53, 57, 64], symbol: 'G13' },
      { notes: [48, 52, 55, 59, 62], symbol: 'Cmaj9' },
    ];
    const frames = progression.map(({ notes, symbol }) => ({
      label: symbol,
      voices: engine.orchestrateChord(notes, symbol).voices,
    }));

    const evaluation = evaluateSequence(frames);
    expect(evaluation.totalScore).toBeGreaterThanOrEqual(88);
    expect(evaluation.metrics.find((metric) => metric.id === 'parallel-perfects')?.score).toBe(100);
  });

  it('assigns the characteristic available extension to the Crown', () => {
    const engine = new StringsEngine();
    const majorNine = engine.orchestrateChord([48, 52, 55, 59, 62], 'Cmaj9');
    const dominantThirteen = engine.orchestrateChord([43, 47, 50, 53, 57, 64], 'G13');

    expect(majorNine.voices.find((voice) => voice.voice === 'Violin1')?.intervalName).toBe('9');
    expect(dominantThirteen.voices.find((voice) => voice.voice === 'Violin1')?.intervalName).toBe('13');
  });
});
