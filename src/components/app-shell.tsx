import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Compass,
  KanbanSquare,
  UserRound,
  FolderOpen,
  MessageSquareText,
  Menu,
  LogOut,
  Music2,
  BellRing,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/opportunities", label: "Discovery", icon: Compass },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/reminders", label: "Follow-ups", icon: BellRing },
  { to: "/profile", label: "EPK", icon: UserRound },
  { to: "/assets", label: "Assets", icon: FolderOpen },
  { to: "/templates", label: "Templates", icon: MessageSquareText },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Music2 className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-semibold text-sidebar-foreground">GigFlow</span>
    </Link>
  );
}

function SignOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <LogOut className="h-5 w-5" />
      Sign out
    </button>
  );
}

export function AppShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar p-4 lg:flex">
        <div className="py-2">
          <Brand />
        </div>
        <div className="mt-6 flex-1">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border pt-3">
          <SignOutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="py-2">
                <Brand />
              </div>
              <div className="mt-6 flex-1">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-6 border-t border-sidebar-border pt-3">
                <SignOutButton />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-semibold leading-tight sm:text-2xl">
              {title}
            </h1>
            {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
