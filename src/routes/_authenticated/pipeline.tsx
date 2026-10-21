import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { listOpportunities, updateOpportunity } from "@/lib/data";
import { STAGES, followUpBucket, type Opportunity, type Stage } from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/pipeline")({
  component: PipelinePage,
});

function PipelinePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["opportunities"], queryFn: listOpportunities });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [newStage, setNewStage] = useState<Stage>("saved");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const byStage = useMemo(() => {
    const map: Record<string, Opportunity[]> = {};
    for (const s of STAGES) map[s.id] = [];
    for (const o of data ?? []) (map[o.stage] ??= []).push(o);
    return map;
  }, [data]);

  const move = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: Stage }) => updateOpportunity(id, { stage }),
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: ["opportunities"] });
      const prev = qc.getQueryData<Opportunity[]>(["opportunities"]);
      qc.setQueryData<Opportunity[]>(["opportunities"], (old) =>
        (old ?? []).map((o) => (o.id === id ? { ...o, stage } : o)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["opportunities"], ctx.prev);
      toast.error("Couldn't move card");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });

  function handleDrop(stage: Stage) {
    if (dragId) {
      const card = (data ?? []).find((o) => o.id === dragId);
      if (card && card.stage !== stage) move.mutate({ id: dragId, stage });
    }
    setDragId(null);
    setOverStage(null);
  }

  function openNew(stage: Stage) {
    setEditing(null);
    setNewStage(stage);
    setDialogOpen(true);
  }

  return (
    <AppShell
      title="Booking pipeline"
      description="Drag cards to move each opportunity forward."
      action={
        <Button onClick={() => openNew("saved")}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      }
    >
      <div className="-mx-1 flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => (
          <div
            key={s.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(s.id);
            }}
            onDragLeave={() => setOverStage((cur) => (cur === s.id ? null : cur))}
            onDrop={() => handleDrop(s.id)}
            className={
              "flex w-72 shrink-0 flex-col rounded-xl border bg-card/60 p-2 transition-colors " +
              (overStage === s.id ? "border-primary bg-accent/40" : "border-border")
            }
          >
            <div className="flex items-center justify-between px-2 py-2">
              <div>
                <h3 className="text-sm font-semibold">{s.label}</h3>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {byStage[s.id]?.length ?? 0}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {byStage[s.id]?.map((o) => (
                <Card
                  key={o.id}
                  o={o}
                  dragging={dragId === o.id}
                  onDragStart={() => setDragId(o.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => {
                    setEditing(o);
                    setDialogOpen(true);
                  }}
                />
              ))}
              <button
                onClick={() => openNew(s.id)}
                className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <OpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        opportunity={editing}
        defaultStage={newStage}
      />
    </AppShell>
  );
}

function Card({
  o,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  o: Opportunity;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const bucket = followUpBucket(o.follow_up_date, o.stage);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={
        "cursor-grab rounded-lg border border-border bg-card p-3 shadow-[var(--shadow-paper)] transition active:cursor-grabbing " +
        (dragging ? "opacity-50" : "hover:shadow-[var(--shadow-lift)]")
      }
    >
      <h4 className="text-sm font-semibold leading-snug">{o.name}</h4>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {o.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {o.location}
          </span>
        )}
        {o.genre_fit && <span>· {o.genre_fit}</span>}
      </div>
      {bucket && (
        <span
          className={
            "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium " +
            (bucket === "overdue"
              ? "bg-destructive/15 text-destructive"
              : bucket === "today"
                ? "bg-primary/15 text-primary"
                : "bg-secondary/15 text-secondary")
          }
        >
          {bucket === "overdue"
            ? "Overdue"
            : bucket === "today"
              ? "Due today"
              : "Follow up " + o.follow_up_date}
        </span>
      )}
    </div>
  );
}
