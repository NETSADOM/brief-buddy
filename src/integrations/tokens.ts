import dayjs from "dayjs";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../db/queries";
import { env } from "../config/env";

interface IntegrationRow {
  access_token: string;
  refresh_token: string | null;
  expires_at: Date | null;
}

export async function getIntegrationToken(userId: string, provider: string): Promise<IntegrationRow | null> {
  const result = await pool.query<IntegrationRow>(
    `SELECT access_token, refresh_token, expires_at
     FROM integrations
     WHERE user_id = $1 AND provider = $2`,
    [userId, provider]
  );
  return result.rows[0] ?? null;
}

export async function refreshGoogleTokenIfNeeded(userId: string): Promise<OAuth2Client | null> {
  const token = await getIntegrationToken(userId, "google");
  if (!token) return null;

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? undefined,
    expiry_date: token.expires_at ? token.expires_at.getTime() : undefined
  });

  const needsRefresh = !token.expires_at || dayjs(token.expires_at).isBefore(dayjs().add(2, "minute"));

  if (needsRefresh && token.refresh_token) {
    const { credentials } = await client.refreshAccessToken();
    await pool.query(
      `UPDATE integrations
          SET access_token = $1,
              expires_at = $2
        WHERE user_id = $3 AND provider = 'google'`,
      [credentials.access_token ?? token.access_token, credentials.expiry_date ? new Date(credentials.expiry_date) : null, userId]
    );
    client.setCredentials(credentials);
  }

  return client;
}
