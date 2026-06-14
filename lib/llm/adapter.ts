export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface LLMProvider {
  complete(request: LLMRequest): Promise<LLMResponse>;
  embed(text: string): Promise<number[]>;
}

export function getLLMProvider(options?: { provider?: string; model?: string }): LLMProvider {
  let provider = options?.provider || process.env.LLM_PROVIDER;
  if (!provider) {
    if (process.env.GEMINI_API_KEY) {
      provider = 'google';
    } else {
      provider = 'openai';
    }
  }

  switch (provider) {
    case 'openai':
      return new (require('./providers/openai').OpenAIProvider)({ model: options?.model });
    case 'anthropic':
      return new (require('./providers/anthropic').AnthropicProvider)({ model: options?.model });
    case 'google':
      return new (require('./providers/google').GoogleProvider)({ model: options?.model });
    default:
      throw new Error(`Unknown LLM_PROVIDER: "${provider}". Valid: openai | anthropic | google`);
  }
}
