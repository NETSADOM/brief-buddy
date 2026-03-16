import { Router, Request, Response } from "express";
import { env } from "../../config/env";
import { getTaskById, updateTask } from "../../tasks/taskStore";

export const voiceRouter = Router();

const DIGIT_TO_STATUS: Record<string, "done" | "snoozed" | "delegated"> = {
  "1": "done",
  "2": "snoozed",
  "3": "delegated"
};

function twimlSay(s: string): string {
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
  return `<Say voice="alice">${escaped}</Say>`;
}

voiceRouter.post("/gather", async (req: Request, res: Response): Promise<void> => {
  const digits = (req.body?.Digits ?? req.query?.Digits ?? "").toString().trim();
  const taskIdsRaw = (req.query?.taskIds ?? req.body?.taskIds ?? "").toString();
  const index = Math.max(0, parseInt((req.query?.index ?? req.body?.index ?? "0").toString(), 10));
  const taskIds = taskIdsRaw ? taskIdsRaw.split(",").filter(Boolean) : [];

  const status = DIGIT_TO_STATUS[digits];
  if (status && taskIds[index]) {
    await updateTask(taskIds[index], { status });
  }

  const base = (env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const nextIndex = index + 1;

  if (nextIndex < taskIds.length) {
    const nextTask = await getTaskById(taskIds[nextIndex]);
    const nextText = nextTask?.text?.slice(0, 200) ?? "Next task";
    const nextTaskIds = taskIds.join(",");
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${twimlSay("Got it.")}
  ${twimlSay(`Your next task is: ${nextText}. Press 1 for done, 2 to snooze, 3 to forward.`)}
  <Gather action="${base}/api/voice/gather?taskIds=${encodeURIComponent(nextTaskIds)}&amp;index=${nextIndex}" numDigits="1" timeout="6">
    ${twimlSay("Press 1 for done, 2 to snooze, 3 to forward.")}
  </Gather>
  ${twimlSay("No input. Goodbye.")}
  <Hangup/>
</Response>`;
    res.type("text/xml").send(twiml);
    return;
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${twimlSay("All set. Goodbye.")}
  <Hangup/>
</Response>`;
  res.type("text/xml").send(twiml);
});
