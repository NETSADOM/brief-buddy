import axios from "axios";
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

function readOllamaContent(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : typeof item === "object" && item && "text" in item ? String((item as { text?: unknown }).text ?? "") : ""))
      .join("")
      .trim();
  }
  return "";
}

export async function writeBriefingScript(payload: BriefingPayload): Promise<string> {
  const input = JSON.stringify(payload);

  return withFallback(
    () =>
      withTimeout(
        (async () => {
          const baseUrl = env.OLLAMA_BASE_URL ?? "http://localhost:11434";
          const model = env.OLLAMA_MODEL ?? "llama3.2";

          const response = await axios.post(
            `${baseUrl}/api/chat`,
            {
              model,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: input }
              ],
              stream: false
            },
            { timeout: 45000 }
          );

          const text = readOllamaContent(response.data?.message?.content);

          if (!text) {
            return truncateToWordLimit(
              "Good morning. You have a few updates, but the language model did not return a script. Please review your dashboard for details.",
              250
            );
          }

          return truncateToWordLimit(text, 250);
        })(),
        60_000,
        "script-writer"
      ),
    "Good morning. You have updates ready, but one or more data sources were unavailable. Please review your dashboard for details.",
    "script-writer"
  );
}
