import type { Config, Context } from '@netlify/functions';
import { handleAiXELAssistantRequest } from './_shared/aixelAssistantService';
import { createOpenAiGatewayModel } from './_shared/openAiGatewayModel';

function addRequestId(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Request-Id', requestId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default async (request: Request, context: Context): Promise<Response> => {
  const startedAt = performance.now();
  let response: Response;
  try {
    response = await handleAiXELAssistantRequest(request, createOpenAiGatewayModel());
  } catch {
    response = Response.json(
      {
        error: {
          code: 'ASSISTANT_NOT_CONFIGURED',
          message: 'AiXEL Assistant is not configured for this environment.'
        }
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  }

  console.info(JSON.stringify({
    event: 'aixel_assistant_request',
    requestId: context.requestId,
    status: response.status,
    durationMs: Math.round(performance.now() - startedAt)
  }));
  return addRequestId(response, context.requestId);
};

export const config: Config = {
  path: '/api/aixel-assistant',
  method: 'POST',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: 'ip',
    windowSize: 60,
    windowLimit: 10
  }
};
