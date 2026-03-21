import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL
});

export interface BriefingRecordInput {
  userId: string;
  mode: string;
  script: string;
  audioUrl?: string;
  deliveryStatus?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  timezone: string;
  elevenLabsVoiceId: string | null;
}

export interface UserSettings {
  morningTime: string;
  eveningTime: string;
  newsKeywords: string[];
  dealValueThreshold: number;
  urgencyKeywords: string[];
}

export interface IntegrationUpsertInput {
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
}

export async function saveBriefingRecord(input: BriefingRecordInput): Promise<string> {
  const id = randomUUID();
  await pool.query(
    `INSERT INTO briefings (id, user_id, mode, script, audio_url, delivery_status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, input.userId, input.mode, input.script, input.audioUrl ?? null, input.deliveryStatus ?? "pending"]
  );
  return id;
}

export async function markBriefingDelivered(briefingId: string): Promise<void> {
  await pool.query(
    `UPDATE briefings
       SET delivery_status = 'delivered',
           delivered_at = NOW()
     WHERE id = $1`,
    [briefingId]
  );
}

export async function seedDemoUser(): Promise<string> {
  const email = "demo@voicebrief.local";
  const existing = await pool.query<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows[0]?.id) {
    return existing.rows[0].id;
  }

  const userId = randomUUID();
  await pool.query(
    `INSERT INTO users (id, email, phone, timezone, eleven_labs_voice_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, email, "+15555550100", "America/New_York", env.ELEVENLABS_VOICE_ID ?? null]
  );

  await pool.query(
    `INSERT INTO settings (user_id, news_keywords, deal_value_threshold, urgency_keywords)
     VALUES ($1, $2, $3, $4)`,
    [userId, ["small business", "B2B sales", "local market"], 10000, ["urgent", "asap", "invoice", "contract"]]
  );

  await pool.query(
    `INSERT INTO tasks (id, user_id, text, source, priority, status)
     VALUES ($1, $2, $3, $4, $5, $6), ($7, $2, $8, $9, $10, $11)`,
    [
      randomUUID(),
      userId,
      "Follow up with Acme Corp on signed contract.",
      "manual",
      "HIGH",
      "open",
      randomUUID(),
      "Prepare tomorrow's kickoff deck.",
      "manual",
      "NORMAL",
      "open"
    ]
  );

  return userId;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await pool.query<UserProfile>(
    `SELECT
       id,
       email,
       phone,
       timezone,
       eleven_labs_voice_id AS "elevenLabsVoiceId"
     FROM users
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

export async function listUserIds(): Promise<string[]> {
  const result = await pool.query<{ id: string }>("SELECT id FROM users");
  return result.rows.map((r) => r.id);
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const result = await pool.query<UserSettings>(
    `SELECT
       morning_time AS "morningTime",
       evening_time AS "eveningTime",
       news_keywords AS "newsKeywords",
       deal_value_threshold::float AS "dealValueThreshold",
       urgency_keywords AS "urgencyKeywords"
     FROM settings
     WHERE user_id = $1`,
    [userId]
  );

  return (
    result.rows[0] ?? {
      morningTime: "07:00",
      eveningTime: "18:00",
      newsKeywords: ["small business", "sales", "operations"],
      dealValueThreshold: 10000,
      urgencyKeywords: ["urgent", "asap", "invoice", "contract"]
    }
  );
}

export async function getIntegrationsStatus(userId: string): Promise<{ provider: string; connected: boolean }[]> {
  const result = await pool.query<{ provider: string }>(
    "SELECT provider FROM integrations WHERE user_id = $1",
    [userId]
  );
  const connected = new Set(result.rows.map((r) => r.provider));
  return [
    { provider: "google", connected: connected.has("google") },
    { provider: "slack", connected: connected.has("slack") },
    { provider: "crm", connected: connected.has("crm") }
  ];
}

export async function canSendAlertNow(userId: string): Promise<boolean> {
  const result = await pool.query<{ can_send: boolean }>(
    `SELECT NOT EXISTS (
       SELECT 1
       FROM briefings
       WHERE user_id = $1
         AND mode = 'alert'
         AND created_at > NOW() - INTERVAL '1 hour'
     ) AS can_send`,
    [userId]
  );
  return result.rows[0]?.can_send ?? true;
}

export async function upsertIntegration(input: IntegrationUpsertInput): Promise<void> {
  await pool.query(
    `INSERT INTO integrations (id, user_id, provider, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, provider)
     DO UPDATE
        SET access_token = EXCLUDED.access_token,
            refresh_token = COALESCE(EXCLUDED.refresh_token, integrations.refresh_token),
            expires_at = EXCLUDED.expires_at`,
    [
      randomUUID(),
      input.userId,
      input.provider,
      input.accessToken,
      input.refreshToken ?? null,
      input.expiresAt ?? null
    ]
  );
}
