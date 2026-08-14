import { SequenceChord, SequenceMeasure } from './sequencerModel';

export const AIXEL_ASSISTANT_CONTRACT_VERSION = '1' as const;
export const AIXEL_ASSISTANT_MAX_PROMPT_LENGTH = 800;
export const AIXEL_ASSISTANT_MEASURE_COUNT = 8;

export interface AssistantChord {
  key: string;
  extension: string;
  bassInversion?: string;
  isForeignBass?: boolean;
}

export interface AssistantMeasure {
  barNumber: number;
  chordCount: 1 | 2;
  slots: [AssistantChord | null, AssistantChord | null];
}

export interface AiXELAssistantRequest {
  version: typeof AIXEL_ASSISTANT_CONTRACT_VERSION;
  prompt: string;
  context: {
    selectedChord: AssistantChord;
    selectedStyle: string;
    timeSignature: '4/4';
    tempo: number;
    measures: AssistantMeasure[];
  };
}

export interface AiXELAssistantProposal {
  title: string;
  rationale: string;
  measures: AssistantMeasure[];
}

export interface AiXELAssistantResponse {
  version: typeof AIXEL_ASSISTANT_CONTRACT_VERSION;
  message: string;
  proposal?: AiXELAssistantProposal;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isShortString(value: unknown, maxLength: number, allowEmpty = false): value is string {
  return typeof value === 'string' && value.length <= maxLength && (allowEmpty || value.trim().length > 0);
}

function validateChord(value: unknown, path: string, errors: string[]): value is AssistantChord {
  if (!isRecord(value)) {
    errors.push(`${path} must be a chord object`);
    return false;
  }

  let valid = true;
  if (!isShortString(value.key, 3)) {
    errors.push(`${path}.key must be a non-empty musical key`);
    valid = false;
  }
  if (!isShortString(value.extension, 32, true)) {
    errors.push(`${path}.extension must be a string of 32 characters or fewer`);
    valid = false;
  }
  if (value.bassInversion !== undefined && !isShortString(value.bassInversion, 3)) {
    errors.push(`${path}.bassInversion must be a musical key when present`);
    valid = false;
  }
  if (value.isForeignBass !== undefined && typeof value.isForeignBass !== 'boolean') {
    errors.push(`${path}.isForeignBass must be boolean when present`);
    valid = false;
  }
  return valid;
}

function validateMeasure(value: unknown, index: number, errors: string[]): value is AssistantMeasure {
  const path = `measures[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${path} must be a measure object`);
    return false;
  }

  let valid = true;
  if (value.barNumber !== index + 1) {
    errors.push(`${path}.barNumber must be ${index + 1}`);
    valid = false;
  }
  if (value.chordCount !== 1 && value.chordCount !== 2) {
    errors.push(`${path}.chordCount must be 1 or 2`);
    valid = false;
  }
  if (!Array.isArray(value.slots) || value.slots.length !== 2) {
    errors.push(`${path}.slots must contain exactly two positions`);
    return false;
  }

  value.slots.forEach((slot, slotIndex) => {
    if (slot !== null && !validateChord(slot, `${path}.slots[${slotIndex}]`, errors)) valid = false;
  });

  if (value.chordCount === 1 && value.slots[1] !== null) {
    errors.push(`${path}.slots[1] must be null for a single-chord measure`);
    valid = false;
  }
  return valid;
}

function validateMeasures(value: unknown, errors: string[]): value is AssistantMeasure[] {
  if (!Array.isArray(value) || value.length !== AIXEL_ASSISTANT_MEASURE_COUNT) {
    errors.push(`measures must contain exactly ${AIXEL_ASSISTANT_MEASURE_COUNT} bars`);
    return false;
  }
  return value.map((measure, index) => validateMeasure(measure, index, errors)).every(Boolean);
}

export function validateAiXELAssistantRequest(value: unknown): ValidationResult<AiXELAssistantRequest> {
  const errors: string[] = [];
  if (!isRecord(value)) return { success: false, errors: ['request must be an object'] };

  if (value.version !== AIXEL_ASSISTANT_CONTRACT_VERSION) errors.push('unsupported contract version');
  if (!isShortString(value.prompt, AIXEL_ASSISTANT_MAX_PROMPT_LENGTH)) {
    errors.push(`prompt must contain 1 to ${AIXEL_ASSISTANT_MAX_PROMPT_LENGTH} characters`);
  }
  if (!isRecord(value.context)) {
    errors.push('context must be an object');
    return { success: false, errors };
  }

  const context = value.context;
  validateChord(context.selectedChord, 'context.selectedChord', errors);
  if (!isShortString(context.selectedStyle, 80, true)) errors.push('context.selectedStyle must be a string');
  if (context.timeSignature !== '4/4') errors.push('context.timeSignature must be 4/4 in V1');
  if (typeof context.tempo !== 'number' || !Number.isInteger(context.tempo) || context.tempo < 40 || context.tempo > 260) {
    errors.push('context.tempo must be an integer from 40 to 260 BPM');
  }
  validateMeasures(context.measures, errors);

  return errors.length === 0
    ? { success: true, data: value as unknown as AiXELAssistantRequest, errors }
    : { success: false, errors };
}

export function validateAiXELAssistantResponse(value: unknown): ValidationResult<AiXELAssistantResponse> {
  const errors: string[] = [];
  if (!isRecord(value)) return { success: false, errors: ['response must be an object'] };

  if (value.version !== AIXEL_ASSISTANT_CONTRACT_VERSION) errors.push('unsupported contract version');
  if (!isShortString(value.message, 1200)) errors.push('message must contain 1 to 1200 characters');

  if (value.proposal !== undefined) {
    if (!isRecord(value.proposal)) {
      errors.push('proposal must be an object when present');
    } else {
      if (!isShortString(value.proposal.title, 100)) errors.push('proposal.title must contain 1 to 100 characters');
      if (!isShortString(value.proposal.rationale, 800)) errors.push('proposal.rationale must contain 1 to 800 characters');
      validateMeasures(value.proposal.measures, errors);
    }
  }

  return errors.length === 0
    ? { success: true, data: value as unknown as AiXELAssistantResponse, errors }
    : { success: false, errors };
}

export function sequenceToAssistantMeasures(measures: SequenceMeasure[]): AssistantMeasure[] {
  return measures.map((measure) => ({
    barNumber: measure.barNumber,
    chordCount: measure.chordCount,
    slots: measure.slots.map((slot) => slot ? {
      key: slot.key,
      extension: slot.extension,
      ...(slot.bassInversion ? { bassInversion: slot.bassInversion } : {}),
      ...(slot.isForeignBass ? { isForeignBass: true } : {})
    } : null) as AssistantMeasure['slots']
  }));
}

export function assistantMeasuresToSequence(measures: AssistantMeasure[], idFactory: () => string): SequenceMeasure[] {
  return measures.map((measure) => ({
    barNumber: measure.barNumber,
    chordCount: measure.chordCount,
    slots: measure.slots.map((slot): SequenceChord | null => slot ? {
      id: idFactory(),
      key: slot.key,
      extension: slot.extension,
      bassInversion: slot.bassInversion,
      isForeignBass: slot.isForeignBass
    } : null) as SequenceMeasure['slots']
  }));
}
