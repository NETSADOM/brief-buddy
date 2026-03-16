import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import { env } from "../config/env";
import { withTimeout } from "../utils/timeouts";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY }
      : undefined
});

export async function synthesizeSpeech(script: string, voiceId = env.ELEVENLABS_VOICE_ID): Promise<string | null> {
  if (!env.ELEVENLABS_API_KEY || !voiceId) {
    return null;
  }

  return withTimeout(
    (async () => {
      const response = await axios.post<ArrayBuffer>(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text: script,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3
          }
        },
        {
          responseType: "arraybuffer",
          headers: {
            "xi-api-key": env.ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      const key = `briefings/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.mp3`;
      const tmpDir = path.join(process.cwd(), "tmp");
      await fs.mkdir(tmpDir, { recursive: true });
      const tmpPath = path.join(tmpDir, path.basename(key));
      await fs.writeFile(tmpPath, Buffer.from(response.data));

      if (!env.AWS_S3_BUCKET) {
        return tmpPath;
      }

      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: key,
          Body: Buffer.from(response.data),
          ContentType: "audio/mpeg"
        })
      );

      return getSignedUrl(s3Client, new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }), {
        expiresIn: 60 * 60 * 24 * 7
      });
    })(),
    10_000,
    "elevenlabs-tts"
  );
}
