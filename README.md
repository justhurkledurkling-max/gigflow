# Gigflow

A calm booking workspace for independent musicians: save venues and promoters, move opportunities through a pipeline, log every outreach, get follow-up reminders, keep an asset library, and publish a shareable press kit (EPK).

Co-built by two people, each working with Claude Code. The code started life as a Lovable project ("Merge Magic") exported on 2026-10-21; it is no longer synced with Lovable, so this repo is the source of truth.

- **Repo:** https://github.com/justhurkledurkling-max/gigflow
- **Stack:** TanStack Start (React 19, file-based routes, server functions) + TypeScript, Tailwind 4, shadcn/ui, TanStack Query, Supabase (auth + Postgres). Built by Vite + Nitro into a Cloudflare Worker.
- **Hosting:** Cloudflare Workers (not yet connected). See [docs/HOSTING.md](docs/HOSTING.md).

New here? Read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [docs/COLLABORATOR-SETUP.md](docs/COLLABORATOR-SETUP.md) for first-time setup. Product scope and decisions live in [docs/PRODUCT.md](docs/PRODUCT.md).

## Run it locally

Requires Node 22 (see `.nvmrc`) and a `.env` file.

```bash
npm install
cp .env.example .env   # then fill in the Supabase values (see docs/COLLABORATOR-SETUP.md)
npm run dev
```

## Scripts

| Command            | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Dev server with hot reload                                |
| `npm run lint`     | ESLint (includes Prettier formatting as errors)           |
| `npm run format`   | Prettier, writes in place                                 |
| `npm run build`    | Production build to `.output/` (Cloudflare Worker + assets)|
| `npm run preview`  | Serve the production build locally                        |

CI runs lint, `tsc --noEmit`, and build on every PR.

## Project layout

```
src/routes/               File-based routes (TanStack Router). _authenticated/ needs a session.
src/routes/api/           Server-only routes (e.g. public calendar .ics feed)
src/components/           App components; src/components/ui/ is shadcn/ui
src/lib/                  Data access (gigflow.ts, data.ts), server functions (*.functions.ts)
src/integrations/supabase Supabase clients, auth middleware, generated DB types
src/server.ts, start.ts   Server entry and TanStack Start middleware
drizzle/                  Drizzle schema + migrations (currently empty; schema lives in Supabase)
public/                   Static assets (demo photos, favicon)
docs/                     Product notes, hosting, contributor docs
.github/                  CI, deploy workflow, PR template
CLAUDE.md                 Conventions both collaborators' Claude sessions follow
```

## Backend

The app talks to a Supabase project that currently lives in Alicia's Lovable Cloud workspace (tables: `profiles`, `opportunities`, `outreach_logs`, `pitch_templates`, `assets`). The publishable URL and key go in `.env`. Moving to a Supabase project we own is an open decision in `docs/PRODUCT.md`.
