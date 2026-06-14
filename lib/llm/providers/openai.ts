import type { LLMProvider, LLMRequest, LLMResponse } from "../adapter";

export class OpenAIProvider implements LLMProvider {
    private apiKey: string;
    private model: string;
    private embeddingModel =
        process.env.LLM_EMBEDDING_MODEL ?? "text-embedding-3-small";

    constructor(options?: { apiKey?: string; model?: string }) {
        this.apiKey =
            options?.apiKey ||
            process.env.LLM_API_KEY ||
            process.env.OPENAI_API_KEY ||
            "";
        this.model = options?.model || process.env.LLM_MODEL || "gpt-4o";
    }

    async complete(request: LLMRequest): Promise<LLMResponse> {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: request.messages,
                max_tokens: request.maxTokens ?? 1000,
                temperature: request.temperature ?? 0.3,
            }),
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(
                `OpenAI API Error: ${data.error.message || JSON.stringify(data.error)}`,
            );
        }
        return {
            text: data.choices[0].message.content,
            usage: {
                inputTokens: data.usage.prompt_tokens,
                outputTokens: data.usage.completion_tokens,
            },
        };
    }

    async embed(text: string): Promise<number[]> {
        const res = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({ model: this.embeddingModel, input: text }),
        });
        const data = await res.json();
        if (data.error) {
            throw new Error(
                `OpenAI Embedding Error: ${data.error.message || JSON.stringify(data.error)}`,
            );
        }
        return data.data[0].embedding;
    }
}
