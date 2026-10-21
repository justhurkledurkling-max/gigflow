import type { Tables } from "@/integrations/supabase/types";

export type Opportunity = Tables<"opportunities">;
export type OutreachLog = Tables<"outreach_logs">;
export type Asset = Tables<"assets">;
export type Profile = Tables<"profiles">;
export type PitchTemplate = Tables<"pitch_templates">;

export type Stage =
  | "saved"
  | "ready_to_pitch"
  | "pitched"
  | "follow_up_due"
  | "in_conversation"
  | "booked"
  | "closed";

export const STAGES: { id: Stage; label: string; hint: string }[] = [
  { id: "saved", label: "Saved", hint: "On the radar" },
  { id: "ready_to_pitch", label: "Ready to pitch", hint: "Materials ready" },
  { id: "pitched", label: "Pitched", hint: "Outreach sent" },
  { id: "follow_up_due", label: "Follow-up due", hint: "Nudge needed" },
  { id: "in_conversation", label: "In conversation", hint: "Talking details" },
  { id: "booked", label: "Booked", hint: "Locked in" },
  { id: "closed", label: "Closed / not a fit", hint: "Archived" },
];

export const stageLabel = (id: string) => STAGES.find((s) => s.id === id)?.label ?? id;

export type Channel = "email" | "instagram_dm" | "form" | "text";

export const CHANNELS: { id: Channel; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "instagram_dm", label: "Instagram DM" },
  { id: "form", label: "Form submission" },
  { id: "text", label: "Text message" },
];

export const channelLabel = (id: string) => CHANNELS.find((c) => c.id === id)?.label ?? id;

export type TemplateCategory = "first_outreach" | "follow_up" | "availability" | "other";

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "first_outreach", label: "First outreach" },
  { id: "follow_up", label: "Follow-up" },
  { id: "availability", label: "Checking availability" },
  { id: "other", label: "Other" },
];

export const templateCategoryLabel = (id: string) =>
  TEMPLATE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export type AssetType =
  "bio" | "photo" | "music_link" | "social_link" | "video_link" | "tech_note" | "press_quote";

export const ASSET_TYPES: { id: AssetType; label: string; plural: string; placeholder: string }[] =
  [
    { id: "bio", label: "Bio", plural: "Bios", placeholder: "Paste a short or long bio…" },
    { id: "photo", label: "Photo", plural: "Photos", placeholder: "Image URL (https://…)" },
    {
      id: "music_link",
      label: "Music link",
      plural: "Music links",
      placeholder: "Spotify, Bandcamp, SoundCloud…",
    },
    {
      id: "social_link",
      label: "Social link",
      plural: "Social links",
      placeholder: "Instagram, TikTok, website…",
    },
    {
      id: "video_link",
      label: "Video / live clip",
      plural: "Video & live clips",
      placeholder: "YouTube / Vimeo link",
    },
    {
      id: "press_quote",
      label: "Press quote",
      plural: "Press quotes",
      placeholder: "“A voice that stops the room.” — Magazine",
    },
    {
      id: "tech_note",
      label: "Tech / setup note",
      plural: "Tech & setup notes",
      placeholder: "Stage plot, input list, gear…",
    },
  ];

export const assetTypeMeta = (id: string) => ASSET_TYPES.find((t) => t.id === id);

export type FollowUpBucket = "overdue" | "today" | "upcoming";

/** Returns the follow-up bucket for a date string (YYYY-MM-DD), or null when none/closed. */
export function followUpBucket(dateStr: string | null, stage: string): FollowUpBucket | null {
  if (!dateStr || stage === "booked" || stage === "closed") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  if (d < today) return "overdue";
  if (d.getTime() === today.getTime()) return "today";
  return "upcoming";
}

export function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "artist"}-${suffix}`;
}

export function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Date `days` from today as YYYY-MM-DD — used by "snooze" actions. */
export function isoInDays(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "Mon 12 May" style label, falling back to the raw value for odd input. */
export function formatDateLabel(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export const STARTER_TEMPLATES: { name: string; category: TemplateCategory; body: string }[] = [
  {
    name: "First outreach",
    category: "first_outreach",
    body: "Hi {{name}},\n\nI'm {{artist}}, a {{genre}} artist based in {{location}}. I love what you're doing at {{venue}} and think my sound would be a great fit for your crowd.\n\nHere's a quick look at my music and live clips: {{epk}}\n\nWould you be open to chatting about an upcoming slot? Happy to send anything else you need.\n\nThanks so much,\n{{artist}}",
  },
  {
    name: "Follow-up nudge",
    category: "follow_up",
    body: "Hi {{name}},\n\nJust circling back on my note from last week about playing {{venue}}. I know things get busy — no pressure at all, just wanted to keep this on your radar.\n\nMy EPK with music, photos and live video is here: {{epk}}\n\nWould love to find a date that works.\n\nCheers,\n{{artist}}",
  },
  {
    name: "Checking availability",
    category: "availability",
    body: "Hi {{name}},\n\nHope you're well! I'm putting together dates for the next couple of months and {{venue}} is at the top of my list. Do you have any openings I could be considered for?\n\nFull materials here: {{epk}}\n\nThanks,\n{{artist}}",
  },
];
