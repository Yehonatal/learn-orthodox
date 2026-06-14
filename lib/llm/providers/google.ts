import type { LLMProvider, LLMRequest, LLMResponse } from "../adapter";

export class GoogleProvider implements LLMProvider {
    private apiKey: string;
    private model: string;

    constructor(options?: { apiKey?: string; model?: string }) {
        this.apiKey =
            options?.apiKey ||
            process.env.LLM_API_KEY ||
            process.env.GEMINI_API_KEY ||
            "";
        this.model =
            options?.model || process.env.LLM_MODEL || "gemini-2.5-flash";
    }

    async complete(request: LLMRequest): Promise<LLMResponse> {
        const systemInstruction = request.messages.find(
            (m) => m.role === "system",
        )?.content;
        const contents = request.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            }));
        const baseUrl =
            process.env.GEMINI_BASE_URL ||
            "https://generativelanguage.googleapis.com";
        const res = await fetch(
            `${baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: systemInstruction
                        ? { parts: [{ text: systemInstruction }] }
                        : undefined,
                    contents,
                    generationConfig: {
                        maxOutputTokens: request.maxTokens ?? 10000,
                        temperature: request.temperature ?? 0.3,
                    },
                }),
            },
        );
        const data = await res.json();
        if (data.error) {
            throw new Error(
                `Google API Error: ${data.error.message || JSON.stringify(data.error)}`,
            );
        }
        return {
            text: data.candidates[0].content.parts[0].text,
            usage: {
                inputTokens: data.usageMetadata.promptTokenCount,
                outputTokens: data.usageMetadata.candidatesTokenCount,
            },
        };
    }

    async embed(text: string): Promise<number[]> {
        const baseUrl =
            process.env.GEMINI_BASE_URL ||
            "https://generativelanguage.googleapis.com";
        const res = await fetch(
            `${baseUrl}/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: { parts: [{ text }] } }),
            },
        );
        const data = await res.json();
        if (data.error) {
            throw new Error(
                `Google Embedding Error: ${data.error.message || JSON.stringify(data.error)}`,
            );
        }
        return data.embedding.values;
    }
}
