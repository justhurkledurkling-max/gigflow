# Contributing to Gigflow

This is a two-person project where each person works with Claude Code. The process below keeps us from stepping on each other.

## The loop

```
pick an issue → claim it → branch from main → build → open PR → CI green → review → squash-merge → auto-deploy
```

### 1. Pick and claim an issue

All work starts as a GitHub issue. Assign yourself before you start. If there is no issue for what you want to do, open one first, even if it is one line. The issue is where scope gets agreed.

### 2. Branch from an up-to-date `main`

```bash
git checkout main
git pull
git checkout -b feat/short-name
```

### 3. Build it

Work with Claude as you normally would. `CLAUDE.md` tells Claude the conventions, so you do not need to repeat them. Commit as you go.

### 4. Open a pull request

```bash
npm run lint && npx tsc --noEmit -p tsconfig.json && npm run build
git push -u origin feat/short-name
gh pr create --fill
```

Fill in the PR template: what changed, how to check it, and `Closes #NN`.

### 5. Review

CI runs lint and build on every PR. The other collaborator reviews (their Claude can review too: `/code-review` in Claude Code). Address comments with new commits; do not force-push over a branch someone else has reviewed.

### 6. Merge

Author merges with **Squash and merge** once CI is green and the reviewer has approved or said go ahead. Delete the branch after merge. The deploy workflow publishes `main` to Cloudflare Workers once the secrets in docs/HOSTING.md are set.

## Avoiding conflicts

- Keep PRs small and merge them quickly. Long-lived branches are where conflicts come from.
- If two issues touch the same file, say so in the issues and sequence them.
- Shared files most likely to conflict: `src/routes/__root.tsx`, `src/styles.css`, `src/components/app-shell.tsx`, `package.json`. Split components out early so the root files stay thin.

## Communication

- Decisions go in the issue or PR, then get summarized in `docs/PRODUCT.md`. Chat is fine for discussion but the repo is the record.
- Blocked? Comment on the issue and tag the other person.
