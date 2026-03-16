/**
 * VoiceBrief API client. Uses Vite proxy in dev: /api -> backend (e.g. localhost:3000).
 * In production set VITE_API_BASE or serve frontend and API on same origin.
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getToken(): string | null {
  return localStorage.getItem("voicebrief_token");
}

export function setToken(token: string): void {
  localStorage.setItem("voicebrief_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("voicebrief_token");
  localStorage.removeItem("voicebrief_userId");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

// Auth
export function getDemoToken(): Promise<{ token: string; userId: string }> {
  return api<{ token: string; userId: string }>("/api/auth/demo-token");
}

// Briefings
export interface BriefingRow {
  id: string;
  mode: string;
  script: string;
  audioUrl: string | null;
  deliveryStatus: string;
  deliveredAt: string | null;
  createdAt: string;
}

export function getBriefingsHistory(): Promise<BriefingRow[]> {
  return api<BriefingRow[]>("/api/briefings/history");
}

export function triggerBriefing(mode: string): Promise<{ briefingId: string; script: string; audioUrl: string | null }> {
  return api("/api/briefings/trigger", {
    method: "POST",
    body: JSON.stringify({ mode: mode || "morning" }),
  });
}

// Tasks
export interface TaskRow {
  id: string;
  userId: string;
  text: string;
  source: string;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

export function getTasks(): Promise<TaskRow[]> {
  return api<TaskRow[]>("/api/tasks");
}

export function createTask(body: {
  text: string;
  source?: string;
  priority?: string;
  dueDate?: string | null;
}): Promise<TaskRow> {
  return api<TaskRow>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTask(
  id: string,
  body: Partial<{ text: string; priority: string; dueDate: string | null; status: string }>
): Promise<TaskRow> {
  return api<TaskRow>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export function deleteTask(id: string): Promise<{ deleted: boolean }> {
  return api<{ deleted: boolean }>(`/api/tasks/${id}`, { method: "DELETE" });
}

// Settings
export interface SettingsRow {
  morningTime: string;
  eveningTime: string;
  newsKeywords: string[];
  dealValueThreshold: number;
  urgencyKeywords: string[];
}

export function getSettings(): Promise<SettingsRow> {
  return api<SettingsRow>("/api/settings");
}

export function updateSettings(body: Partial<SettingsRow>): Promise<SettingsRow> {
  return api<SettingsRow>("/api/settings", { method: "PATCH", body: JSON.stringify(body) });
}

export interface IntegrationStatus {
  provider: string;
  connected: boolean;
}

export function getIntegrations(): Promise<IntegrationStatus[]> {
  return api<IntegrationStatus[]>("/api/settings/integrations");
}
