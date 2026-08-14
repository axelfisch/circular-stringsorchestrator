import { VOICING_EVALUATION_PROFILES, type VoicingEvaluationProfile } from '../data/voicingEvaluationProfiles';
import { StringsEngine } from './stringsengine_v2';
import { evaluateSequence, type SequenceEvaluation } from './voicingEvaluator';

export interface ProfileEvaluation {
  id: VoicingEvaluationProfile['id'];
  label: string;
  intent: string;
  progression: string[];
  result: SequenceEvaluation;
}

export interface MultiProfileEvaluation {
  evaluator: 'Axel Fisch Multi-Profile Evaluator V1';
  aggregateScore: number;
  lowestProfileScore: number;
  referenceFloor: number;
  excellentFloor: number;
  aggregateFloor: number;
  passesReferenceFloor: boolean;
  passesProfileFloor: boolean;
  passesAggregateFloor: boolean;
  passes: boolean;
  profiles: ProfileEvaluation[];
}

const rounded = (value: number) => Math.round(value * 10) / 10;

export function evaluateProfile(profile: VoicingEvaluationProfile): ProfileEvaluation {
  const engine = new StringsEngine();
  const frames = profile.progression.map(({ notes, symbol }) => ({
    label: symbol,
    voices: engine.orchestrateChord(notes, symbol).voices,
  }));

  return {
    id: profile.id,
    label: profile.label,
    intent: profile.intent,
    progression: profile.progression.map(({ symbol }) => symbol),
    result: evaluateSequence(frames),
  };
}

export function evaluateAllProfiles(
  profiles = VOICING_EVALUATION_PROFILES,
  referenceFloor = 90.4,
  excellentFloor = 85,
  aggregateFloor = 88,
): MultiProfileEvaluation {
  const evaluations = profiles.map(evaluateProfile);
  const aggregateScore = rounded(
    evaluations.reduce((sum, profile) => sum + profile.result.totalScore, 0) / evaluations.length,
  );
  const lowestProfileScore = Math.min(...evaluations.map((profile) => profile.result.totalScore));
  const reference = evaluations.find((profile) => profile.id === 'reference');
  const passesReferenceFloor = Boolean(reference && reference.result.totalScore >= referenceFloor);
  const passesProfileFloor = evaluations.every((profile) => profile.result.totalScore >= excellentFloor);
  const passesAggregateFloor = aggregateScore >= aggregateFloor;

  return {
    evaluator: 'Axel Fisch Multi-Profile Evaluator V1',
    aggregateScore,
    lowestProfileScore,
    referenceFloor,
    excellentFloor,
    aggregateFloor,
    passesReferenceFloor,
    passesProfileFloor,
    passesAggregateFloor,
    passes: passesReferenceFloor && passesProfileFloor && passesAggregateFloor,
    profiles: evaluations,
  };
}
