import { describe, expect, it } from 'vitest';
import { AIXEL_ASSISTANT_CONTRACT_VERSION } from '../../../src/utils/aixelAssistantContract';
import { AIXEL_ASSISTANT_MODEL, buildAiXELAssistantMessages } from './openAiGatewayModel';

describe('AiXEL Assistant AI Gateway adapter', () => {
  it('uses a supported economical model and serializes the validated context', () => {
    const messages = buildAiXELAssistantMessages({
      version: AIXEL_ASSISTANT_CONTRACT_VERSION,
      prompt: 'Add a chromatic bass movement.',
      context: {
        selectedChord: { key: 'C', extension: 'maj9' },
        selectedStyle: 'Ballad Jazz',
        timeSignature: '4/4',
        tempo: 92,
        measures: Array.from({ length: 8 }, (_, index) => ({
          barNumber: index + 1,
          chordCount: 1 as const,
          slots: [{ key: 'C', extension: 'maj9' }, null]
        }))
      }
    });

    expect(AIXEL_ASSISTANT_MODEL).toBe('gpt-4o-mini');
    expect(messages[0]).toMatchObject({ role: 'system' });
    expect(messages[1]).toMatchObject({ role: 'user' });
    expect(JSON.stringify(messages)).toContain('chromatic bass movement');
    expect(JSON.stringify(messages)).toContain('Ballad Jazz');
  });
});
