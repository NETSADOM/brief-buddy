import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { env } from "../config/env";
import { withFallback } from "../utils/timeouts";

export interface ExtractedTask {
  task: string;
  dueDate: string | null;
  source: string;
  contactName: string | null;
}

function parseJsonArray(text: string): ExtractedTask[] {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function extractActionItems(message: string): Promise<ExtractedTask[]> {
  const prompt =
    "Extract any action items from this message. Return JSON array of { task, dueDate, source, contactName }. Return empty array if none.\n\nMessage:\n" +
    message;

  return withFallback(
    async () => {
      if (env.ANTHROPIC_API_KEY) {
        const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }]
        });
        const text = response.content
          .map((block) => ("text" in block ? block.text : ""))
          .join("")
          .trim();
        return parseJsonArray(text);
      }

      if (!env.OPENAI_API_KEY) return [];
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: prompt
      });
      const output = response.output_text ?? "[]";
      return parseJsonArray(output);
    },
    [],
    "task-extractor"
  );
}
