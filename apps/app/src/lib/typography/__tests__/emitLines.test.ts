import { writeFileSync } from 'node:fs'
import { test } from 'vitest'

import { justifyText } from '../justifyText'

// Not an assertion — a dev hook that dumps the shipped justifier's line model
// so it can be rendered with RN-only primitives and eyeballed. Off unless
// EMIT_JUSTIFIED_LINES is set.
//
//   EMIT_JUSTIFIED_LINES=/tmp/lines.json pnpm vitest run emitLines
test.skipIf(!process.env.EMIT_JUSTIFIED_LINES)('emit line model', () => {
  const la =
    'Aperi, Domine, os meum ad benedicendum Nomen sanctum tuum; munda quoque cor meum ab omnibus vanis, perversis et alienis cogitationibus; intellectum illumina, affectum inflamma, ut digne, attente ac devote hoc Officium recitare valeam, et exaudiri merear ante conspectum divinae Maiestatis tuae. Per Christum Dominum nostrum.'
  const en =
    'O Lord, open Thou my mouth to bless Thy holy name; cleanse my heart also from all vain, evil and wandering thoughts; enlighten my understanding, kindle my affections, that I may be able to recite this Office worthily, attentively and devoutly, and may deserve to be heard in the presence of Thy divine Majesty. Through Christ our Lord.'

  const common = { widthPx: 170.5, fontSizePx: 22, fontFamilyId: 'eb-garamond' } as const
  writeFileSync(
    process.env.EMIT_JUSTIFIED_LINES as string,
    JSON.stringify({
      la: justifyText({ ...common, text: la, language: 'la' }),
      en: justifyText({ ...common, text: en, language: 'en-US' }),
    }),
  )
})
