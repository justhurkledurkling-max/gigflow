import { createFileRoute, Link } from "@tanstack/react-router";
import { Music2, MapPin, Mail, Phone, Globe, ArrowUpRight, Play } from "lucide-react";
import { getPublicEpk } from "@/lib/epk.functions";

type EpkAsset = { type: string; label: string; value: string };

export const Route = createFileRoute("/epk/$slug")({
  loader: ({ params }) => getPublicEpk({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const p = loaderData?.profile;
    const title = p ? `${p.artist_name || "Artist"} — EPK` : "EPK — GigFlow";
    const desc = p
      ? `${p.genre ? p.genre + " · " : ""}${p.location || ""} — ${(p.bio || "Press kit").slice(0, 140)}`
      : "Artist press kit on GigFlow.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(p?.hero_image_url
          ? [
              { property: "og:image", content: p.hero_image_url },
              { name: "twitter:image", content: p.hero_image_url },
            ]
          : []),
      ],
    };
  },
  component: PublicEpk,
  errorComponent: () => (
    <Centered title="Couldn't load this page" body="Please try again in a moment." />
  ),
  notFoundComponent: () => (
    <Centered title="EPK not found" body="This press kit doesn't exist or isn't public." />
  ),
});

function Centered({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 text-center text-bone">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-bone/60">{body}</p>
        <Link
          to="/"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-[0.2em] text-ember hover:text-ember-glow"
        >
          GigFlow →
        </Link>
      </div>
    </div>
  );
}

function PublicEpk() {
  const { profile, assets } = Route.useLoaderData();

  if (!profile) {
    return <Centered title="EPK not found" body="This press kit doesn't exist or isn't public." />;
  }

  const get = (type: string): EpkAsset[] => (assets as EpkAsset[]).filter((a) => a.type === type);
  const bios = get("bio");
  const photos = get("photo");
  const music = get("music_link");
  const videos = get("video_link");
  const socials = get("social_link");
  const quotes = get("press_quote");
  const tech = get("tech_note");

  const marqueeItems = [
    ...music.map((m) => m.label || m.value),
    ...socials.map((s) => s.label || s.value),
    ...(profile.genre ? [profile.genre] : []),
  ];

  return (
    <div className="grain min-h-screen bg-ink text-bone">
      <div className="grain-overlay" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone/50">
          Electronic press kit
        </span>
        <Link
          to="/"
          className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone/50 transition-colors hover:text-ember"
        >
          GigFlow
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pb-10 sm:px-10">
        <div className="mx-auto max-w-5xl">
          {profile.hero_image_url && (
            <div className="relative mb-8 overflow-hidden">
              <img
                src={profile.hero_image_url}
                alt={profile.artist_name}
                className="h-[46vh] w-full object-cover sm:h-[58vh]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            </div>
          )}
          <h1 className="font-display text-5xl leading-[0.95] font-semibold sm:text-7xl md:text-8xl">
            {profile.artist_name || "Untitled artist"}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/60">
            {profile.genre && <span className="text-ember">{profile.genre}</span>}
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-ember"
              >
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}
          </div>
        </div>
      </section>

      {marqueeItems.length > 0 && (
        <div className="relative z-10 overflow-hidden border-y border-bone/10 py-3">
          <div className="marquee flex w-max gap-10 whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/45"
              >
                {item} <span className="text-ember">◆</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-14 sm:px-10">
        {quotes.length > 0 && (
          <section>
            <Rule label="Praise" />
            <div className="grid gap-8 sm:grid-cols-2">
              {quotes.map((q, i) => (
                <blockquote key={i} className="border-l border-ember/60 pl-5">
                  <p className="font-display text-xl leading-snug italic sm:text-2xl">{q.value}</p>
                  {q.label && (
                    <cite className="mt-3 block font-mono text-[11px] uppercase not-italic tracking-[0.2em] text-bone/50">
                      — {q.label}
                    </cite>
                  )}
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {(profile.bio || bios.length > 0) && (
          <section>
            <Rule label="About" />
            {profile.bio && (
              <p className="max-w-2xl text-lg leading-relaxed whitespace-pre-wrap text-bone/85">
                {profile.bio}
              </p>
            )}
            {bios.map((b, i) => (
              <p
                key={i}
                className="mt-4 max-w-2xl leading-relaxed whitespace-pre-wrap text-bone/60"
              >
                {b.value}
              </p>
            ))}
          </section>
        )}

        {music.length > 0 && (
          <section>
            <Rule label="Listen" />
            <div className="divide-y divide-bone/10 border-y border-bone/10">
              {music.map((m, i) => (
                <LinkRow
                  key={i}
                  index={i}
                  icon={Music2}
                  label={m.label || m.value}
                  href={m.value}
                />
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section>
            <Rule label="Live" />
            <div className="divide-y divide-bone/10 border-y border-bone/10">
              {videos.map((v, i) => (
                <LinkRow key={i} index={i} icon={Play} label={v.label || v.value} href={v.value} />
              ))}
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section>
            <Rule label="Photos" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={p.value}
                  alt={p.label || `Photo ${i + 1}`}
                  loading="lazy"
                  className="aspect-4/5 w-full object-cover grayscale transition-all duration-500 hover:grayscale-0"
                />
              ))}
            </div>
          </section>
        )}

        {tech.length > 0 && (
          <section>
            <Rule label="Tech & setup" />
            <div className="grid gap-6 sm:grid-cols-2">
              {tech.map((t, i) => (
                <div key={i} className="border border-bone/10 p-4">
                  {t.label && (
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">
                      {t.label}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-bone/70">
                    {t.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <Rule label="Booking & contact" />
          <div className="flex flex-wrap gap-3">
            {profile.contact_email && (
              <a
                href={`mailto:${profile.contact_email}`}
                className="inline-flex items-center gap-2 bg-ember px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ember-glow"
              >
                <Mail className="h-4 w-4" /> {profile.contact_email}
              </a>
            )}
            {profile.contact_phone && (
              <a
                href={`tel:${profile.contact_phone}`}
                className="inline-flex items-center gap-2 border border-bone/20 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80 transition-colors hover:border-ember hover:text-ember"
              >
                <Phone className="h-4 w-4" /> {profile.contact_phone}
              </a>
            )}
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-bone/20 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/80 transition-colors hover:border-ember hover:text-ember"
              >
                {s.label || "More"} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
            {!profile.contact_email && !profile.contact_phone && socials.length === 0 && (
              <p className="text-sm text-bone/50">No contact details provided.</p>
            )}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-bone/10 px-6 py-8 text-center sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone/40">
          {profile.artist_name || "Artist"} · built with{" "}
          <Link to="/" className="text-ember hover:text-ember-glow">
            GigFlow
          </Link>
        </p>
      </footer>
    </div>
  );
}

function Rule({ label }: { label: string }) {
  return (
    <div className="mt-14 mb-6 flex items-center gap-4 first:mt-0">
      <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-ember">{label}</span>
      <span className="h-px flex-1 bg-bone/15" />
    </div>
  );
}

function LinkRow({
  index,
  icon: Icon,
  label,
  href,
}: {
  index: number;
  icon: typeof Music2;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 py-4 transition-colors hover:bg-bone/[0.04]"
    >
      <span className="font-mono text-[11px] text-bone/35">
        {String(index + 1).padStart(2, "0")}
      </span>
      <Icon className="h-4 w-4 shrink-0 text-ember" />
      <span className="truncate font-medium group-hover:text-ember">{label}</span>
      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-bone/30 transition-colors group-hover:text-ember" />
    </a>
  );
}
