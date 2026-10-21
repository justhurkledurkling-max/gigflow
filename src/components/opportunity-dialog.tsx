import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  STAGES,
  CHANNELS,
  channelLabel,
  type Opportunity,
  type Stage,
  type Channel,
} from "@/lib/gigflow";
import {
  createOpportunity,
  updateOpportunity,
  listOutreach,
  createOutreach,
  deleteOutreach,
} from "@/lib/data";

const EMPTY = {
  name: "",
  location: "",
  genre_fit: "",
  contact_info: "",
  link: "",
  notes: "",
  stage: "saved" as Stage,
  follow_up_date: "",
};

export function OpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  defaultStage,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  opportunity?: Opportunity | null;
  defaultStage?: Stage;
}) {
  const qc = useQueryClient();
  const editing = !!opportunity;
  const [form, setForm] = useState({ ...EMPTY });

  useEffect(() => {
    if (!open) return;
    if (opportunity) {
      setForm({
        name: opportunity.name,
        location: opportunity.location,
        genre_fit: opportunity.genre_fit,
        contact_info: opportunity.contact_info,
        link: opportunity.link,
        notes: opportunity.notes,
        stage: opportunity.stage as Stage,
        follow_up_date: opportunity.follow_up_date ?? "",
      });
    } else {
      setForm({ ...EMPTY, stage: defaultStage ?? "saved" });
    }
  }, [open, opportunity, defaultStage]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        follow_up_date: form.follow_up_date || null,
      };
      if (editing && opportunity) await updateOpportunity(opportunity.id, payload);
      else await createOpportunity(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success(editing ? "Opportunity updated" : "Opportunity saved");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Edit opportunity" : "New opportunity"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="opp-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) {
              toast.error("Add a venue or promoter name");
              return;
            }
            save.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="o-name">Venue / promoter *</Label>
            <Input
              id="o-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="The Blue Room"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="o-loc">Location</Label>
              <Input
                id="o-loc"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Austin, TX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-genre">Genre fit</Label>
              <Input
                id="o-genre"
                value={form.genre_fit}
                onChange={(e) => set("genre_fit", e.target.value)}
                placeholder="Indie folk"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-contact">Contact info</Label>
            <Input
              id="o-contact"
              value={form.contact_info}
              onChange={(e) => set("contact_info", e.target.value)}
              placeholder="booking@venue.com / @handle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-link">Link / social / profile</Label>
            <Input
              id="o-link"
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="o-follow">Follow-up date</Label>
              <Input
                id="o-follow"
                type="date"
                value={form.follow_up_date}
                onChange={(e) => set("follow_up_date", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="o-notes">Notes</Label>
            <Textarea
              id="o-notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="What makes this a fit, who to ask for…"
            />
          </div>
        </form>

        {editing && opportunity && (
          <>
            <Separator />
            <OutreachSection opportunityId={opportunity.id} />
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="opp-form" disabled={save.isPending}>
            {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Save changes" : "Save opportunity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OutreachSection({ opportunityId }: { opportunityId: string }) {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [channel, setChannel] = useState<Channel>("email");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");

  const logs = useQuery({
    queryKey: ["outreach", opportunityId],
    queryFn: () => listOutreach(opportunityId),
  });

  const add = useMutation({
    mutationFn: () =>
      createOutreach({
        opportunity_id: opportunityId,
        channel,
        contacted_at: date,
        message_notes: notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outreach", opportunityId] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      setNotes("");
      toast.success("Outreach logged");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteOutreach(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach", opportunityId] }),
  });

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold">Outreach log</h3>

      <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you send / say?"
        />
        <Button type="button" size="sm" onClick={() => add.mutate()} disabled={add.isPending}>
          <Plus className="mr-1 h-4 w-4" /> Log outreach
        </Button>
      </div>

      <div className="space-y-2">
        {logs.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No outreach logged yet.</p>
        )}
        {logs.data?.map((l) => (
          <div
            key={l.id}
            className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-xs text-secondary">
                  {channelLabel(l.channel)}
                </span>
                <span className="text-muted-foreground">{l.contacted_at}</span>
              </div>
              {l.message_notes && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {l.message_notes}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => remove.mutate(l.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
