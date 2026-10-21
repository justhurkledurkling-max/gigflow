import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, CalendarCheck, MapPin, Plus, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { StageBadge } from "@/components/stage-badge";
import { CalendarSync } from "@/components/calendar-sync";
import { Button } from "@/components/ui/button";
import { listOpportunities } from "@/lib/data";
import { followUpBucket, type Opportunity } from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useQuery({ queryKey: ["opportunities"], queryFn: listOpportunities });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  const groups = useMemo(() => {
    const overdue: Opportunity[] = [];
    const today: Opportunity[] = [];
    const upcoming: Opportunity[] = [];
    for (const o of data ?? []) {
      const b = followUpBucket(o.follow_up_date, o.stage);
      if (b === "overdue") overdue.push(o);
      else if (b === "today") today.push(o);
      else if (b === "upcoming") upcoming.push(o);
    }
    const byDate = (a: Opportunity, b: Opportunity) =>
      (a.follow_up_date ?? "").localeCompare(b.follow_up_date ?? "");
    return {
      overdue: overdue.sort(byDate),
      today: today.sort(byDate),
      upcoming: upcoming.sort(byDate),
    };
  }, [data]);

  const stats = useMemo(() => {
    const list = data ?? [];
    return {
      total: list.length,
      active: list.filter((o) => !["booked", "closed"].includes(o.stage)).length,
      booked: list.filter((o) => o.stage === "booked").length,
    };
  }, [data]);

  function open(o: Opportunity) {
    setEditing(o);
    setDialogOpen(true);
  }

  return (
    <AppShell
      title="Dashboard"
      description="What needs your attention today."
      action={
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Opportunities" value={stats.total} />
        <Stat label="Active in pipeline" value={stats.active} />
        <Stat label="Booked" value={stats.booked} accent />
      </div>

      <CalendarSync />

      <div className="grid gap-4 lg:grid-cols-3">
        <Column
          title="Overdue"
          icon={AlertCircle}
          tone="destructive"
          items={groups.overdue}
          onOpen={open}
          empty="Nothing overdue. Nice."
        />
        <Column
          title="Due today"
          icon={CalendarClock}
          tone="primary"
          items={groups.today}
          onOpen={open}
          empty="No follow-ups due today."
        />
        <Column
          title="Upcoming"
          icon={CalendarCheck}
          tone="secondary"
          items={groups.upcoming}
          onOpen={open}
          empty="No upcoming follow-ups."
        />
      </div>

      {(data?.length ?? 0) === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Add opportunities and set follow-up dates to see your reminders here.
          </p>
          <Button asChild variant="link" className="mt-1">
            <Link to="/opportunities">
              Go to discovery <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} opportunity={editing} />
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-paper)]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={"mt-1 font-display text-3xl font-semibold " + (accent ? "text-primary" : "")}>
        {value}
      </p>
    </div>
  );
}

function Column({
  title,
  icon: Icon,
  tone,
  items,
  onOpen,
  empty,
}: {
  title: string;
  icon: typeof AlertCircle;
  tone: "destructive" | "primary" | "secondary";
  items: Opportunity[];
  onOpen: (o: Opportunity) => void;
  empty: string;
}) {
  const toneCls =
    tone === "destructive"
      ? "text-destructive"
      : tone === "primary"
        ? "text-primary"
        : "text-secondary";
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={"h-4 w-4 " + toneCls} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.map((o) => (
            <button
              key={o.id}
              onClick={() => onOpen(o)}
              className="w-full rounded-lg border border-border bg-card p-3 text-left shadow-[var(--shadow-paper)] transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-semibold">{o.name}</h4>
                <StageBadge stage={o.stage} />
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {o.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {o.location}
                  </span>
                )}
                <span className="ml-auto">{o.follow_up_date}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
