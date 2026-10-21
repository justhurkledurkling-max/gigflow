import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Loader2, Globe, Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getOrCreateProfile, updateProfile } from "@/lib/data";
import type { Profile } from "@/lib/gigflow";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getOrCreateProfile,
  });
  const [form, setForm] = useState<Partial<Profile>>({});
  const initializedFor = useRef<string | null>(null);

  // Initialize the form once per profile; later cache refetches must not
  // clobber edits the user hasn't saved yet.
  useEffect(() => {
    if (profile && initializedFor.current !== profile.id) {
      initializedFor.current = profile.id;
      setForm(profile);
    }
  }, [profile]);

  const set = (k: keyof Profile, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      if (!profile) return;
      await updateProfile(profile.id, {
        artist_name: form.artist_name ?? "",
        bio: form.bio ?? "",
        genre: form.genre ?? "",
        location: form.location ?? "",
        contact_email: form.contact_email ?? "",
        contact_phone: form.contact_phone ?? "",
        website: form.website ?? "",
        hero_image_url: form.hero_image_url ?? "",
        is_public: form.is_public ?? false,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("EPK saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublic = useMutation({
    mutationFn: async (v: boolean) => {
      if (!profile) return;
      await updateProfile(profile.id, { is_public: v });
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(v ? "Your EPK is now public" : "Your EPK is now private");
    },
  });

  const publicUrl =
    profile && typeof window !== "undefined" ? `${window.location.origin}/epk/${profile.slug}` : "";

  if (isLoading || !profile) {
    return (
      <AppShell title="Artist EPK" description="Your shareable press kit.">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Artist EPK"
      description="One clean page to send venues and promoters."
      action={
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Artist name">
                <Input
                  value={form.artist_name ?? ""}
                  onChange={(e) => set("artist_name", e.target.value)}
                  placeholder="Your stage name"
                />
              </FormField>
              <FormField label="Genre">
                <Input
                  value={form.genre ?? ""}
                  onChange={(e) => set("genre", e.target.value)}
                  placeholder="Indie folk"
                />
              </FormField>
              <FormField label="Location">
                <Input
                  value={form.location ?? ""}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Austin, TX"
                />
              </FormField>
              <FormField label="Hero image URL">
                <Input
                  value={form.hero_image_url ?? ""}
                  onChange={(e) => set("hero_image_url", e.target.value)}
                  placeholder="https://…"
                />
              </FormField>
            </div>
            <FormField label="Bio">
              <Textarea
                rows={5}
                value={form.bio ?? ""}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Tell venues who you are in a few sentences."
              />
            </FormField>
          </Card>

          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email">
                <Input
                  type="email"
                  value={form.contact_email ?? ""}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="you@band.com"
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  value={form.contact_phone ?? ""}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </FormField>
            </div>
            <FormField label="Website">
              <Input
                value={form.website ?? ""}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://yourband.com"
              />
            </FormField>
          </Card>

          <Card title="Media">
            <p className="text-sm text-muted-foreground">
              Music links, photos, and live clips on your public page come from your{" "}
              <Link to="/assets" className="font-medium text-primary underline underline-offset-2">
                Asset library
              </Link>
              . Add them there and they'll show up automatically.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Sharing">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
              {form.is_public ? (
                <Globe className="mt-0.5 h-5 w-5 text-secondary" />
              ) : (
                <Lock className="mt-0.5 h-5 w-5 text-muted-foreground" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Public page</span>
                  <Switch
                    checked={form.is_public ?? false}
                    onCheckedChange={(v) => {
                      set("is_public", v);
                      togglePublic.mutate(v);
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.is_public
                    ? "Anyone with the link can view your EPK."
                    : "Turn on to get a shareable link."}
                </p>
              </div>
            </div>

            {form.is_public && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs">Shareable link</Label>
                <div className="flex gap-2">
                  <Input readOnly value={publicUrl} className="text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success("Link copied");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button asChild variant="secondary" className="w-full">
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-1 h-4 w-4" /> Preview page
                  </a>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-paper)]">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
