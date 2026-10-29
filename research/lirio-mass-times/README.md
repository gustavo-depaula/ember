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

## Each week (by hand for now)

His site sits behind a Cloudflare bot check, so download the zip in a browser.

```bash
M=~/Documents/mass-times/lirio
unzip -o horario_missa.zip -d $M/snapshots/$(date +%F)
python3 diff.py --weekly $M/snapshots/<last week>/horario_missa $M/snapshots/$(date +%F)/horario_missa \
  $M/extract-2026-10-29/lirio-map.jsonl $M/weekly/$(date +%F)
```

`proposals.md` lists, per church he touched, the fields he changed and the times he added or removed.
A removed time maps onto our weekly rule for that day; our monthly and seasonal Masses are outside
his model, so nothing in a proposal touches them. A church he adds has no entry in `lirio-map.jsonl`
until we add it ourselves.
