import axios from "axios";
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

export async function extractActionItems(message: string): Promise<ExtractedTask[]> {
  const prompt =
    "Extract any action items from this message. Return JSON array of { task, dueDate, source, contactName }. Return empty array if none.\n\nMessage:\n" +
    message;

  return withFallback(
    async () => {
      const baseUrl = env.OLLAMA_BASE_URL ?? "http://localhost:11434";
      const model = env.OLLAMA_MODEL ?? "llama3.2";

      const response = await axios.post(
        `${baseUrl}/api/chat`,
        {
          model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          stream: false
        },
        { timeout: 9000 }
      );

      const text = readOllamaContent(response.data?.message?.content);

      return parseJsonArray(text);
    },
    [],
    "task-extractor"
  );
}
