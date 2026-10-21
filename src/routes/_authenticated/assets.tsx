import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Copy, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { listAssets, createAsset, deleteAsset } from "@/lib/data";
import { ASSET_TYPES, type Asset, type AssetType } from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/assets")({
  component: AssetsPage,
});

function AssetsPage() {
  const { data } = useQuery({ queryKey: ["assets"], queryFn: listAssets });

  const grouped = useMemo(() => {
    const map: Record<string, Asset[]> = {};
    for (const t of ASSET_TYPES) map[t.id] = [];
    for (const a of data ?? []) (map[a.type] ??= []).push(a);
    return map;
  }, [data]);

  return (
    <AppShell
      title="Asset library"
      description="Keep your bio, links and notes ready to copy and send."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {ASSET_TYPES.map((t) => (
          <AssetGroup key={t.id} type={t.id} items={grouped[t.id] ?? []} />
        ))}
      </div>
    </AppShell>
  );
}

function AssetGroup({ type, items }: { type: AssetType; items: Asset[] }) {
  const meta = ASSET_TYPES.find((t) => t.id === type)!;
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const longText = type === "bio" || type === "tech_note";

  const add = useMutation({
    mutationFn: () => createAsset({ type, label, value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      setLabel("");
      setValue("");
      toast.success(`${meta.label} added`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-paper)]">
      <h2 className="font-display text-lg font-semibold">{meta.plural}</h2>

      <div className="mt-3 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
        {items.map((a) => (
          <div
            key={a.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-border bg-background p-3"
          >
            <div className="min-w-0 flex-1">
              {a.label && <p className="text-sm font-medium">{a.label}</p>}
              <p className="truncate whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {a.value}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  navigator.clipboard.writeText(a.value);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove.mutate(a.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
        />
        {longText ? (
          <Textarea
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={meta.placeholder}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={meta.placeholder}
          />
        )}
        <Button
          size="sm"
          onClick={() => {
            if (!value.trim()) {
              toast.error("Add a value first");
              return;
            }
            add.mutate();
          }}
          disabled={add.isPending}
        >
          {add.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-1 h-4 w-4" />
          )}
          Add {meta.label.toLowerCase()}
        </Button>
      </div>
    </div>
  );
}
