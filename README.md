# Gigflow

A web app co-built by two people, each working with Claude Code.

- **Live:** https://phoenixtbird.com/gigflow/ (also at https://justhurkledurkling-max.github.io/gigflow/)
- **Repo:** https://github.com/justhurkledurkling-max/gigflow
- **Stack:** Vite + React 19 + TypeScript. Static site, deployed by GitHub Actions to GitHub Pages on every push to `main`.

New here? Read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [docs/COLLABORATOR-SETUP.md](docs/COLLABORATOR-SETUP.md) for first-time setup. What the app is meant to do lives in [docs/PRODUCT.md](docs/PRODUCT.md).

## Run it locally

Requires Node 22 (see `.nvmrc`).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (it includes the `/gigflow/` base path).

## Scripts

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                     |
| `npm run lint`    | Lint with oxlint                               |
| `npm run build`   | Type-check and build to `dist/`                |
| `npm run preview` | Serve the production build locally             |

## How deploys work

1. A pull request is merged into `main`.
2. `.github/workflows/deploy.yml` builds the site and publishes `dist/` to GitHub Pages.
3. GitHub Pages serves it at `/gigflow/` under the account's user site domain (phoenixtbird.com).

Nobody deploys by hand. If the live site is wrong, fix it with another PR.

## Project layout

```
src/            React app (entry: main.tsx, root component: App.tsx)
public/         Static files copied as-is into the build
docs/           Product notes and contributor docs
.github/        CI, deploy workflow, PR template
CLAUDE.md       Conventions both collaborators' Claude sessions follow
```
