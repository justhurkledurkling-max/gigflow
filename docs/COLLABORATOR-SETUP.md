# Collaborator setup

Send this file to the second collaborator. It gets them from zero to their first pull request.

## 0. What you need

- A GitHub account with a pending invite to the repo (accept it at https://github.com/justhurkledurkling-max/gigflow/invitations).
- Git, Node 22, and the GitHub CLI (`gh`). On a Mac: `brew install git node@22 gh`.
- Claude Code (desktop app or CLI).
- The Supabase values for `.env` (see step 2).

## 1. Clone and install

```bash
gh auth login
gh repo clone justhurkledurkling-max/gigflow
cd gigflow
npm install
```

## 2. Create your .env

```bash
cp .env.example .env
```

Fill in the six values. They are the same ones in the Lovable project's `.env` (Lovable editor → Code tab → `.env`), or ask Phoenix. They are publishable keys, not secrets, but we keep them out of git so the backend can be swapped later.

Then:

```bash
npm run dev
```

Open the URL Vite prints. You should see the Gigflow landing page; `/auth` opens the (prototype) sign-in.

## 3. Open the project in Claude Code

Open the `gigflow` folder as a project in Claude Code. The repo's `CLAUDE.md` is loaded automatically, so your Claude already knows the stack, the branch and PR rules, and the code conventions.

A good first prompt:

> Read CLAUDE.md, CONTRIBUTING.md and docs/PRODUCT.md. Then look at the open issues and tell me which one you'd take first and how.

## 4. Your first PR

1. Pick an unassigned issue and assign yourself.
2. `git checkout main && git pull && git checkout -b feat/your-thing`
3. Build it with Claude.
4. `npm run lint && npx tsc --noEmit -p tsconfig.json && npm run build`
5. `git push -u origin feat/your-thing && gh pr create --fill`
6. Ask Phoenix for a review. Merge with Squash and merge when CI is green and you have a go-ahead.

## Rules of the road (short version)

- Never push to `main` directly. It is protected and will reject you anyway.
- One issue per branch per PR. Keep them small.
- Claim an issue before you start so you two do not build the same thing.
- Decisions get written into `docs/PRODUCT.md`.
