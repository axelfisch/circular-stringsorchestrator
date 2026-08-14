import dna from '../data/AxelFisch_ChamberStrings_DNA_V1.json';
import type { OrchestratedVoice } from './stringsengine_v2';

export type EvaluatorVoice = Pick<OrchestratedVoice, 'voice' | 'midiNote' | 'intervalName'>;

export interface VoicingFrame {
  label?: string;
  voices: EvaluatorVoice[];
}

export interface MetricScore {
  id: string;
  label: string;
  score: number;
  weight: number;
  observation: string;
}

export interface EvaluationResult {
  totalScore: number;
  grade: 'excellent' | 'strong' | 'promising' | 'needs-work';
  metrics: MetricScore[];
  warnings: string[];
}

export interface SequenceEvaluation extends EvaluationResult {
  frameScores: number[];
}

export interface EvaluationComparison {
  baseline: SequenceEvaluation;
  candidate: SequenceEvaluation;
  delta: number;
  improved: boolean;
  metricDeltas: Record<string, number>;
}

export interface SequenceEvaluationOptions {
  bassLanguageTarget?: {
    motionWithinFiveSemitones: number;
    leapAtLeastSevenSemitones: number;
    label?: string;
  };
}

const VOICE_ORDER = ['Violin1', 'Violin2', 'Viola1', 'Viola2', 'Cello', 'Contrabass'] as const;
const ROLE_PROFILE = Object.fromEntries(dna.voiceRoles.map((role) => [role.voice, role]));

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const rounded = (value: number) => Math.round(value * 10) / 10;

function weightedTotal(metrics: MetricScore[]): number {
  const weight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  return rounded(metrics.reduce((sum, metric) => sum + metric.score * metric.weight, 0) / weight);
}

function grade(score: number): EvaluationResult['grade'] {
  if (score >= 85) return 'excellent';
  if (score >= 72) return 'strong';
  if (score >= 58) return 'promising';
  return 'needs-work';
}

function metric(id: string, label: string, score: number, weight: number, observation: string): MetricScore {
  return { id, label, score: rounded(clamp(score)), weight, observation };
}

function orderedVoices(frame: VoicingFrame): Array<EvaluatorVoice | undefined> {
  return VOICE_ORDER.map((name) => frame.voices.find((voice) => voice.voice === name));
}

function distributionScore(observed: number[], target: number[]): number {
  const observedTotal = observed.reduce((sum, value) => sum + value, 0);
  if (observedTotal === 0) return 0;
  const normalized = observed.map((value) => value / observedTotal);
  const variation = normalized.reduce((sum, value, index) => sum + Math.abs(value - target[index]), 0) / 2;
  return clamp((1 - variation) * 100);
}

function intervalClass(semitones: number): number {
  const pitchClass = ((Math.abs(semitones) % 12) + 12) % 12;
  return Math.min(pitchClass, 12 - pitchClass);
}

function evaluateVerticalLanguage(voices: EvaluatorVoice[]): number {
  const classes = Array.from({ length: 7 }, () => 0);
  for (let first = 0; first < voices.length; first += 1) {
    for (let second = first + 1; second < voices.length; second += 1) {
      classes[intervalClass(voices[first].midiNote - voices[second].midiNote)] += 1;
    }
  }
  const bass = voices.find((voice) => voice.voice === 'Contrabass');
  const bassRelative = Array.from({ length: 12 }, () => 0);
  if (bass) {
    voices.forEach((voice) => {
      bassRelative[((voice.midiNote - bass.midiNote) % 12 + 12) % 12] += 1;
    });
  }
  return (
    distributionScore(classes, dna.verticalLanguage.intervalClassWeights) * 0.65 +
    distributionScore(bassRelative, dna.verticalLanguage.bassRelativeWeights) * 0.35
  );
}

function functionScore(voice: EvaluatorVoice): number {
  const interval = (voice.intervalName ?? '').replace('maj7', '7').toLowerCase();
  const preferences: Record<string, string[]> = {
    Violin1: ['9', '#11', '11', '13', '7'],
    Violin2: ['9', '#11', '11', '13', '7'],
    Viola1: ['3', 'b3', '7', 'b7'],
    Viola2: ['3', 'b3', '7', 'b7'],
    Cello: ['r', '5', '3', 'b3'],
    Contrabass: ['r', '5'],
  };
  if (!interval) return 65;
  return preferences[voice.voice]?.includes(interval) ? 100 : 55;
}

export function evaluateVoicing(frame: VoicingFrame): EvaluationResult {
  const ordered = orderedVoices(frame);
  const present = ordered.filter((voice): voice is EvaluatorVoice => Boolean(voice));
  const uniqueCount = new Set(frame.voices.map((voice) => voice.voice)).size;
  const completeness = (Math.min(uniqueCount, VOICE_ORDER.length) / VOICE_ORDER.length) * 100;

  const registerScores = present.map((voice) => {
    const profile = ROLE_PROFILE[voice.voice];
    if (!profile) return 0;
    const [minimum, maximum] = profile.centralRangeMidi;
    const distance = voice.midiNote < minimum ? minimum - voice.midiNote : voice.midiNote > maximum ? voice.midiNote - maximum : 0;
    return clamp(100 - distance * 9);
  });
  const register = registerScores.length ? registerScores.reduce((sum, value) => sum + value, 0) / registerScores.length : 0;

  const gaps: number[] = [];
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const upper = ordered[index];
    const lower = ordered[index + 1];
    if (upper && lower) gaps.push(upper.midiNote - lower.midiNote);
  }
  const crossings = gaps.filter((gap) => gap < 0).length;
  const ordering = gaps.length ? gaps.reduce((sum, gap) => sum + (gap > 0 ? 100 : gap === 0 ? 65 : clamp(50 + gap * 12)), 0) / gaps.length : 0;
  const spacing = gaps.length ? gaps.reduce((sum, gap) => {
    if (gap < 0) return sum;
    if (gap >= dna.ensemble.targetAdjacentGapSemitones.preferredMin && gap <= dna.ensemble.targetAdjacentGapSemitones.preferredMax) {
      return sum + (100 - Math.abs(gap - dna.ensemble.targetAdjacentGapSemitones.median) * 4);
    }
    const boundary = gap < 3 ? 3 : 8;
    return sum + clamp(82 - Math.abs(gap - boundary) * 8);
  }, 0) / gaps.length : 0;

  const pitches = present.map((voice) => voice.midiNote);
  const spanValue = pitches.length ? Math.max(...pitches) - Math.min(...pitches) : 0;
  const span = clamp(100 - Math.abs(spanValue - dna.ensemble.targetVerticalSpanSemitones) * 3.5);
  const harmonicFunction = present.length ? present.reduce((sum, voice) => sum + functionScore(voice), 0) / present.length : 0;
  const verticalLanguage = evaluateVerticalLanguage(present);

  const metrics = [
    metric('coverage', 'Six-role coverage', completeness, 10, `${uniqueCount}/6 distinct roles present`),
    metric('registers', 'Role registers', register, 20, 'Distance from corpus-derived central ranges'),
    metric('ordering', 'Voice order', ordering, 15, `${crossings} adjacent crossing(s)`),
    metric('spacing', 'Adjacent spacing', spacing, 15, `Gaps: ${gaps.join(', ') || 'none'} semitones`),
    metric('span', 'Vertical span', span, 10, `${spanValue} semitones; corpus target ${dna.ensemble.targetVerticalSpanSemitones}`),
    metric('functions', 'Harmonic role placement', harmonicFunction, 15, 'Guide tones centered; extensions favored in upper voices'),
    metric('vertical-language', 'Axel Fisch vertical language', verticalLanguage, 15, 'Interval-class and bass-relative similarity to the MIDI corpus'),
  ];
  const totalScore = weightedTotal(metrics);
  const warnings: string[] = [];
  if (uniqueCount !== 6) warnings.push('The sextet does not contain exactly six distinct roles.');
  if (crossings > 0) warnings.push(`${crossings} adjacent voice crossing(s) detected.`);
  if (spanValue > 46 || spanValue < 20) warnings.push(`Vertical span (${spanValue}) is far from the corpus center.`);
  return { totalScore, grade: grade(totalScore), metrics, warnings };
}

function parallelPerfectRate(frames: VoicingFrame[]): number {
  let parallels = 0;
  let comparisons = 0;
  for (let frameIndex = 1; frameIndex < frames.length; frameIndex += 1) {
    const previous = orderedVoices(frames[frameIndex - 1]);
    const current = orderedVoices(frames[frameIndex]);
    for (let voiceIndex = 0; voiceIndex < VOICE_ORDER.length - 1; voiceIndex += 1) {
      const p1 = previous[voiceIndex]; const p2 = previous[voiceIndex + 1];
      const c1 = current[voiceIndex]; const c2 = current[voiceIndex + 1];
      if (!p1 || !p2 || !c1 || !c2) continue;
      const move1 = c1.midiNote - p1.midiNote;
      const move2 = c2.midiNote - p2.midiNote;
      if (move1 === 0 || move2 === 0 || Math.sign(move1) !== Math.sign(move2)) continue;
      comparisons += 1;
      const before = Math.abs(p1.midiNote - p2.midiNote) % 12;
      const after = Math.abs(c1.midiNote - c2.midiNote) % 12;
      if ((before === 0 || before === 7) && before === after) parallels += 1;
    }
  }
  return comparisons ? parallels / comparisons : 0;
}

export function evaluateSequence(frames: VoicingFrame[], options: SequenceEvaluationOptions = {}): SequenceEvaluation {
  if (frames.length === 0) {
    const empty = metric('frame-quality', 'Average frame quality', 0, 65, 'No frames supplied');
    return { totalScore: 0, grade: 'needs-work', metrics: [empty], warnings: ['No voicing frames supplied.'], frameScores: [] };
  }
  const frameEvaluations = frames.map(evaluateVoicing);
  const frameAverage = frameEvaluations.reduce((sum, result) => sum + result.totalScore, 0) / frameEvaluations.length;

  const motionScores: number[] = [];
  VOICE_ORDER.forEach((voiceName) => {
    const moves: number[] = [];
    for (let index = 1; index < frames.length; index += 1) {
      const previous = frames[index - 1].voices.find((voice) => voice.voice === voiceName);
      const current = frames[index].voices.find((voice) => voice.voice === voiceName);
      if (previous && current) moves.push(Math.abs(current.midiNote - previous.midiNote));
    }
    if (!moves.length) return;
    const profile = ROLE_PROFILE[voiceName];
    const smallRatio = moves.filter((move) => move <= 5).length / moves.length;
    const leapRatio = moves.filter((move) => move >= 7).length / moves.length;
    motionScores.push(clamp(100 - Math.abs(smallRatio - profile.smallMotionTarget) * 80 - Math.max(0, leapRatio - profile.largeLeapBudget) * 130));
  });
  const motion = motionScores.length ? motionScores.reduce((sum, value) => sum + value, 0) / motionScores.length : 100;
  const parallelRate = parallelPerfectRate(frames);
  const parallelScore = clamp(100 - Math.max(0, parallelRate - dna.ensemble.parallelPerfectPolicy.defaultSoftMaximumRate) * 420);

  const bassMoves: number[] = [];
  for (let index = 1; index < frames.length; index += 1) {
    const previous = frames[index - 1].voices.find((voice) => voice.voice === 'Contrabass');
    const current = frames[index].voices.find((voice) => voice.voice === 'Contrabass');
    if (previous && current) bassMoves.push(Math.abs(current.midiNote - previous.midiNote));
  }
  const bassTarget = options.bassLanguageTarget ?? dna.bassLanguage;
  const withinFive = bassMoves.length ? bassMoves.filter((move) => move <= 5).length / bassMoves.length : bassTarget.motionWithinFiveSemitones;
  const largeLeaps = bassMoves.length ? bassMoves.filter((move) => move >= 7).length / bassMoves.length : bassTarget.leapAtLeastSevenSemitones;
  const bassScore = clamp(100 - Math.abs(withinFive - bassTarget.motionWithinFiveSemitones) * 80 - Math.abs(largeLeaps - bassTarget.leapAtLeastSevenSemitones) * 60);

  const metrics = [
    metric('frame-quality', 'Average frame quality', frameAverage, 65, `${frames.length} harmonies evaluated`),
    metric('motion', 'Role-aware melodic motion', motion, 20, 'Small-motion targets and role-specific leap budgets'),
    metric('parallel-perfects', 'Parallel perfect control', parallelScore, 8, `${rounded(parallelRate * 100)}% observed; 2% soft ceiling`),
    metric(
      'bass-motion',
      'Bass movement language',
      bassScore,
      7,
      `${rounded(withinFive * 100)}% within five semitones; ${rounded(largeLeaps * 100)}% large leaps; ${options.bassLanguageTarget?.label ?? 'corpus-wide target'}`,
    ),
  ];
  const totalScore = weightedTotal(metrics);
  const warnings = frameEvaluations.flatMap((result, index) => result.warnings.map((warning) => `Frame ${index + 1}: ${warning}`));
  if (parallelRate > dna.ensemble.parallelPerfectPolicy.defaultSoftMaximumRate) warnings.push('Parallel perfect motion exceeds the corpus soft ceiling; it is penalized, not forbidden.');
  return { totalScore, grade: grade(totalScore), metrics, warnings, frameScores: frameEvaluations.map((result) => result.totalScore) };
}

export function compareEvaluations(baselineFrames: VoicingFrame[], candidateFrames: VoicingFrame[]): EvaluationComparison {
  const baseline = evaluateSequence(baselineFrames);
  const candidate = evaluateSequence(candidateFrames);
  const metricDeltas = Object.fromEntries(candidate.metrics.map((candidateMetric) => {
    const baselineMetric = baseline.metrics.find((item) => item.id === candidateMetric.id);
    return [candidateMetric.id, rounded(candidateMetric.score - (baselineMetric?.score ?? 0))];
  }));
  const delta = rounded(candidate.totalScore - baseline.totalScore);
  return { baseline, candidate, delta, improved: delta > 0, metricDeltas };
}
