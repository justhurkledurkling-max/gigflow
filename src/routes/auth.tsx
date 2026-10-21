import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Music2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — GigFlow" },
      { name: "description", content: "Sign in to your GigFlow booking workspace." },
    ],
  }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  // Usability-test prototype: any click creates a fresh throwaway account,
  // ignoring whatever was typed, so testers land in a brand-new workspace.
  async function enterPrototype(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const id = crypto.randomUUID().slice(0, 12);
    const { data, error } = await supabase.auth.signUp({
      email: `tester-${id}@gigflow-prototype.app`,
      password: `proto-${crypto.randomUUID()}`,
    });
    setBusy(false);
    if (error || !data.session) {
      toast.error(error?.message ?? "Couldn't open the prototype. Try again.");
      return;
    }
    toast.success("Account created — you're in!");
    navigate({ to: "/dashboard", replace: true });
  }
  const handleSignIn = enterPrototype;
  const handleSignUp = enterPrototype;
  void credSchema;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Music2 className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">GigFlow</span>
        </Link>
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Know who to pitch, when to follow up, and what to send.
          </h2>
          <p className="mt-4 text-sidebar-foreground/70">
            A calm booking workspace for independent musicians. Build a pipeline of venues and
            promoters, log every outreach, and never lose a gig to a missed follow-up again.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/50">
          Your data is private and synced across devices.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Music2 className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">GigFlow</span>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                <Field
                  id="si-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@band.com"
                />
                <Field
                  id="si-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                />
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                <Field
                  id="su-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@band.com"
                />
                <Field
                  id="su-password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                />
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline underline-offset-4 hover:text-foreground">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === "password" ? "current-password" : "email"}
      />
    </div>
  );
}
