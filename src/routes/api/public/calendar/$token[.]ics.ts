import { createFileRoute } from "@tanstack/react-router";

/** Escape special characters for an ICS text value. */
function esc(value: string): string {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold long lines to 75 octets per RFC 5545. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function stamp(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/** Offset (in ms) of an IANA time zone at a given instant. */
function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  const hour = map["hour"] === 24 ? 0 : (map["hour"] ?? 0);
  const asUTC = Date.UTC(
    map["year"] ?? 1970,
    (map["month"] ?? 1) - 1,
    map["day"] ?? 1,
    hour,
    map["minute"] ?? 0,
    map["second"] ?? 0,
  );
  return asUTC - date.getTime();
}

/** Interpret YYYY-MM-DD at a wall-clock hour:minute in a time zone; return the UTC instant. */
function zonedWallTimeToUtc(dateStr: string, hour: number, minute: number, timeZone: string): Date {
  const [y = 1970, m = 1, d = 1] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute, 0);
  // Adjust by the zone's offset at the guessed instant (DST-aware within ~1 day).
  const offset = tzOffsetMs(timeZone, new Date(guess));
  return new Date(guess - offset);
}

/** Validate an IANA time zone name; fall back to UTC when unknown. */
function safeTimeZone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** Hour of day (local to the chosen time zone) a follow-up is scheduled for. */
const DUE_HOUR = 9;

const STAGE_LABELS: Record<string, string> = {
  saved: "Saved",
  ready_to_pitch: "Ready to pitch",
  pitched: "Pitched",
  follow_up_due: "Follow-up due",
  in_conversation: "In conversation",
  booked: "Booked",
  closed: "Closed",
};

/** Convert a "minutes before start" offset into an RFC 5545 TRIGGER value. */
function reminderTrigger(minutesBefore: number): string {
  if (!minutesBefore || minutesBefore <= 0) return "TRIGGER:PT0S";
  const days = Math.floor(minutesBefore / 1440);
  const hours = Math.floor((minutesBefore % 1440) / 60);
  const mins = minutesBefore % 60;
  let dur = "P";
  if (days) dur += `${days}D`;
  if (hours || mins) {
    dur += "T";
    if (hours) dur += `${hours}H`;
    if (mins) dur += `${mins}M`;
  }
  return `TRIGGER:-${dur}`;
}

export const Route = createFileRoute("/api/public/calendar/$token.ics")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as Record<string, string>)["token.ics"] ?? "";
        const token = raw.replace(/\.ics$/i, "");
        const headers: Record<string, string> = {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'inline; filename="gigflow-follow-ups.ics"',
          "Cache-Control": "public, max-age=300",
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("user_id, artist_name, calendar_reminders, calendar_timezone")
          .eq("calendar_token", token)
          .maybeSingle();

        const lines: string[] = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//GigFlow//Follow-ups//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "X-WR-CALNAME:GigFlow Follow-ups",
          "X-WR-CALDESC:Follow-up reminders from your GigFlow booking pipeline",
          "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
          "X-PUBLISHED-TTL:PT6H",
        ];

        if (profile) {
          const rawReminders = Array.isArray(profile.calendar_reminders)
            ? profile.calendar_reminders
            : [1440, 0];
          // De-duplicate, keep valid non-negative offsets; fall back to at-due-time.
          const reminders = Array.from(
            new Set(rawReminders.filter((m) => Number.isFinite(m) && m >= 0)),
          );
          const tz = safeTimeZone(profile.calendar_timezone);
          const { data: opps } = await supabaseAdmin
            .from("opportunities")
            .select(
              "id, name, location, stage, contact_info, notes, follow_up_date, last_contacted_at",
            )
            .eq("user_id", profile.user_id)
            .not("follow_up_date", "is", null)
            .not("stage", "in", "(booked,closed)");

          const { data: logs } = await supabaseAdmin
            .from("outreach_logs")
            .select("opportunity_id, channel, contacted_at")
            .eq("user_id", profile.user_id)
            .order("contacted_at", { ascending: false });

          const latestLogByOpp = new Map<string, { channel: string; contacted_at: string }>();
          for (const log of logs ?? []) {
            if (!latestLogByOpp.has(log.opportunity_id)) {
              latestLogByOpp.set(log.opportunity_id, {
                channel: log.channel,
                contacted_at: log.contacted_at,
              });
            }
          }

          const now = stamp(new Date());
          for (const o of opps ?? []) {
            if (!o.follow_up_date) continue;
            // Schedule the follow-up at DUE_HOUR local time in the artist's time
            // zone, so due times and reminders land correctly for their day.
            const start = zonedWallTimeToUtc(o.follow_up_date, DUE_HOUR, 0, tz);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            const latest = latestLogByOpp.get(o.id);
            const lastContacted = latest?.contacted_at ?? o.last_contacted_at ?? "";
            const descParts = [
              `Stage: ${STAGE_LABELS[o.stage] ?? o.stage}`,
              o.location ? `Location: ${o.location}` : "",
              o.contact_info ? `Contact: ${o.contact_info}` : "",
              latest ? `Outreach channel: ${latest.channel}` : "",
              lastContacted ? `Last contacted: ${lastContacted}` : "",
              o.notes ? `Notes: ${o.notes}` : "",
            ].filter(Boolean);
            lines.push(
              "BEGIN:VEVENT",
              `UID:gigflow-${o.id}@gigflow.app`,
              `DTSTAMP:${now}`,
              `DTSTART:${stamp(start)}`,
              `DTEND:${stamp(end)}`,
              `SUMMARY:Follow up: ${esc(o.name)}`,
              `DESCRIPTION:${esc(descParts.join("\n"))}`,
            );
            for (const m of reminders) {
              lines.push(
                "BEGIN:VALARM",
                "ACTION:DISPLAY",
                `DESCRIPTION:Follow up: ${esc(o.name)}`,
                reminderTrigger(m),
                "END:VALARM",
              );
            }
            lines.push("END:VEVENT");
          }
        }

        lines.push("END:VCALENDAR");
        const body = lines.map(fold).join("\r\n") + "\r\n";
        return new Response(body, { headers });
      },
    },
  },
});
