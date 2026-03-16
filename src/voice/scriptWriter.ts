import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { BriefingPayload } from "../types/briefing";
import { env } from "../config/env";
import { withFallback, withTimeout } from "../utils/timeouts";

const SYSTEM_PROMPT =
  "You are a personal executive assistant. Write a concise, warm, natural-sounding voice briefing script. " +
  "Use first-person address ('You have...'). Group by: greeting + date, critical alerts, today's schedule, top emails, CRM follow-ups, news, tasks for today, closing. " +
  "Keep total script under 90 seconds when read aloud (~220 words). Use short sentences. Add natural pauses with commas. " +
  "Do not use markdown or bullets, return plain spoken prose only.";

function truncateToWordLimit(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}.`;
}

export async function writeBriefingScript(payload: BriefingPayload): Promise<string> {
  const input = JSON.stringify(payload);

  return withFallback(
    () =>
      withTimeout(
        (async () => {
          if (env.ANTHROPIC_API_KEY) {
            const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 900,
              system: SYSTEM_PROMPT,
              messages: [{ role: "user", content: input }]
            });
            const text = response.content
              .map((block) => ("text" in block ? block.text : ""))
              .join("")
              .trim();
            return truncateToWordLimit(text, 250);
          }

          if (!env.OPENAI_API_KEY) {
            return truncateToWordLimit(
              "Good morning. You have a few updates, but no language model key is configured yet. Please connect your AI provider to generate personalized scripts.",
              250
            );
          }

          const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
          const response = await openai.responses.create({
            model: "gpt-4o",
            input: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: input }
            ]
          });
          return truncateToWordLimit(response.output_text ?? "", 250);
        })(),
        10_000,
        "script-writer"
      ),
    "Good morning. You have updates ready, but one or more data sources were unavailable. Please review your dashboard for details.",
    "script-writer"
  );
}
