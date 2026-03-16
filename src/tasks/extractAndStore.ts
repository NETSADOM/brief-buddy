import { EmailInsight } from "../types/briefing";
import type { SlackMessage } from "../types/briefing";
import { extractActionItems } from "./taskExtractor";
import { createTask } from "./taskStore";
import { withFallback } from "../utils/timeouts";

const MAX_EMAILS_TO_EXTRACT = 5;
const MAX_SLACK_TO_EXTRACT = 5;

function toPriority(urgencyScore: number): "CRITICAL" | "HIGH" | "NORMAL" | "FYI" {
  if (urgencyScore >= 8) return "CRITICAL";
  if (urgencyScore >= 6) return "HIGH";
  if (urgencyScore >= 3) return "NORMAL";
  return "FYI";
}

export async function extractAndStoreTasks(
  userId: string,
  emails: EmailInsight[],
  slack: SlackMessage[]
): Promise<number> {
  const toExtract: { text: string; source: "email" | "slack"; priority: "CRITICAL" | "HIGH" | "NORMAL" | "FYI" }[] = [];

  for (const e of emails.slice(0, MAX_EMAILS_TO_EXTRACT)) {
    if (!e.requiresAction && e.urgencyScore < 4) continue;
    toExtract.push({
      text: `From: ${e.sender}\nSubject: ${e.subject}\n\n${e.summary}`,
      source: "email",
      priority: toPriority(e.urgencyScore)
    });
  }
  for (const s of slack.slice(0, MAX_SLACK_TO_EXTRACT)) {
    toExtract.push({
      text: `From ${s.from} in #${s.channel}: ${s.message}`,
      source: "slack",
      priority: toPriority(s.urgencyScore)
    });
  }

  const seen = new Set<string>();
  let stored = 0;

  for (const item of toExtract) {
    const extracted = await withFallback(() => extractActionItems(item.text), [], "extract-" + item.source);
    for (const et of extracted) {
      const key = `${et.task.trim().toLowerCase().slice(0, 80)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await createTask({
        userId,
        text: et.task.trim(),
        source: item.source,
        priority: item.priority,
        dueDate: et.dueDate,
        status: "open"
      });
      stored += 1;
    }
  }

  return stored;
}
