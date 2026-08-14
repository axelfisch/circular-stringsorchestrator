import {
  AIXEL_ASSISTANT_CONTRACT_VERSION,
  AiXELAssistantRequest,
  AiXELAssistantResponse,
  sequenceToAssistantMeasures,
  validateAiXELAssistantRequest,
  validateAiXELAssistantResponse
} from './aixelAssistantContract';
import { SequenceMeasure } from './sequencerModel';

export interface AiXELAssistantContextInput {
  prompt: string;
  selectedKey: string;
  selectedExtension: string;
  selectedBassInversion?: string;
  isForeignBass?: boolean;
  selectedStyle: string;
  timeSignature: '4/4';
  tempo: number;
  measures: SequenceMeasure[];
}

interface AssistantErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

export class AiXELAssistantClientError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AiXELAssistantClientError';
    this.code = code;
  }
}

export function buildAiXELAssistantRequest(input: AiXELAssistantContextInput): AiXELAssistantRequest {
  const request: AiXELAssistantRequest = {
    version: AIXEL_ASSISTANT_CONTRACT_VERSION,
    prompt: input.prompt.trim(),
    context: {
      selectedChord: {
        key: input.selectedKey,
        extension: input.selectedExtension,
        ...(input.selectedBassInversion ? { bassInversion: input.selectedBassInversion } : {}),
        ...(input.isForeignBass ? { isForeignBass: true } : {})
      },
      selectedStyle: input.selectedStyle,
      timeSignature: input.timeSignature,
      tempo: input.tempo,
      measures: sequenceToAssistantMeasures(input.measures)
    }
  };

  const validation = validateAiXELAssistantRequest(request);
  if (!validation.success || !validation.data) {
    throw new AiXELAssistantClientError('INVALID_REQUEST', validation.errors.join(' '));
  }
  return validation.data;
}

export async function requestAiXELAssistant(
  request: AiXELAssistantRequest,
  fetcher: typeof fetch = fetch
): Promise<AiXELAssistantResponse> {
  let response: Response;
  try {
    response = await fetcher('/api/aixel-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
  } catch {
    throw new AiXELAssistantClientError('NETWORK_ERROR', 'AiXEL Assistant could not be reached.');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AiXELAssistantClientError('INVALID_RESPONSE', 'AiXEL Assistant returned an unreadable response.');
  }

  if (!response.ok) {
    const errorPayload = payload as AssistantErrorPayload;
    throw new AiXELAssistantClientError(
      errorPayload.error?.code ?? 'ASSISTANT_ERROR',
      errorPayload.error?.message ?? 'AiXEL Assistant is temporarily unavailable.'
    );
  }

  const validation = validateAiXELAssistantResponse(payload);
  if (!validation.success || !validation.data) {
    throw new AiXELAssistantClientError('INVALID_RESPONSE', 'AiXEL Assistant returned an invalid musical proposal.');
  }
  return validation.data;
}
