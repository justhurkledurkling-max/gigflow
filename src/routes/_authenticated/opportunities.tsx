import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, MapPin, ExternalLink, Compass } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { ImportOpportunities } from "@/components/import-opportunities";
import { StageBadge } from "@/components/stage-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listOpportunities } from "@/lib/data";
import { followUpBucket, type Opportunity } from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/opportunities")({
  component: DiscoveryPage,
});

function DiscoveryPage() {
  const { data, isLoading } = useQuery({ queryKey: ["opportunities"], queryFn: listOpportunities });
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "saved">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (view === "saved") list = list.filter((o) => o.stage === "saved");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) =>
        [o.name, o.location, o.genre_fit, o.contact_info, o.notes]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return list;
  }, [data, view, search]);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(o: Opportunity) {
    setEditing(o);
    setDialogOpen(true);
  }

  return (
    <AppShell
      title="Gig discovery"
      description="Your pipeline of venues and promoters to pitch."
      action={
        <div className="flex items-center gap-2">
          <ImportOpportunities existingNames={(data ?? []).map((o) => o.name)} />
          <Button onClick={openNew}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "all" | "saved")}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venues, cities, notes…"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={openNew} hasAny={(data?.length ?? 0) > 0} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((o) => (
            <OpportunityRow key={o.id} o={o} onClick={() => openEdit(o)} />
          ))}
        </div>
      )}

      <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} opportunity={editing} />
    </AppShell>
  );
}

function OpportunityRow({ o, onClick }: { o: Opportunity; onClick: () => void }) {
  const bucket = followUpBucket(o.follow_up_date, o.stage);
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-paper)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{o.name}</h3>
            <StageBadge stage={o.stage} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {o.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {o.location}
              </span>
            )}
            {o.genre_fit && <span>{o.genre_fit}</span>}
            {o.contact_info && <span className="truncate">{o.contact_info}</span>}
          </div>
          {o.notes && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{o.notes}</p>}
        </div>
        {o.link && (
          <a
            href={o.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      {bucket && (
        <div className="mt-3">
          <span
            className={
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
              (bucket === "overdue"
                ? "bg-destructive/15 text-destructive"
                : bucket === "today"
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary/15 text-secondary")
            }
          >
            Follow up {bucket === "overdue" ? "overdue" : bucket === "today" ? "today" : "on"} ·{" "}
            {o.follow_up_date}
          </span>
        </div>
      )}
    </button>
  );
}

function EmptyState({ onAdd, hasAny }: { onAdd: () => void; hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Compass className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">
        {hasAny ? "Nothing matches" : "Start your pipeline"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasAny
          ? "Try a different search or view."
          : "Save the venues and promoters you want to play. Add contact info, genre fit, and notes."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" /> Add your first opportunity
        </Button>
      )}
    </div>
  );
}
