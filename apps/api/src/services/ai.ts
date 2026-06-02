import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../logger";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const MODEL = "claude-sonnet-4-20250514";

// ─────────────────────────────────────────
// Generate AI-powered DM reply (streaming)
// ─────────────────────────────────────────
export async function generateAiReply(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 300
): Promise<string> {
  try {
    let fullText = "";

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        fullText += chunk.delta.text;
      }
    }

    logger.debug("AI reply generated", {
      inputLength: userMessage.length,
      outputLength: fullText.length,
    });

    return fullText.trim();
  } catch (err) {
    logger.error("AI reply generation failed", {
      error: (err as Error).message,
    });
    throw err;
  }
}

// ─────────────────────────────────────────
// Classify comment sentiment
// ─────────────────────────────────────────
export async function classifySentiment(
  commentText: string
): Promise<"positive" | "negative" | "neutral"> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 10,
      system:
        "You are a sentiment classifier. Respond with exactly one word: positive, negative, or neutral.",
      messages: [
        {
          role: "user",
          content: `Classify the sentiment of this comment: "${commentText}"`,
        },
      ],
    });

    const result = (
      (response.content[0] as any).text ?? "neutral"
    ).toLowerCase().trim();

    if (["positive", "negative", "neutral"].includes(result)) {
      return result as "positive" | "negative" | "neutral";
    }
    return "neutral";
  } catch {
    return "neutral"; // Graceful fallback
  }
}

// ─────────────────────────────────────────
// Build system prompt for an automation
// ─────────────────────────────────────────
export function buildAutomationSystemPrompt(opts: {
  creatorName?: string;
  niche?: string;
  brandVoice?: string;
  automationGoal?: string;
}): string {
  return `You are a helpful assistant for ${opts.creatorName ?? "a creator"} on Instagram.
${opts.niche ? `They create content about: ${opts.niche}` : ""}
${opts.brandVoice ? `Brand voice and tone: ${opts.brandVoice}` : "Be friendly, concise, and helpful."}
${opts.automationGoal ? `Goal of this message: ${opts.automationGoal}` : ""}

Keep replies under 200 characters. Do not use emojis unless appropriate. Do not include URLs unless instructed.
Always be warm and personable. If you cannot help, politely say so.`;
}
