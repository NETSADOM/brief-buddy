import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import twilio from "twilio";
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
  const stateToken = (req.query?.state ?? req.body?.state ?? "").toString();
  const index = Math.max(0, parseInt((req.query?.index ?? req.body?.index ?? "0").toString(), 10));
  const signature = req.header("x-twilio-signature");
  if (!signature || !env.TWILIO_AUTH_TOKEN) {
    res.status(401).json({ error: "Missing Twilio signature or auth token" });
    return;
  }

  const base = (env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const requestUrl = `${base}${req.originalUrl}`;
  const isValid = twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, requestUrl, req.body ?? {});
  if (!isValid) {
    res.status(401).json({ error: "Invalid Twilio signature" });
    return;
  }

  let userId = "";
  let taskIds: string[] = [];
  try {
    const payload = jwt.verify(stateToken, env.JWT_SECRET) as { sub: string; taskIds: string };
    userId = payload.sub;
    taskIds = String(payload.taskIds ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  } catch {
    res.status(400).json({ error: "Invalid gather state" });
    return;
  }

  const status = DIGIT_TO_STATUS[digits];
  if (status && taskIds[index]) {
    await updateTask(taskIds[index], userId, { status });
  }

  const nextIndex = index + 1;

  if (nextIndex < taskIds.length) {
    const nextTask = await getTaskById(taskIds[nextIndex], userId);
    const nextText = nextTask?.text?.slice(0, 200) ?? "Next task";
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${twimlSay("Got it.")}
  ${twimlSay(`Your next task is: ${nextText}. Press 1 for done, 2 to snooze, 3 to forward.`)}
  <Gather action="${base}/api/voice/gather?state=${encodeURIComponent(stateToken)}&amp;index=${nextIndex}" numDigits="1" timeout="6">
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
