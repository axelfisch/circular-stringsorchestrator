import { describe, expect, it } from 'vitest';
import { VOICING_EVALUATION_PROFILES } from '../data/voicingEvaluationProfiles';
import { evaluateAllProfiles, evaluateProfile } from './voicingProfileEvaluator';

describe('Axel Fisch multi-profile evaluator', () => {
  it('defines reproducible synthetic and real-composition profiles', () => {
    expect(VOICING_EVALUATION_PROFILES.map((profile) => profile.id)).toEqual([
      'reference',
      'lyrical',
      'kinetic',
      'modal',
      'doux-baiser',
    ]);
    expect(VOICING_EVALUATION_PROFILES.every((profile) => profile.progression.length >= 5)).toBe(true);
  });

  it('starts each profile with an independent engine state', () => {
    const lyrical = VOICING_EVALUATION_PROFILES.find((profile) => profile.id === 'lyrical')!;
    expect(evaluateProfile(lyrical)).toEqual(evaluateProfile(lyrical));
    expect(evaluateProfile(lyrical).bassMoves).toHaveLength(lyrical.progression.length - 1);
  });

  it('preserves the 90.4 reference floor and excellent scores across all profiles', () => {
    const evaluation = evaluateAllProfiles();
    expect(evaluation.passesReferenceFloor).toBe(true);
    expect(evaluation.passesProfileFloor).toBe(true);
    expect(evaluation.passesAggregateFloor).toBe(true);
    expect(evaluation.passes).toBe(true);
    expect(evaluation.profiles).toHaveLength(5);
  });

  it('preserves the complete 24-measure Doux Baiser source form', () => {
    const profile = VOICING_EVALUATION_PROFILES.find((item) => item.id === 'doux-baiser')!;
    expect(profile.source?.composer).toBe('Axel Fisch');
    expect(profile.source?.tempoBpm).toBe(65);
    expect(profile.progression).toHaveLength(48);
    expect(profile.progression[profile.progression.length - 1]).toMatchObject({ measure: 24, symbol: 'D/A', beats: 4 });
    expect(profile.progression.find((event) => event.measure === 19)).toMatchObject({ beats: 2 });
  });

  it('detects a raised aggregate threshold without changing the measured result', () => {
    const evaluation = evaluateAllProfiles(VOICING_EVALUATION_PROFILES, 90.4, 85, 95);
    expect(evaluation.aggregateScore).toBeGreaterThanOrEqual(88);
    expect(evaluation.aggregateScore).toBeLessThan(95);
    expect(evaluation.passesAggregateFloor).toBe(false);
    expect(evaluation.passes).toBe(false);
  });

  it('recognizes connected Lyrical bass motion instead of rewarding artificial leaps', () => {
    const evaluation = evaluateAllProfiles();
    const lyrical = evaluation.profiles.find((profile) => profile.id === 'lyrical')!;
    const bassMetric = lyrical.result.metrics.find((metric) => metric.id === 'bass-motion')!;
    expect(lyrical.bassMoves.every((movement) => movement <= 5)).toBe(true);
    expect(bassMetric.score).toBe(100);
    expect(bassMetric.observation).toContain('Lyrical connected-bass target');
  });

  it('reports the weakest profile and explainable metrics for every character', () => {
    const evaluation = evaluateAllProfiles();
    expect(evaluation.lowestProfileScore).toBe(
      Math.min(...evaluation.profiles.map((profile) => profile.result.totalScore)),
    );
    evaluation.profiles.forEach((profile) => {
      expect(profile.result.metrics.map((metric) => metric.id)).toEqual(
        expect.arrayContaining(['frame-quality', 'motion', 'parallel-perfects', 'bass-motion']),
      );
    });
  });
});
