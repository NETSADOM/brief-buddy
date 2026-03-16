export type PriorityTier = "CRITICAL" | "HIGH" | "NORMAL" | "FYI";

export interface EmailInsight {
  sender: string;
  subject: string;
  summary: string;
  urgencyScore: number;
  requiresAction: boolean;
}

export interface CalendarEvent {
  title: string;
  time: string;
  attendees: string[];
  location: string | null;
  isExternal: boolean;
}

export interface SlackMessage {
  from: string;
  channel: string;
  message: string;
  urgencyScore: number;
}

export interface CrmDeal {
  dealName: string;
  stage: string;
  value: number;
  contactName: string;
  daysSinceActivity: number;
}

export interface NewsHeadline {
  headline: string;
  summary: string;
  source: string;
}

export interface ScoredItem {
  source: "email" | "calendar" | "slack" | "crm" | "news";
  priority: PriorityTier;
  score: number;
  detail: string;
}

export interface BriefingPayload {
  date: string;
  mode: "morning" | "evening" | "weekly" | "alert";
  emails: EmailInsight[];
  calendar: CalendarEvent[];
  slack: SlackMessage[];
  crmDeals: CrmDeal[];
  news: NewsHeadline[];
  scoredItems: ScoredItem[];
  failures: string[];
}
