import {
  AiXELAssistantRequest,
  AiXELAssistantResponse,
  validateAiXELAssistantRequest,
  validateAiXELAssistantResponse
} from '../../../src/utils/aixelAssistantContract';

export const AIXEL_ASSISTANT_MAX_BODY_BYTES = 64 * 1024;
export const AIXEL_ASSISTANT_SERVER_TIMEOUT_MS = 18_000;

export interface AiXELAssistantModel {
  generate(request: AiXELAssistantRequest, signal: AbortSignal): Promise<unknown>;
}

interface ErrorPayload {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

function jsonResponse(body: AiXELAssistantResponse | ErrorPayload, status: number, extraHeaders: HeadersInit = {}): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: string[],
  extraHeaders?: HeadersInit
): Response {
  return jsonResponse({ error: { code, message, ...(details ? { details } : {}) } }, status, extraHeaders);
}

function bodySizeInBytes(body: string): number {
  return new TextEncoder().encode(body).byteLength;
}

export async function handleAiXELAssistantRequest(
  request: Request,
  model: AiXELAssistantModel
): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Use POST for this endpoint.', undefined, { Allow: 'POST' });
  }

  const contentType = request.headers.get('content-type') ?? '';
  const mediaType = contentType.split(';', 1)[0].trim().toLowerCase();
  if (mediaType !== 'application/json') {
    return errorResponse(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json.');
  }

  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > AIXEL_ASSISTANT_MAX_BODY_BYTES) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'The request body could not be read.');
  }

  if (bodySizeInBytes(rawBody) > AIXEL_ASSISTANT_MAX_BODY_BYTES) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'The request body must contain valid JSON.');
  }

  const requestValidation = validateAiXELAssistantRequest(payload);
  if (!requestValidation.success || !requestValidation.data) {
    return errorResponse(
      422,
      'INVALID_REQUEST',
      'The musical request does not satisfy the AiXEL Assistant V1 contract.',
      requestValidation.errors
    );
  }

  let candidate: unknown;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AIXEL_ASSISTANT_SERVER_TIMEOUT_MS);
  try {
    candidate = await model.generate(requestValidation.data, controller.signal);
  } catch {
    if (controller.signal.aborted) {
      return errorResponse(504, 'ASSISTANT_TIMEOUT', 'AiXEL Assistant took too long to respond.');
    }
    return errorResponse(503, 'ASSISTANT_UNAVAILABLE', 'AiXEL Assistant is temporarily unavailable.');
  } finally {
    clearTimeout(timeout);
  }

  const responseValidation = validateAiXELAssistantResponse(candidate);
  if (!responseValidation.success || !responseValidation.data) {
    return errorResponse(
      502,
      'INVALID_MODEL_RESPONSE',
      'AiXEL Assistant returned an invalid musical proposal.'
    );
  }

  return jsonResponse(responseValidation.data, 200);
}
