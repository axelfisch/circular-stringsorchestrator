import { describe, expect, it, vi } from 'vitest';
import { AIXEL_ASSISTANT_CONTRACT_VERSION } from './aixelAssistantContract';
import {
  AiXELAssistantClientError,
  buildAiXELAssistantRequest,
  requestAiXELAssistant
} from './aixelAssistantClient';
import { createEmptyMeasures } from './sequencerModel';

function buildRequest() {
  return buildAiXELAssistantRequest({
    prompt: '  Suggest a luminous progression.  ',
    selectedKey: 'C',
    selectedExtension: 'maj9',
    selectedStyle: 'Ballad Jazz',
    timeSignature: '4/4',
    tempo: 92,
    measures: createEmptyMeasures()
  });
}

describe('AiXEL Assistant browser client', () => {
  it('builds a validated request without transporting local chord ids', () => {
    const measures = createEmptyMeasures();
    measures[0].slots[0] = { id: 'local-id', key: 'C', extension: 'maj9' };
    const request = buildAiXELAssistantRequest({
      prompt: 'Create a progression.',
      selectedKey: 'C',
      selectedExtension: 'maj9',
      selectedStyle: 'Ballad Jazz',
      timeSignature: '4/4',
      tempo: 92,
      measures
    });

    expect(request.prompt).toBe('Create a progression.');
    expect(request.context.measures[0].slots[0]).not.toHaveProperty('id');
  });

  it('posts the versioned request and accepts a validated response', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({
      version: AIXEL_ASSISTANT_CONTRACT_VERSION,
      message: 'A concise musical answer.'
    }));

    const response = await requestAiXELAssistant(buildRequest(), fetcher);

    expect(response.message).toBe('A concise musical answer.');
    expect(fetcher).toHaveBeenCalledWith('/api/aixel-assistant', expect.objectContaining({ method: 'POST' }));
  });

  it('surfaces safe server errors and rejects malformed success payloads', async () => {
    const serverError = vi.fn().mockResolvedValue(Response.json(
      { error: { code: 'ASSISTANT_UNAVAILABLE', message: 'Try again shortly.' } },
      { status: 503 }
    ));
    const malformed = vi.fn().mockResolvedValue(Response.json({ version: '1', message: '' }));

    await expect(requestAiXELAssistant(buildRequest(), serverError)).rejects.toMatchObject({
      code: 'ASSISTANT_UNAVAILABLE',
      message: 'Try again shortly.'
    });
    await expect(requestAiXELAssistant(buildRequest(), malformed)).rejects.toBeInstanceOf(AiXELAssistantClientError);
  });

  it('times out a stalled request and forwards cancellation without treating it as a network error', async () => {
    vi.useFakeTimers();
    const stalledFetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }));

    const timedOut = requestAiXELAssistant(buildRequest(), { fetcher: stalledFetcher, timeoutMs: 50 });
    const timeoutExpectation = expect(timedOut).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' });
    await vi.advanceTimersByTimeAsync(50);
    await timeoutExpectation;

    const caller = new AbortController();
    const cancelled = requestAiXELAssistant(buildRequest(), { fetcher: stalledFetcher, signal: caller.signal, timeoutMs: 500 });
    caller.abort();
    await expect(cancelled).rejects.toMatchObject({ code: 'REQUEST_ABORTED' });
    vi.useRealTimers();
  });
});
