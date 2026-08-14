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

export const AIXEL_ASSISTANT_CLIENT_TIMEOUT_MS = 22_000;

export interface AiXELAssistantRequestOptions {
  fetcher?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
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
  optionsOrFetcher: AiXELAssistantRequestOptions | typeof fetch = {}
): Promise<AiXELAssistantResponse> {
  const options = typeof optionsOrFetcher === 'function'
    ? { fetcher: optionsOrFetcher }
    : optionsOrFetcher;
  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? AIXEL_ASSISTANT_CLIENT_TIMEOUT_MS;
  let didTimeout = false;
  const abortFromCaller = () => controller.abort(options.signal?.reason);

  if (options.signal?.aborted) abortFromCaller();
  else options.signal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeout = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetcher('/api/aixel-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal
    });
  } catch {
    if (didTimeout) {
      throw new AiXELAssistantClientError('REQUEST_TIMEOUT', 'AiXEL Assistant took too long to respond. Please try again.');
    }
    if (controller.signal.aborted) {
      throw new AiXELAssistantClientError('REQUEST_ABORTED', 'AiXEL Assistant request was cancelled.');
    }
    throw new AiXELAssistantClientError('NETWORK_ERROR', 'AiXEL Assistant could not be reached.');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abortFromCaller);
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
