import twilio from "twilio";
import { env } from "../config/env";
import { withFallback, withTimeout } from "../utils/timeouts";

const twilioClient =
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
    ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    : null;

export interface TopTask {
  id: string;
  text: string;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildTwimlWithGather(
  audioUrl: string,
  topTasks: TopTask[]
): string {
  const base = (env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const taskIds = topTasks.map((t) => t.id).join(",");
  const firstText = escapeXml(topTasks[0].text.slice(0, 200));
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(audioUrl)}</Play>
  <Say voice="alice">Your first task is: ${firstText}. Press 1 for done, 2 to snooze, 3 to forward.</Say>
  <Gather action="${base}/api/voice/gather?taskIds=${encodeURIComponent(taskIds)}&amp;index=0" numDigits="1" timeout="6">
    <Say voice="alice">Press 1 for done, 2 to snooze, 3 to forward.</Say>
  </Gather>
  <Say voice="alice">No input received. Goodbye.</Say>
  <Hangup/>
</Response>`;
}

export async function deliverBriefingCall(
  toPhone: string,
  audioUrl: string | null,
  transcript: string,
  _briefingId?: string,
  topTasks: TopTask[] = []
): Promise<{ status: "delivered" | "sms-fallback" | "skipped"; sid?: string }> {
  const fromPhone = env.TWILIO_PHONE_NUMBER;
  if (!twilioClient || !fromPhone) {
    return { status: "skipped" };
  }

  if (!audioUrl) {
    await twilioClient.messages.create({
      to: toPhone,
      from: fromPhone,
      body: `VoiceBrief fallback transcript:\n\n${transcript}`
    });
    return { status: "sms-fallback" };
  }

  const twiml =
    topTasks.length > 0
      ? buildTwimlWithGather(audioUrl, topTasks)
      : `<?xml version="1.0" encoding="UTF-8"?><Response><Play>${escapeXml(audioUrl)}</Play><Hangup/></Response>`;

  return withFallback<{ status: "delivered" | "sms-fallback" | "skipped"; sid?: string }>(
    () =>
      withTimeout(
        (async () => {
          const call = await twilioClient.calls.create({
            to: toPhone,
            from: fromPhone,
            twiml
          });
          return { status: "delivered" as const, sid: call.sid };
        })(),
        10_000,
        "twilio-call-delivery"
      ),
    { status: "sms-fallback" as const },
    "twilio-call-delivery"
  );
}
