import { describe, expect, it, vi } from 'vitest';
import {
  AIXEL_ASSISTANT_CONTRACT_VERSION,
  AiXELAssistantRequest,
  AiXELAssistantResponse,
  AssistantMeasure
} from '../../../src/utils/aixelAssistantContract';
import {
  AIXEL_ASSISTANT_MAX_BODY_BYTES,
  AIXEL_ASSISTANT_SERVER_TIMEOUT_MS,
  AiXELAssistantModel,
  handleAiXELAssistantRequest
} from './aixelAssistantService';

function measures(): AssistantMeasure[] {
  return Array.from({ length: 8 }, (_, index) => ({
    barNumber: index + 1,
    chordCount: 1 as const,
    slots: [{ key: 'C', extension: 'maj9' }, null]
  }));
}

function validRequest(): AiXELAssistantRequest {
  return {
    version: AIXEL_ASSISTANT_CONTRACT_VERSION,
    prompt: 'Create a luminous jazz progression.',
    context: {
      selectedChord: { key: 'C', extension: 'maj9' },
      selectedStyle: 'Ballad Jazz',
      timeSignature: '4/4',
      tempo: 92,
      measures: measures()
    }
  };
}

function validResponse(): AiXELAssistantResponse {
  return {
    version: AIXEL_ASSISTANT_CONTRACT_VERSION,
    message: 'Here is a luminous eight-bar direction.',
    proposal: {
      title: 'Luminous arc',
      rationale: 'Upper extensions keep the strings open while the harmony moves gently.',
      measures: measures()
    }
  };
}

function postRequest(body: unknown, headers: HeadersInit = {}): Request {
  return new Request('https://example.test/api/aixel-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

function modelReturning(value: unknown): AiXELAssistantModel {
  return { generate: vi.fn().mockResolvedValue(value) };
}

describe('AiXEL Assistant Netlify Function service', () => {
  it('rejects non-POST requests before calling the model', async () => {
    const model = modelReturning(validResponse());
    const response = await handleAiXELAssistantRequest(new Request('https://example.test', { method: 'GET' }), model);

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
    expect(model.generate).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and invalid musical context before inference', async () => {
    const model = modelReturning(validResponse());
    const malformed = await handleAiXELAssistantRequest(postRequest('{oops'), model);
    const invalid = await handleAiXELAssistantRequest(postRequest({ ...validRequest(), prompt: '' }), model);

    expect(malformed.status).toBe(400);
    expect(invalid.status).toBe(422);
    expect(await invalid.json()).toMatchObject({ error: { code: 'INVALID_REQUEST' } });
    expect(model.generate).not.toHaveBeenCalled();
  });

  it('requires an explicit JSON content type', async () => {
    const model = modelReturning(validResponse());
    const response = await handleAiXELAssistantRequest(
      new Request('https://example.test/api/aixel-assistant', {
        method: 'POST',
        body: JSON.stringify(validRequest())
      }),
      model
    );

    expect(response.status).toBe(415);
    expect(model.generate).not.toHaveBeenCalled();
  });

  it('rejects oversized bodies without inference', async () => {
    const model = modelReturning(validResponse());
    const response = await handleAiXELAssistantRequest(
      postRequest(validRequest(), { 'Content-Length': String(AIXEL_ASSISTANT_MAX_BODY_BYTES + 1) }),
      model
    );

    expect(response.status).toBe(413);
    expect(model.generate).not.toHaveBeenCalled();
  });

  it('returns only a contract-valid model response', async () => {
    const model = modelReturning(validResponse());
    const response = await handleAiXELAssistantRequest(postRequest(validRequest()), model);

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual(validResponse());
    expect(model.generate).toHaveBeenCalledOnce();
  });

  it('blocks invalid model output', async () => {
    const response = await handleAiXELAssistantRequest(
      postRequest(validRequest()),
      modelReturning({ version: '1', message: 'Incomplete', proposal: { measures: [] } })
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ error: { code: 'INVALID_MODEL_RESPONSE' } });
  });

  it('returns a generic service error without exposing provider details', async () => {
    const model: AiXELAssistantModel = {
      generate: vi.fn().mockRejectedValue(new Error('secret provider detail'))
    };
    const response = await handleAiXELAssistantRequest(postRequest(validRequest()), model);
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(body).not.toContain('secret provider detail');
  });

  it('aborts slow inference at the server boundary', async () => {
    vi.useFakeTimers();
    const model: AiXELAssistantModel = {
      generate: vi.fn((_request, signal) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      }))
    };

    const pendingResponse = handleAiXELAssistantRequest(postRequest(validRequest()), model);
    await vi.advanceTimersByTimeAsync(AIXEL_ASSISTANT_SERVER_TIMEOUT_MS);
    const response = await pendingResponse;

    expect(response.status).toBe(504);
    expect(await response.json()).toMatchObject({ error: { code: 'ASSISTANT_TIMEOUT' } });
    expect(model.generate).toHaveBeenCalledWith(expect.any(Object), expect.any(AbortSignal));
    vi.useRealTimers();
  });
});
