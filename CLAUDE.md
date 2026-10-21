# Gigflow: working agreement for Claude Code sessions

Two people build this app, each with their own Claude Code. Both sessions read this file, so it is the single source of truth for how work happens here. Keep it short and keep it current.

## Project facts

- Vite + React 19 + TypeScript, static build, no backend yet.
- Deployed to GitHub Pages at `https://phoenixtbird.com/gigflow/`. The Vite `base` is `/gigflow/`; do not change it.
- Node 22 (`.nvmrc`). Package manager is npm; commit `package-lock.json`.
- `npm run lint` and `npm run build` must pass before a PR is opened.

## Workflow (non-negotiable)

1. **Never commit directly to `main`.** It is protected. All work goes through a pull request.
2. **One issue, one branch, one PR.** Branch names: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`. Reference the issue in the PR body (`Closes #12`).
3. **Claim before you build.** Assign yourself to the GitHub issue (or comment "taking this") so two people do not build the same thing.
4. **Small PRs.** Prefer several focused PRs over one large one. A PR should be reviewable in under ten minutes.
5. **Pull `main` before branching** and rebase or merge `main` into your branch before asking for review.
6. **Merging:** the author merges after CI is green and the other collaborator has had a look (or has said "go ahead" on the PR). Use "Squash and merge".

## Code conventions

- Function components with hooks. No class components.
- TypeScript strict mode stays on. No `any` without a comment explaining why.
- Plain CSS in `src/` for now (one file per component when a component needs its own styles). Decide together before adding a CSS framework.
- Keep components small; put shared logic in `src/lib/`.
- Add a dependency only when it earns its place, and say why in the PR.
- No secrets in the repo. Anything sensitive goes in `.env` (gitignored) with a documented `.env.example`.

## Commit messages

Conventional-style, imperative, short subject line:

```
feat: add gig list view
fix: prevent duplicate gigs on refresh
chore: bump vite to 8.3
docs: describe deploy flow
```

## Where things live

- Product scope and decisions: `docs/PRODUCT.md`. When a decision is made in an issue or PR, record it there.
- Contributor onboarding: `docs/COLLABORATOR-SETUP.md`.
- Architecture notes (once there is architecture): `docs/ARCHITECTURE.md`.

## For Claude specifically

- Before starting a task, run `git fetch && git status` and make sure you are on a fresh branch off `origin/main`.
- Before opening a PR, run `npm run lint && npm run build` and include the result in the PR body.
- Do not edit `.github/workflows/*` or `vite.config.ts` without flagging it in the PR title.
- If you are unsure whether something is in scope, open an issue and ask instead of building it.
