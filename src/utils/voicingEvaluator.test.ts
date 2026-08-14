import { describe, expect, it } from 'vitest';
import { compareEvaluations, evaluateSequence, evaluateVoicing, type VoicingFrame } from './voicingEvaluator';

const frame = (notes: number[]): VoicingFrame => ({
  voices: [
    { voice: 'Violin1', midiNote: notes[0], intervalName: '9' },
    { voice: 'Violin2', midiNote: notes[1], intervalName: '13' },
    { voice: 'Viola1', midiNote: notes[2], intervalName: '7' },
    { voice: 'Viola2', midiNote: notes[3], intervalName: '3' },
    { voice: 'Cello', midiNote: notes[4], intervalName: '5' },
    { voice: 'Contrabass', midiNote: notes[5], intervalName: 'R' },
  ],
});

describe('Axel Fisch voicing evaluator', () => {
  it('scores a corpus-aligned sextet above a crossed, out-of-range sextet', () => {
    const aligned = evaluateVoicing(frame([79, 74, 69, 64, 55, 43]));
    const damaged = evaluateVoicing(frame([48, 89, 42, 80, 35, 70]));
    expect(aligned.totalScore).toBeGreaterThan(damaged.totalScore + 25);
    expect(damaged.warnings.some((warning) => warning.includes('crossing'))).toBe(true);
  });

  it('reports explainable register, spacing and ordering metrics', () => {
    const result = evaluateVoicing(frame([79, 74, 69, 64, 55, 43]));
    expect(result.metrics.map((item) => item.id)).toEqual(expect.arrayContaining(['registers', 'ordering', 'spacing', 'span']));
    expect(result.metrics.find((item) => item.id === 'spacing')?.observation).toContain('5, 5, 5');
  });

  it('penalizes repeated parallel perfect motion without forbidding it', () => {
    const parallel = [frame([79, 72, 67, 60, 55, 43]), frame([81, 74, 69, 62, 57, 45]), frame([83, 76, 71, 64, 59, 47])];
    const contrary = [frame([79, 74, 69, 64, 55, 43]), frame([77, 75, 67, 65, 53, 45]), frame([80, 73, 70, 63, 56, 42])];
    const parallelScore = evaluateSequence(parallel).metrics.find((item) => item.id === 'parallel-perfects')?.score ?? 100;
    const contraryScore = evaluateSequence(contrary).metrics.find((item) => item.id === 'parallel-perfects')?.score ?? 0;
    expect(parallelScore).toBeLessThan(contraryScore);
    expect(parallelScore).toBeGreaterThanOrEqual(0);
  });

  it('produces reproducible before/after deltas', () => {
    const baseline = [frame([48, 89, 42, 80, 35, 70]), frame([50, 91, 44, 82, 37, 72])];
    const candidate = [frame([79, 74, 69, 64, 55, 43]), frame([77, 75, 67, 65, 53, 45])];
    const comparison = compareEvaluations(baseline, candidate);
    expect(comparison.improved).toBe(true);
    expect(comparison.delta).toBeGreaterThan(20);
    expect(comparison.metricDeltas['frame-quality']).toBeGreaterThan(0);
  });
});
