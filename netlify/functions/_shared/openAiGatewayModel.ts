import OpenAI from 'openai';
import {
  AIXEL_ASSISTANT_CONTRACT_VERSION,
  AiXELAssistantRequest
} from '../../../src/utils/aixelAssistantContract';
import { AiXELAssistantModel } from './aixelAssistantService';

export const AIXEL_ASSISTANT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are AiXEL Assistant, a concise music composition partner for a string orchestrator.
Return JSON only. The object must use contract version "${AIXEL_ASSISTANT_CONTRACT_VERSION}" and contain a short "message".
When the request calls for a progression, also return one "proposal" with a title, rationale, and exactly eight numbered 4/4 measures.
Each measure must contain chordCount 1 or 2 and exactly two slots. Slot 2 must be null when chordCount is 1.
Each non-null chord has a key, extension, and optional bassInversion and isForeignBass.
Preserve musical spelling from the supplied context. Never include HTML, Markdown, local IDs, or fields outside the contract.`;

export function buildAiXELAssistantMessages(request: AiXELAssistantRequest): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({
        task: request.prompt,
        musicalContext: request.context,
        responseContractVersion: request.version
      })
    }
  ];
}

export function createOpenAiGatewayModel(): AiXELAssistantModel {
  return {
    async generate(request) {
      const apiKey = Netlify.env.get('OPENAI_API_KEY');
      const baseURL = Netlify.env.get('OPENAI_BASE_URL');

      if (!apiKey || !baseURL) {
        throw new Error('Netlify AI Gateway environment is unavailable.');
      }

      const client = new OpenAI({ apiKey, baseURL });
      const completion = await client.chat.completions.create({
        model: AIXEL_ASSISTANT_MODEL,
        messages: buildAiXELAssistantMessages(request),
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 2400
      });

      const content = completion.choices[0]?.message.content;
      if (!content) throw new Error('The model returned an empty response.');
      return JSON.parse(content) as unknown;
    }
  };
}
