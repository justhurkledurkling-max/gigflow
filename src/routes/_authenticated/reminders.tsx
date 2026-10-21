import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BellRing, CalendarClock, Check, CheckCheck, Moon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StageBadge } from "@/components/stage-badge";
import { toast } from "sonner";
import { listOpportunities, setFollowUpDates } from "@/lib/data";
import {
  followUpBucket,
  formatDateLabel,
  isoInDays,
  todayISO,
  type Opportunity,
} from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/reminders")({
  head: () => ({
    meta: [
      { title: "Follow-up reminders — GigFlow" },
      {
        name: "description",
        content:
          "Overdue, due today, and upcoming gig follow-ups in one list, so no venue goes quiet.",
      },
      { property: "og:title", content: "Follow-up reminders — GigFlow" },
      {
        property: "og:description",
        content: "Overdue, due today, and upcoming gig follow-ups in one list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RemindersPage,
});

function RemindersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["opportunities"], queryFn: listOpportunities });

  const groups = useMemo(() => {
    const today = todayISO();
    const overdue: Opportunity[] = [];
    const dueToday: Opportunity[] = [];
    const upcoming: Opportunity[] = [];
    for (const o of data ?? []) {
      const bucket = followUpBucket(o.follow_up_date, o.stage);
      if (bucket === "overdue") overdue.push(o);
      else if (bucket === "today") dueToday.push(o);
      else if (bucket === "upcoming") upcoming.push(o);
    }
    const byDate = (a: Opportunity, b: Opportunity) =>
      (a.follow_up_date ?? "").localeCompare(b.follow_up_date ?? "");
    return {
      overdue: overdue.sort(byDate),
      dueToday: dueToday.sort(byDate),
      upcoming: upcoming.sort(byDate),
    };
  }, [data]);

  if (isLoading) {
    return (
      <AppShell title="Follow-ups" description="Who to nudge today.">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  const total = groups.overdue.length + groups.dueToday.length + groups.upcoming.length;

  return (
    <AppShell
      title="Follow-ups"
      description="Every nudge you set, oldest first. Clear it when it's handled."
      action={
        <Button asChild variant="outline">
          <a href="/pipeline">Open pipeline</a>
        </Button>
      }
    >
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CheckCheck className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">Nothing to chase</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Set a follow-up date on any opportunity and it shows up here when it's due.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <Section
            title="Overdue"
            subtitle="These slipped. Handle them first."
            icon={<AlertTriangle className="h-4 w-4" />}
            tone="text-destructive"
            items={groups.overdue}
            emptyLabel="Nothing overdue."
          />
          <Section
            title="Due today"
            subtitle="A short note today keeps you in the running."
            icon={<BellRing className="h-4 w-4" />}
            tone="text-primary"
            items={groups.dueToday}
            emptyLabel="Nothing due today."
          />
          <Section
            title="Coming up"
            subtitle="Scheduled ahead — nothing to do yet."
            icon={<CalendarClock className="h-4 w-4" />}
            tone="text-secondary"
            items={groups.upcoming}
            emptyLabel="No upcoming follow-ups."
          />
        </div>
      )}
    </AppShell>
  );
}

function Section({
  title,
  subtitle,
  icon,
  tone,
  items,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: string;
  items: Opportunity[];
  emptyLabel: string;
}) {
  if (!items.length) return null;
  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <span className={tone}>{icon}</span>
        <h2 className={`font-display text-lg font-semibold ${tone}`}>{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {items.length}
        </span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{subtitle}</p>
      <div className="grid gap-3">
        {items.map((o) => (
          <ReminderRow key={o.id} o={o} />
        ))}
      </div>
    </section>
  );
}

function ReminderRow({ o }: { o: Opportunity }) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["opportunities"] });

  const patch = useMutation({
    mutationFn: (follow_up_date: string | null) => setFollowUpDates([{ id: o.id, follow_up_date }]),
    onSuccess: (_d, follow_up_date) => {
      invalidate();
      toast.success(
        follow_up_date ? `Nudged to ${formatDateLabel(follow_up_date)}` : "Marked handled",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-paper)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{o.name}</h3>
            <StageBadge stage={o.stage} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {[o.location, o.genre_fit].filter(Boolean).join(" · ") || "No location set"}
            <span className="mx-2 text-border">|</span>
            <span className="font-mono text-xs">
              {o.follow_up_date ? formatDateLabel(o.follow_up_date) : "no date"}
            </span>
          </p>
          {o.contact_info && (
            <p className="mt-1 truncate text-sm text-muted-foreground">{o.contact_info}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => patch.mutate(isoInDays(7))}
            disabled={patch.isPending}
          >
            <Moon className="mr-1 h-3.5 w-3.5" /> Next week
          </Button>
          <Button size="sm" onClick={() => patch.mutate(null)} disabled={patch.isPending}>
            <Check className="mr-1 h-3.5 w-3.5" /> Done
          </Button>
        </div>
      </div>
    </div>
  );
}
