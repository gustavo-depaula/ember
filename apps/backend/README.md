# Ember backend — Mass times

Hono app on Cloudflare Workers (D1 + R2), live at `https://ember-mass-times.dpgu.workers.dev`. The shared request/response contract lives in `packages/api`; all backend logic is here.

## Deploy (needs the Cloudflare account)

Run from `apps/backend/`:

1. `pnpm exec wrangler login`
2. First time only: `pnpm exec wrangler d1 create ember-mass-times` and paste the printed `database_id` into `wrangler.jsonc`; `pnpm exec wrangler r2 bucket create ember-correction-attachments`. The rate-limit binding is inline in `wrangler.jsonc` and needs no provisioning.
3. `pnpm db:migrate:remote`
4. Bulk load: `tsx scripts/import.ts dump.jsonl dump.sql`, then `pnpm exec wrangler d1 execute ember-mass-times --remote --file=dump.sql` (wrangler 4 has no `d1 import`)
5. `pnpm deploy`
6. `pnpm types` and commit the regenerated `worker-configuration.d.ts`

## Smoke test

`GET /health`, `GET /churches/near?lat=&lng=&radiusKm=`, then one `POST /churches/:id/verify` — 200 first, 429 on rapid repeats confirms the rate-limit binding fires remotely. `pnpm exec wrangler tail` should show no errors.
