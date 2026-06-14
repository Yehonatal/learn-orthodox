import type { LLMProvider, LLMRequest, LLMResponse } from '../adapter';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(options?: { apiKey?: string; model?: string }) {
    this.apiKey = options?.apiKey || process.env.LLM_API_KEY || process.env.ANTHROPIC_API_KEY || '';
    this.model = options?.model || process.env.LLM_MODEL || 'claude-3-5-sonnet-latest';
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const system = request.messages.find(m => m.role === 'system')?.content;
    const messages = request.messages.filter(m => m.role !== 'system');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: this.model, max_tokens: request.maxTokens ?? 1000, system, messages }),
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(`Anthropic API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    return {
      text: data.content[0].text,
      usage: { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens },
    };
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      'AnthropicProvider does not support embeddings. ' +
      'Configure LLM_EMBEDDING_PROVIDER=openai separately.'
    );
  }
}
