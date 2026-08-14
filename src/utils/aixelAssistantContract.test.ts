import { describe, expect, it } from 'vitest';
import {
  AIXEL_ASSISTANT_CONTRACT_VERSION,
  assistantMeasuresToSequence,
  sequenceToAssistantMeasures,
  validateAiXELAssistantRequest,
  validateAiXELAssistantResponse
} from './aixelAssistantContract';
import { createEmptyMeasures } from './sequencerModel';

function validMeasures() {
  const measures = createEmptyMeasures();
  measures[0].slots[0] = { id: 'local-only', key: 'C', extension: 'maj9' };
  return sequenceToAssistantMeasures(measures);
}

describe('AiXEL Assistant V1 contract', () => {
  it('accepts a bounded request containing the current musical context', () => {
    const result = validateAiXELAssistantRequest({
      version: AIXEL_ASSISTANT_CONTRACT_VERSION,
      prompt: 'Suggest a luminous eight-bar progression.',
      context: {
        selectedChord: { key: 'C', extension: 'maj9' },
        selectedStyle: 'Ballad Jazz',
        timeSignature: '4/4',
        tempo: 92,
        measures: validMeasures()
      }
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects oversized prompts, unsupported meters, and malformed measures', () => {
    const measures = validMeasures();
    measures[0].chordCount = 1;
    measures[0].slots[1] = { key: 'G', extension: '13' };

    const result = validateAiXELAssistantRequest({
      version: AIXEL_ASSISTANT_CONTRACT_VERSION,
      prompt: 'x'.repeat(801),
      context: {
        selectedChord: { key: 'C', extension: '' },
        selectedStyle: '',
        timeSignature: '3/4',
        tempo: 300,
        measures
      }
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain('prompt must contain 1 to 800 characters');
    expect(result.errors).toContain('context.timeSignature must be 4/4 in V1');
    expect(result.errors).toContain('context.tempo must be an integer from 40 to 260 BPM');
    expect(result.errors).toContain('measures[0].slots[1] must be null for a single-chord measure');
  });

  it('accepts a response only when its proposal has eight valid measures', () => {
    const valid = validateAiXELAssistantResponse({
      version: AIXEL_ASSISTANT_CONTRACT_VERSION,
      message: 'Here is a progression that preserves the open AiXEL character.',
      proposal: {
        title: 'Luminous movement',
        rationale: 'Open upper voices and a restrained chromatic bass create the requested lift.',
        measures: validMeasures()
      }
    });
    const invalid = validateAiXELAssistantResponse({
      version: AIXEL_ASSISTANT_CONTRACT_VERSION,
      message: 'Incomplete proposal',
      proposal: { title: 'Short', rationale: 'Only one bar.', measures: validMeasures().slice(0, 1) }
    });

    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
    expect(invalid.errors).toContain('measures must contain exactly 8 bars');
  });

  it('removes local ids before transport and creates fresh ids only when applying', () => {
    const transport = validMeasures();
    const ids = ['new-1', 'new-2'];
    const sequence = assistantMeasuresToSequence(transport, () => ids.shift() ?? 'unused');

    expect(transport[0].slots[0]).not.toHaveProperty('id');
    expect(sequence[0].slots[0]?.id).toBe('new-1');
    expect(sequence[0].slots[0]?.key).toBe('C');
  });
});
