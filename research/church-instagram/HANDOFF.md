# Church Instagram sourcing — handoff

Written 2026-10-12. Goal: find the Instagram account of each church in the Mass Times database, city by city, as a compiled list. **Nothing goes into the database yet** — Gustavo asked for the list only. He has approved doing more cities ("we will do it"); which ones, and in what order, is not decided.

## State

- **São Paulo city: done.** `sp-city-instagram.csv`, 889 churches, 461 with a handle.

  | Status | Parishes | Chapels / comunidades / other | Total |
  |---|---|---|---|
  | confirmed | 217 | 70 | 287 |
  | probable | 79 | 95 | 174 |
  | not found | 189 | 237 | 426 |
  | not searched | 1 | 1 | 2 |

- Columns: `id, name, type, address, phone, email, instagram, status, account_of, source, evidence, other_candidates, flags`.
- Committed on branch `worktree-bridge-cse_014i171JzQwmWjHkZXd9UW69` (pushed). Not merged, no PR.
- No handle was verified by opening the account (Instagram is login-walled). Known error type: a comunidade given its parent parish's account but labelled `own`.
- `probable` rows are not publishable as they are: 69 are flagged "same handle given to N churches".

## Files here

- `sp-city-instagram.csv` — the list.
- `search-workflow.js` — the Workflow script for the agent search round (prompt, schema, 15-search budget per agent). Reads batches from `/tmp/igrun3/batch_<n>.txt`; takes `args: {start, end}`.
- `arquisp-directory.json` — crawl of the 311 parish pages of arquisp.org.br (title, address, phones, Instagram on the page or on the parish's linked site).

Everything else (batch files, merge scripts, per-run results) lived in `/tmp/igrun*` and `/tmp/sp_*.json` and was written as throwaway inline Python. It needs to be rewritten as a rerunnable script for the next city; the method below is the spec.

## Data source

Production API `https://ember-mass-times.dpgu.workers.dev` (no auth):
- `GET /churches/index?limit=1000&after=<id>` — paged catalogue (id, name, longName, city, region, countryCode). 142,417 churches; 15,650 in Brazil.
- `GET /churches/<id>` — detail with address, phoneE164, email, `links`, `texts`.

Region and city are dirty: region is "SP", "São Paulo", "Sp", "SP, 02306-004" or null (3,662 Brazilian churches have none); city can be "Guarulhos SP" or "Caxias do Sul | Rio Grande do Sul". São Paulo state ≈ 3,111 churches by regex on region plus city match; selecting any other city needs a normalisation pass first.

## Method that worked, in order

1. **Scrape the church's own website (free).** For every `website` link not on facebook/instagram, fetch the page and extract `instagram.com/<handle>`. Drop handles that appear on ≥3 pages of one host (diocese template accounts), pages shared by >2 churches, and a manual blocklist of order/hospital/school/priest accounts. 327 handles statewide, 96 kept for the city.
2. **Diocesan directory (free).** arquisp.org.br's sitemap lists parish pages at `/regiao-<x>/<slug>/`; take Instagram from the page, else from the parish site it links to. Match to the database by the last 8 digits of the phone plus a name check. 22 more for the city. Other dioceses have their own sites and need their own crawl (Santo Amaro, Campo Limpo, São Miguel Paulista, Santos, Campinas…).
3. **Agent web search for the rest.** Haiku agents, 10 churches each, via the Workflow tool with `search-workflow.js`. The recipe that matters:
   - `WebSearch` with `allowed_domains: ["instagram.com"]`, query = name + neighbourhood or street + city, no quotes, no the word "instagram". General web search almost never surfaces profiles.
   - "confirmed" only with a specific tie: neighbourhood/street in handle, title or quoted bio; phone; handle equal to the email's local part; website domain; diocese plus an unusual name. Name alone = "probable".
   - Chapels and comunidades: only a parent **parish** account, never a hospital, school or order.
   - Agents return the row number `n`, not the id (an earlier agent mangled ids).
   - An agent that is refused a search must report `not_searched`, never `none`.
4. **Merge** with precedence own-site > directory > agent; validate handle format; flag duplicate handles and downgrade agent "confirmed" duplicates to "probable"; reject institution accounts.

## Limits and traps

- **Web search cap: 200 calls shared by every workflow launched in the same round.** It refills between rounds. Five parallel runs just starved each other. Run **one round of 13 agents (130 churches) at a time**; each takes about 3 minutes.
- A first run without the `not_searched` rule reported 624 unsearched churches as "none". Always check `searches > 0` before trusting a "none".
- Direct scraping of a search engine (DuckDuckGo HTML) returned better evidence — the bio snippet with street and diocese — but it served a bot challenge after one query. Not pursued.
- Instagram profile pages and its profile API require login; do not try to fetch them.
- `SendUserFile` does not work in this session; deliver by committing to the branch.
- Parish "not found" (39% in the city) is mostly unresolved namesakes; candidates are in `other_candidates`.

## Measured cost (clean rounds: 425 churches)

- About 4,450 Haiku tokens and 1.5 searches per church; roughly $0.02 per church at list API prices as recalled (unverified), about three quarters of it search fees.
- Yield: 52% get a handle, 32% confirmed.
- Projections: rest of São Paulo state ≈ 2,000 churches, 9M tokens, 2,900 searches, 16 rounds, about an hour, about $40. All Brazil ≈ 13,300 churches, 60M tokens, 100 rounds, 5–6 hours, $250–300. Parishes only is about half.

## Database fit (for later, not now)

- `church.links` is a JSON list of `{kind, url}`; `instagram` is an allowed kind (`packages/api/src/schema.ts`). No schema change needed.
- A re-import replaces `links` wholesale (`apps/backend/src/lib/import.ts`), so handles must go into the source dump or the importer must merge.
- No field for confidence, own/parent or evidence; the correction form cannot edit links; `ChurchDetail.tsx` only shows the `website` link, so a UI button is needed (ask Gustavo about the interaction before building it).
- 123 city churches have the archdiocese home page filed as their website.

## Next steps

1. Ask which cities come next (rest of São Paulo state is the natural one) and whether to cover all churches or parishes only.
2. Turn the pipeline into one script in this folder: select churches by city → scrape own sites → write batch files → merge agent results → CSV.
3. Run rounds of 13 agents, one at a time, merging after each.
4. Optional review pass over "probable" and parish "not found" rows (untested; estimated +30–50% cost).
