# Lírio Católico's Mass times

Lírio Católico (liriocatolico.com.br) publishes a Brazilian Mass-times directory seeded, like ours,
from the Catholic Mass Times scrape (`~/Documents/mass-times`). This folder follows his hand edits so
they can reach our directory through the moderation desk. His data stays out of the repo; it lives
in `~/Documents/mass-times/lirio/`.

His download (`app_dados/horario_missa.zip`) is `uf/<UF>.json`, one record per church: integer `id`,
`nome`, `endereco`, `telefones`, `site`, `instagram`, `paroco`, `observacoes`, `eventos`, `atualizado`,
`lat`/`lng`, and three grids of weekday → times: `missas`, `confissoes`, `adoracao`. A grid can't say
"first Friday of the month" or "only in Lent".

## What we know about his data (2026-10-29 download)

- He re-keyed every church, but kept the source's coordinates: 14,872 of his 14,958 join the source
  on coordinates at 4 dp (`extract.py` → `lirio-map.jsonl`, his id → source id → our id).
- He copied the source between our 2026-06-17 and 2026-09-29 scrapes. Most schedule differences
  outside his edits match our older scrape, so on those churches our data is the newer one.
- `atualizado` is a bare date (`2026-09-02`) on his bulk import and a full timestamp on a record he
  edited by hand. That marks his work: about 130 records, half of them churches he added.
- Where the source had only free text, his grid sometimes turns "1ª sexta do mês" into every Friday,
  or a December–February season into the whole year. So his grid is never imported whole; only his
  changes are.

## Each week

The admin panel's Lírio desk (`/lirio`) does the weekly work: download his zip in a browser (his
site sits behind a Cloudflare bot check) and upload it there. Every church whose `atualizado` moved
since the previous upload waits with his changes ticked against our church; the page and its
reasoning live in `apps/admin/src/lirio/` and `apps/backend/src/lib/lirio.ts`.

`seed.py` wrote the desk's starting state from this folder's first extraction: his 2026-10-29
download as the copy the first upload is compared with, and his hand edits since his bulk import
as the first items.

```bash
M=~/Documents/mass-times
python3 seed.py $M/lirio/horario_missa $M/lirio/extract-2026-10-29/lirio-map.jsonl seed.sql \
  $M/churches.jsonl $M/snapshots/2026-06-17.jsonl.gz
pnpm --filter @ember/backend exec wrangler d1 execute ember-mass-times --remote --file=seed.sql
```
