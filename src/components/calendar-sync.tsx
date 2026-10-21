import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Copy, Check, ExternalLink, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getOrCreateProfile, updateProfile } from "@/lib/data";

/** Reminder presets, expressed in minutes before the follow-up due date. */
const REMINDER_OPTIONS: { minutes: number; label: string }[] = [
  { minutes: 0, label: "At due time" },
  { minutes: 60, label: "1 hour before" },
  { minutes: 180, label: "3 hours before" },
  { minutes: 360, label: "Evening before (6pm)" },
  { minutes: 1440, label: "1 day before" },
  { minutes: 2880, label: "2 days before" },
  { minutes: 10080, label: "1 week before" },
];

/** IANA time zones offered in the picker; the browser's detected zone is added on top. */
const TIMEZONE_OPTIONS = (() => {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [
          "UTC",
          "America/New_York",
          "America/Chicago",
          "America/Denver",
          "America/Los_Angeles",
          "Europe/London",
          "Europe/Paris",
          "Europe/Berlin",
          "Asia/Tokyo",
          "Australia/Sydney",
        ];
  return Array.from(new Set(["UTC", ...supported]));
})();

export function CalendarSync() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getOrCreateProfile,
  });
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTz, setSavingTz] = useState(false);
  const [detectedTz, setDetectedTz] = useState("UTC");

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      setDetectedTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setDetectedTz("UTC");
    }
  }, []);

  const typed = profile as
    | {
        id?: string;
        calendar_token?: string;
        calendar_reminders?: number[];
        calendar_timezone?: string;
      }
    | undefined;
  const token = typed?.calendar_token;
  const reminders = useMemo(
    () => new Set(typed?.calendar_reminders ?? [1440, 0]),
    [typed?.calendar_reminders],
  );
  const timezone = typed?.calendar_timezone || "UTC";

  if (!token || !origin) return null;

  const feedUrl = `${origin}/api/public/calendar/${token}.ics`;
  const googleUrl = `https://calendar.google.com/calendar/u/0/r/settings/addbyurl?cid=${encodeURIComponent(
    feedUrl,
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      toast.success("Feed URL copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  }

  async function toggleReminder(minutes: number) {
    if (!typed?.id || saving) return;
    const next = new Set(reminders);
    if (next.has(minutes)) next.delete(minutes);
    else next.add(minutes);
    const value = Array.from(next).sort((a, b) => a - b);
    setSaving(true);
    try {
      await updateProfile(typed.id, { calendar_reminders: value });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Reminders updated — your calendar refreshes automatically");
    } catch {
      toast.error("Couldn't save reminders");
    } finally {
      setSaving(false);
    }
  }

  async function changeTimezone(next: string) {
    if (!typed?.id || savingTz || next === timezone) return;
    setSavingTz(true);
    try {
      await updateProfile(typed.id, { calendar_timezone: next });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Timezone updated — your calendar refreshes automatically");
    } catch {
      toast.error("Couldn't save timezone");
    } finally {
      setSavingTz(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-paper)]">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-secondary/15 p-2 text-secondary">
          <CalendarPlus className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold">Sync follow-ups to your calendar</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Subscribe once and every follow-up due date appears in Google Calendar — and stays
            updated automatically as your pipeline changes.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              readOnly
              value={feedUrl}
              className="font-mono text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={copy} className="shrink-0">
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button asChild className="shrink-0">
                <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                  Add to Google <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-secondary" />
              Your timezone
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow-ups are scheduled for 9:00 AM and reminders fire based on this timezone.
            </p>
            <div className="mt-3 max-w-xs">
              <Select value={timezone} onValueChange={changeTimezone} disabled={savingTz}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timezone !== detectedTz && (
                    <SelectItem value={detectedTz}>{detectedTz} (detected)</SelectItem>
                  )}
                  {TIMEZONE_OPTIONS.filter(
                    (tz) => tz !== detectedTz || timezone === detectedTz,
                  ).map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-secondary" />
              Notifications for each follow-up
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose when your calendar reminds you. These apply to every follow-up event.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map((opt) => {
                const active = reminders.has(opt.minutes);
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => toggleReminder(opt.minutes)}
                    disabled={saving}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                      active
                        ? "border-secondary bg-secondary/15 text-secondary"
                        : "border-border bg-background text-muted-foreground hover:border-secondary/50"
                    }`}
                  >
                    {active && <Check className="mr-1 inline h-3 w-3" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {reminders.size === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No reminders selected — events will still appear, without notifications.
              </p>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            In Google Calendar, "Add to Google" opens{" "}
            <span className="font-medium">Add by URL</span>. Other apps: add a calendar "From URL"
            and paste this link. Booked and closed gigs are left off.
          </p>
        </div>
      </div>
    </div>
  );
}
