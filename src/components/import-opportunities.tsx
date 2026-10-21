import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importOpportunities, type OpportunityImport } from "@/lib/data";

/** Minimal RFC4180-ish CSV parser (handles quotes, commas, tabs, newlines). */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === "," || c === "\t") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const ALIASES: Record<string, string[]> = {
  name: ["name", "venue", "promoter", "venue/promoter", "company", "contact name", "title"],
  location: ["location", "city", "address", "region", "state"],
  genre_fit: ["genre", "genre fit", "genrefit", "style", "tags"],
  contact_info: ["contact", "email", "e-mail", "phone", "contact info", "handle", "instagram"],
  link: ["link", "url", "website", "social", "profile"],
  notes: ["notes", "note", "description", "comments"],
  stage: ["stage", "status"],
  follow_up_date: ["follow up", "follow-up", "followup", "follow up date", "follow-up date", "due"],
};

const STAGE_WORDS: Record<string, string> = {
  saved: "saved",
  new: "saved",
  ready: "ready_to_pitch",
  ready_to_pitch: "ready_to_pitch",
  "ready to pitch": "ready_to_pitch",
  pitched: "pitched",
  sent: "pitched",
  followup: "follow_up_due",
  "follow up": "follow_up_due",
  follow_up_due: "follow_up_due",
  "follow-up due": "follow_up_due",
  conversation: "in_conversation",
  in_conversation: "in_conversation",
  "in conversation": "in_conversation",
  booked: "booked",
  confirmed: "booked",
  closed: "closed",
  done: "closed",
  "not a fit": "closed",
};

function mapHeaders(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const key = h.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(ALIASES)) {
      if (map[field] === undefined && aliases.includes(key)) map[field] = i;
    }
  });
  return map;
}

function looksLikeHeader(row: string[]) {
  const map = mapHeaders(row);
  return map["name"] !== undefined || Object.keys(map).length >= 2;
}

export function rowsToOpportunities(text: string): OpportunityImport[] {
  const rows = parseCSV(text);
  const first = rows[0];
  if (!first) return [];
  const hasHeader = looksLikeHeader(first);
  const map = hasHeader ? mapHeaders(first) : { name: 0, contact_info: 1, location: 2 };
  const body = hasHeader ? rows.slice(1) : rows;
  const get = (r: string[], f: string) => {
    const idx = map[f];
    return idx === undefined ? "" : (r[idx] ?? "").trim();
  };

  return body
    .map((r) => {
      const rawStage = get(r, "stage").toLowerCase();
      const date = get(r, "follow_up_date");
      return {
        name: get(r, "name").slice(0, 120),
        location: get(r, "location").slice(0, 120),
        genre_fit: get(r, "genre_fit").slice(0, 120),
        contact_info: get(r, "contact_info").slice(0, 200),
        link: get(r, "link").slice(0, 500),
        notes: get(r, "notes").slice(0, 2000),
        stage: STAGE_WORDS[rawStage] ?? "saved",
        follow_up_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      };
    })
    .filter((r) => r.name !== "");
}

const SAMPLE = `name,location,genre fit,contact,link,notes
The Basement,"Nashville, TN",indie rock,booking@thebasement.com,https://thebasement.com,Great 200-cap room`;

export function ImportOpportunities({ existingNames }: { existingNames: string[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [skipDupes, setSkipDupes] = useState(true);

  const parsed = useMemo(() => (text.trim() ? rowsToOpportunities(text) : []), [text]);
  const existing = useMemo(
    () => new Set(existingNames.map((n) => n.trim().toLowerCase())),
    [existingNames],
  );
  const toImport = skipDupes
    ? parsed.filter((p) => !existing.has(p.name.trim().toLowerCase()))
    : parsed;

  const run = useMutation({
    mutationFn: () => importOpportunities(toImport),
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success(`Imported ${count} opportunit${count === 1 ? "y" : "ies"}`);
      setText("");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFile = async (file?: File) => {
    if (!file) return;
    setText(await file.text());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setText("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-1.5 h-4 w-4" /> Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import venues &amp; contacts</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="import-file">Upload a CSV file</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Exported from Google Sheets, Excel, Notion, or your phone's contacts.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="import-text">…or paste rows</Label>
            <Textarea
              id="import-text"
              rows={7}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={SAMPLE}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Recognized columns: name, location, genre, contact, link, notes, stage, follow-up
              date. Extra columns are ignored.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={skipDupes}
              onChange={(e) => setSkipDupes(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Skip names I already have
          </label>

          {text.trim() && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                {toImport.length} ready to import
                {parsed.length !== toImport.length &&
                  ` · ${parsed.length - toImport.length} duplicate(s) skipped`}
              </p>
              {toImport.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {toImport.slice(0, 5).map((p, i) => (
                    <li key={i} className="truncate">
                      {p.name}
                      {p.location && ` — ${p.location}`}
                      {p.contact_info && ` · ${p.contact_info}`}
                    </li>
                  ))}
                  {toImport.length > 5 && <li>+{toImport.length - 5} more…</li>}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button type="button" onClick={() => run.mutate()} disabled={toImport.length === 0}>
            {run.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Import {toImport.length > 0 ? toImport.length : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
