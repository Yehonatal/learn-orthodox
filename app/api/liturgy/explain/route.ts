import { NextRequest, NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llm/adapter";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { textEn, textAm, textGez, role, provider, model, messages } =
            await req.json();
        const llm = getLLMProvider({ provider, model });
        const promptsDir = path.join(process.cwd(), "lib/llm/prompts");

        // Check if this is a follow-up chatbot conversation turn
        if (messages && messages.length > 0) {
            let systemPrompt = fs.readFileSync(
                path.join(promptsDir, "chat.txt"),
                "utf8",
            );
            systemPrompt = systemPrompt
                .replaceAll("{{role}}", role || "N/A")
                .replaceAll("{{textGez}}", textGez || "N/A")
                .replaceAll("{{textAm}}", textAm || "N/A")
                .replaceAll("{{textEn}}", textEn || "N/A");

            const formattedMessages = [
                { role: "system" as const, content: systemPrompt },
                ...messages.map((m: any) => ({
                    role: m.role as "user" | "assistant" | "system",
                    content: m.content,
                })),
            ];

            const response = await llm.complete({
                messages: formattedMessages,
                maxTokens: 10000,
                temperature: 0.3,
            });

            return NextResponse.json({ explanation: response.text });
        }

        // Default: Initial Structured Commentary
        let systemPrompt = fs.readFileSync(
            path.join(promptsDir, "commentary.txt"),
            "utf8",
        );
        systemPrompt = systemPrompt
            .replaceAll("{{role}}", role || "N/A")
            .replaceAll("{{textGez}}", textGez || "N/A")
            .replaceAll("{{textAm}}", textAm || "N/A")
            .replaceAll("{{textEn}}", textEn || "N/A");

        const response = await llm.complete({
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Analyze this passage:
Speaker: "${role}"
English: "${textEn}"
${textAm ? `Amharic: "${textAm}"` : ""}
${textGez ? `Ge'ez: "${textGez}"` : ""}`,
                },
            ],
            maxTokens: 10000,
            temperature: 0.1, // Lower temperature to strictly adhere to JSON format
        });

        return NextResponse.json({ explanation: response.text });
    } catch (error: any) {
        console.error("Liturgy explain route error:", error);
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
                cause: error.cause ? String(error.cause) : undefined,
                stack: error.stack ? String(error.stack) : undefined,
            },
            { status: 500 },
        );
    }
}
