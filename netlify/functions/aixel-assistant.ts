import type { Config } from '@netlify/functions';
import { handleAiXELAssistantRequest } from './_shared/aixelAssistantService';
import { createOpenAiGatewayModel } from './_shared/openAiGatewayModel';

export default async (request: Request): Promise<Response> => {
  try {
    return await handleAiXELAssistantRequest(request, createOpenAiGatewayModel());
  } catch {
    return Response.json(
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
};

export const config: Config = {
  path: '/api/aixel-assistant',
  method: 'POST'
};
