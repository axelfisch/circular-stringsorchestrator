import type { Context } from '@netlify/functions';
import { describe, expect, it, vi } from 'vitest';
import handler, { config } from '../aixel-assistant';

describe('AiXEL Assistant function hardening', () => {
  it('rate-limits by IP at the Netlify boundary', () => {
    expect(config.rateLimit).toEqual({
      action: 'rate_limit',
      aggregateBy: 'ip',
      windowSize: 60,
      windowLimit: 10
    });
  });

  it('adds traceability while logging no request or musical content', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const response = await handler(
      new Request('https://example.test/api/aixel-assistant', { method: 'GET' }),
      { requestId: 'request-123' } as Context
    );

    expect(response.status).toBe(405);
    expect(response.headers.get('x-request-id')).toBe('request-123');
    expect(log).toHaveBeenCalledOnce();
    const telemetry = JSON.parse(String(log.mock.calls[0][0]));
    expect(telemetry).toEqual({
      event: 'aixel_assistant_request',
      requestId: 'request-123',
      status: 405,
      durationMs: expect.any(Number)
    });
    expect(JSON.stringify(telemetry)).not.toContain('prompt');
    expect(JSON.stringify(telemetry)).not.toContain('measures');
    log.mockRestore();
  });
});
