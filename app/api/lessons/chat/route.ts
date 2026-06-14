import { NextRequest, NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llm/adapter";

export async function POST(req: NextRequest) {
    try {
        const { lessonTitle, lessonText, messages, provider, model } = await req.json();
        
        const llm = getLLMProvider({ provider, model });

        const systemPrompt = `You are a scholarly theologian and teacher specializing in the theology, patristics, history, and traditions of the Ethiopian Orthodox Tewahedo Church (EOTC).
Your goal is to help students learn and explore Orthodox teachings. 

Context about the topic or lesson they are currently studying:
- Title: ${lessonTitle || "General Orthodox Study"}
${lessonText ? `- Lesson Text/Information:\n${lessonText}` : ""}

Dialogue Guidelines:
1. Provide scholarly, precise, and objective responses centered on EOTC tradition, dogmas, liturgy, and teaching.
2. Maintain a respectful, encouraging, and educational tone.
3. You can answer in Amharic or English depending on the language the user addresses you in. If they write in Amharic, reply in Amharic; if they write in English, reply in English.
4. Support your explanations with references to Scripture, EOTC Liturgy (Qiddase), the Church Fathers (e.g. St. Athanasius, St. Cyril, St. Ephrem), or the Five Pillars of Mystery (አምስቱ አዕማደ ምስጢር) where appropriate.
5. Go straight to the explanation without unnecessary generic chat filler or preamble.`;

        const formattedMessages = [
            { role: "system" as const, content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
            })),
        ];

        const response = await llm.complete({
            messages: formattedMessages,
            maxTokens: 3000,
            temperature: 0.3,
        });

        return NextResponse.json({ text: response.text });
    } catch (error: any) {
        console.error("Lessons chat API error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
