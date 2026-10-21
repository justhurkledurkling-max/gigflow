# Hosting and deploy

## Why not GitHub Pages

The app has a server side (TanStack Start server functions, the `/api/public/calendar/*.ics` route, SSR). GitHub Pages serves static files only, so the Pages setup from the first scaffold was removed.

## Target: Cloudflare Workers

`npm run build` already produces a Worker bundle in `.output/` (Nitro `cloudflare-module` preset, chosen by the Lovable Vite config). phoenixtbird.com's DNS is on Cloudflare, so a Worker with a custom domain is the shortest path.

Recommended address: **https://gigflow.phoenixtbird.com** (a subdomain). Serving at `phoenixtbird.com/gigflow/` is possible but needs a router basepath and asset-base change throughout the app; a subdomain needs no code change.

## One-time setup (Phoenix, Cloudflare dashboard)

1. Create an API token: My Profile → API Tokens → "Edit Cloudflare Workers" template. Note the Account ID from the Workers overview page.
2. In the GitHub repo: Settings → Secrets and variables → Actions.
   - Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
   - Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (same values as `.env`; they are publishable).
3. Merge anything to `main` (or run the "Deploy to Cloudflare Workers" workflow by hand). The first deploy creates a Worker named `gigflow`.
4. Worker runtime variables (Workers → gigflow → Settings → Variables): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. Server functions read these at request time.
5. Custom domain: Workers → gigflow → Settings → Domains & Routes → Add → `gigflow.phoenixtbird.com`. Cloudflare creates the DNS record and certificate.

## Local check of the production build

```bash
npm run build
npx wrangler@4 dev --config .output/server/wrangler.json
```
