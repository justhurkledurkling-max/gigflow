import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Music2,
  Compass,
  KanbanSquare,
  MailCheck,
  BellRing,
  UserRound,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GigFlow — Book more gigs, lose fewer leads" },
      {
        name: "description",
        content:
          "GigFlow is a booking workspace for independent musicians: track who to pitch, when to follow up, and what to send — with a shareable EPK.",
      },
      { property: "og:title", content: "GigFlow — Book more gigs, lose fewer leads" },
      {
        property: "og:description",
        content:
          "Pipeline, outreach log, follow-up reminders, asset library, and a shareable EPK — built for independent musicians.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Compass,
    title: "Gig discovery",
    body: "Save venues and promoters with location, genre fit, contact info and notes.",
  },
  {
    icon: KanbanSquare,
    title: "Booking pipeline",
    body: "Move opportunities from saved to pitched to booked on a simple board.",
  },
  {
    icon: MailCheck,
    title: "Outreach logging",
    body: "Record every email, DM, form and text so nothing slips through.",
  },
  {
    icon: BellRing,
    title: "Follow-up reminders",
    body: "See what's due today, upcoming and overdue at a glance.",
  },
  {
    icon: UserRound,
    title: "Shareable EPK",
    body: "One clean profile page with bio, music, photos and live clips.",
  },
  {
    icon: FolderOpen,
    title: "Asset library",
    body: "Keep your bio, links and tech notes ready to copy and send.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Music2 className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">GigFlow</span>
        </div>
        <Button asChild variant="ghost">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center sm:pt-20">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          For independent musicians
        </span>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
          Book more gigs.
          <br />
          <span className="text-primary">Lose fewer leads.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          GigFlow keeps track of who to pitch, when to follow up, and what to send — so you can
          spend less time scrambling and more time playing.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Start your pipeline <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-paper)] transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} GigFlow</span>
          <Link to="/auth" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
