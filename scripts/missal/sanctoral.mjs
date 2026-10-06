#!/usr/bin/env node
// Dumps upstream's saints switch (`santos` in feria_liturgica.js) as a table.
// The switch is keyed on day.month inside three season blocks and gated on the
// display language, so it is called for every date, block and language.
//
//   node scripts/missal/sanctoral.mjs > research/missale-romanum/consult/sanctoral.json

import { oracleSaints, upstreamLangs } from './oracle.mjs'

const rows = []
for (let d = new Date(2024, 0, 1); d.getFullYear() === 2024; d.setDate(d.getDate() + 1)) {
  for (const block of [1, 2, 3]) {
    for (const lang of upstreamLangs) {
      const { saints, labels, html } = oracleSaints(d, block, lang)
      for (const [key, link] of Object.entries(saints)) {
        rows.push({
          month: d.getMonth() + 1,
          day: d.getDate(),
          block,
          lang,
          key,
          link,
          label: labels[key],
          html,
        })
      }
    }
  }
}
process.stdout.write(JSON.stringify(rows))
