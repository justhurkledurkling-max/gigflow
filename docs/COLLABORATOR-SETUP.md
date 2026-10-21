# Collaborator setup

Send this file to the second collaborator. It gets them from zero to their first pull request.

## 0. What you need

- A GitHub account (send your username to Phoenix so you can be added as a collaborator).
- Git, Node 22, and the GitHub CLI (`gh`). On a Mac: `brew install git node@22 gh`.
- Claude Code (desktop app or CLI).

## 1. Accept the invite and clone

Once you have accepted the collaborator invite on GitHub:

```bash
gh auth login
gh repo clone justhurkledurkling-max/gigflow
cd gigflow
npm install
npm run dev
```

Open the URL Vite prints. You should see the Gigflow placeholder page.

## 2. Open the project in Claude Code

Open the `gigflow` folder as a project in Claude Code. The repo's `CLAUDE.md` is loaded automatically, so your Claude already knows the branch, PR, and code conventions. You do not need to explain the project to it; you can point it at the issue you are working on.

A good first prompt:

> Read CLAUDE.md and CONTRIBUTING.md. Then look at issue #NN and propose a plan before writing code.

## 3. Your first PR

1. Pick an unassigned issue in the repo and assign yourself.
2. `git checkout main && git pull && git checkout -b feat/your-thing`
3. Build it with Claude.
4. `npm run lint && npm run build`
5. `git push -u origin feat/your-thing && gh pr create --fill`
6. Ask Phoenix for a review. Merge with Squash and merge when CI is green and you have a go-ahead.

Your change is live at https://phoenixtbird.com/gigflow/ a couple of minutes after merge.

## Rules of the road (short version)

- Never push to `main` directly. It is protected and will reject you anyway.
- One issue per branch per PR. Keep them small.
- Claim an issue before you start so you two do not build the same thing.
- Decisions get written into `docs/PRODUCT.md`.
