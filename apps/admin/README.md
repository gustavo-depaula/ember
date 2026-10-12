# Ember admin

The admin panel, a Cloudflare Worker (`ember-admin`) that serves the page in `src/` and the routes under `/api`. Its first desk is Mass-times moderation: suggestions from the app wait in D1, Claude drafts what should change, and nothing is written until you approve.

- `worker/` — the Worker. It binds the same D1 as the public API (apps/backend), whose migrations hold the desk's `moderation_*` tables.
- `reviewer/` — a container image: the Claude Code CLI behind a small queue. A Worker cannot run a command-line program, so reviews run here. It has no database and no credential; see `worker/reviewer.ts`.
- `src/` — the page.

## Run it locally

`pnpm admin` builds the page and starts `wrangler dev` on :4210, against the local D1 that apps/backend's `wrangler dev` uses. It needs Docker (with buildx) to build and run the reviewer.

Reviews need a Claude token: run `claude setup-token` and put it in `apps/admin/.dev.vars` as `CLAUDE_CODE_OAUTH_TOKEN=…`.

## Deploy

1. `pnpm --filter @ember/backend db:migrate:remote`
2. `pnpm --filter @ember/admin exec wrangler secret put CLAUDE_CODE_OAUTH_TOKEN`
3. Create a Cloudflare Access application for the Worker's address, and set `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `wrangler.jsonc`. Until both are set the deployed Worker refuses every request.
4. `pnpm --filter @ember/admin run deploy`

After that, pushes to `main` deploy it (`.github/workflows/deploy-admin.yml`).
