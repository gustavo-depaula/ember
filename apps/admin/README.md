# Ember admin

The admin panel, a Cloudflare Worker (`ember-admin`) that serves the page in `src/` and the routes under `/api`. Its first desk is Mass-times moderation: suggestions from the app wait in D1, Claude drafts what should change, and nothing is written until you approve.

- `worker/` — the Worker. It binds the same D1 as the public API (apps/backend), whose migrations hold the desk's `moderation_*` tables.
- `reviewer/` — a container image: the Claude Code CLI behind a small queue. A Worker cannot run a command-line program, so reviews run here. It has no database and no credential; see `worker/reviewer.ts`.
- `src/` — the page.

Its second desk is usage: what the app counts (`apps/app/src/lib/usage.ts`), read from the relay's database a tab at a time (`worker/usage.ts`), and a digest of the week by email every Monday.

## Run it locally

`pnpm admin` builds the page and starts `wrangler dev` on :4210, against the local D1 that apps/backend's `wrangler dev` uses. It needs Docker (with buildx) to build and run the reviewer.

`pnpm --filter @ember/admin seed:usage` fills the local relay database with made-up installs, using the churches of the local Mass-times database, so every usage tab has something to show.

Reviews need a Claude token: run `claude setup-token` and put it in `apps/admin/.dev.vars` as `CLAUDE_CODE_OAUTH_TOKEN=…`.

## Deploy

1. `pnpm --filter @ember/backend db:migrate:remote`
2. `pnpm --filter @ember/admin exec wrangler secret put CLAUDE_CODE_OAUTH_TOKEN`
3. Create a Cloudflare Access application for the Worker's address, and set `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `wrangler.jsonc`. Until both are set the deployed Worker refuses every request.
4. `pnpm --filter @ember/admin run deploy`

The weekly usage digest (`worker/digest.ts`) also needs the sending domain of `DIGEST_FROM` (in `wrangler.jsonc`) onboarded to Cloudflare Email Sending, and the address it goes to as a secret: `pnpm --filter @ember/admin exec wrangler secret put DIGEST_TO`. Until both are in place the Monday run sends nothing. `GET /api/usage/digest` shows this week's; `POST` sends it now.

After that, pushes to `main` deploy it (`.github/workflows/deploy-admin.yml`).
