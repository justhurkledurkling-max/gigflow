# Gigflow: what we are building

## One-line pitch

Gigflow is a calm booking workspace for independent musicians: know who to pitch, when to follow up, and what to send.

## Who it is for

Independent artists and small acts who book their own shows and currently track venues, promoters, and follow-ups in spreadsheets, notes apps, and email threads.

## What exists today (from the Lovable build)

- **Gig discovery / opportunities:** save venues and promoters with location, genre fit, contact info, notes; CSV import.
- **Booking pipeline:** kanban-style stages from saved → pitched → booked.
- **Outreach logging:** record every email, DM, form, and text per opportunity.
- **Follow-up reminders:** due today / upcoming / overdue; calendar sync via a public `.ics` feed.
- **Pitch templates:** reusable outreach messages.
- **Asset library:** bio, links, tech notes ready to copy.
- **Public press kit (EPK):** `/epk/<slug>`, no login required.
- **Auth:** Supabase email/password. **Currently replaced by a usability-testing click-through** that creates a throwaway account on every sign-in click and has confirmation emails switched off. Must be reverted before real users (see issue).

## v1 scope decisions still open

| Question | Owner | Decided? |
| -------- | ----- | -------- |
| Keep using Alicia's Lovable Cloud Supabase project, or create a Supabase project we own and recreate the schema? | | |
| Restore real sign-in now, or keep the click-through prototype for a usability round first? | | |
| Hosting at gigflow.phoenixtbird.com (recommended) vs phoenixtbird.com/gigflow? | Phoenix | |
| Which of the Lovable sample content (Juno Halloway press kit, 12 gigs) do we want as seed data? | | |

## Decisions log

| Date | Decision | Where it was made |
| ---- | -------- | ----------------- |
| 2026-10-21 | Repo created; two-person PR workflow; Claude conventions in CLAUDE.md | Repo setup |
| 2026-10-21 | Imported the Lovable "Merge Magic (No Auth)" export as the codebase; Lovable sync not kept | Repo setup |
| 2026-10-21 | GitHub Pages dropped (app needs a server); Cloudflare Workers is the deploy target | docs/HOSTING.md |
