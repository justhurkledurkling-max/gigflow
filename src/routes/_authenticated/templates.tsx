import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Copy, Trash2, Pencil, Loader2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  bulkCreateTemplates,
} from "@/lib/data";
import {
  TEMPLATE_CATEGORIES,
  templateCategoryLabel,
  STARTER_TEMPLATES,
  type PitchTemplate,
  type TemplateCategory,
} from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["templates"], queryFn: listTemplates });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PitchTemplate | null>(null);

  const seed = useMutation({
    mutationFn: () => bulkCreateTemplates(STARTER_TEMPLATES),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Starter templates added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  return (
    <AppShell
      title="Pitch templates"
      description="Reusable messages so you sound professional, fast."
      action={
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold">No templates yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Start with three proven messages — first outreach, follow-up, and checking availability
            — then edit them to sound like you.
          </p>
          <Button className="mt-4" onClick={() => seed.mutate()} disabled={seed.isPending}>
            {seed.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add starter templates
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Tip: use placeholders like{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{name}}"}</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{venue}}"}</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{artist}}"}</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{epk}}"}</code> and swap them
            in before you send.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {data!.map((t) => (
              <div
                key={t.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-paper)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <span className="mt-1 inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {templateCategoryLabel(t.category)}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText(t.body);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditing(t);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => remove.mutate(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <TemplateDialog open={dialogOpen} onOpenChange={setDialogOpen} template={editing} />
    </AppShell>
  );
}

function TemplateDialog({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: PitchTemplate | null;
}) {
  const qc = useQueryClient();
  const editing = !!template;
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("first_outreach");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open) return;
    if (template) {
      setName(template.name);
      setCategory(template.category as TemplateCategory);
      setBody(template.body);
    } else {
      setName("");
      setCategory("first_outreach");
      setBody("");
    }
  }, [open, template]);

  const save = useMutation({
    mutationFn: async () => {
      if (editing && template) await updateTemplate(template.id, { name, category, body });
      else await createTemplate({ name, category, body });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success(editing ? "Template updated" : "Template created");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Edit template" : "New template"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              toast.error("Give your template a name");
              return;
            }
            save.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First outreach"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your pitch…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
