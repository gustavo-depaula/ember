// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import type { ChantPrimitive, Primitive } from '@/content/primitives'
import { parseGabc } from '@/features/chant/gabc'
import { withChant } from '../chant'

const propers = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../content/chant-propers',
)
const chant = (opening: string): ChantPrimitive => {
  const file = readdirSync(propers).find((name) => name.startsWith(`${opening}-`))
  if (!file) throw new Error(`no chant ${opening}`)
  const { headers, score } = parseGabc(readFileSync(resolve(propers, file), 'utf8'))
  return { type: 'chant', name: headers.name, mode: headers.mode, score }
}
const sungOf = (primitives: Primitive[]) => {
  const sung = primitives.filter((p) => p.type === 'sung')
  expect(sung).toHaveLength(1)
  return sung[0]
}
const words = (primitives: Primitive[]) =>
  primitives
    .flatMap((p) =>
      p.type === 'text'
        ? [p.text.primary]
        : p.type === 'verses'
          ? p.items.map((item) => item.text.primary)
          : p.type === 'heading' || p.type === 'rubric'
            ? [p.text.primary]
            : [],
    )
    .join('\n')

describe('withChant', () => {
  // Compline files a chapter that is read, the short responsory and a versicle
  // under one heading; only the responsory is in the responsory's score.
  it('turns only the short responsory of Compline’s chapter, responsory and verse', async () => {
    const item = [
      '#Capitulum Responsorium Versus',
      '!Jer 14:9',
      'v. Tu autem in nobis es, Dómine, et nomen sanctum tuum invocátum est super nos: ne derelínquas nos, Dómine, Deus noster.',
      'R. Deo grátias.',
      '_',
      'R.br. In manus tuas, Dómine, * Comméndo spíritum meum.',
      'R. In manus tuas, Dómine, * Comméndo spíritum meum.',
      'V. Redemísti nos, Dómine, Deus veritátis.',
      'R. Comméndo spíritum meum.',
      'V. Glória Patri, et Fílio, * et Spirítui Sancto.',
      'R. In manus tuas, Dómine, * Comméndo spíritum meum.',
      '_',
      'V. Custódi nos, Dómine, ut pupíllam óculi.',
      'R. Sub umbra alárum tuárum prótege nos.',
    ].join('\n')
    const out = await withChant([item], [item], () => [chant('rb-in-manus-tuas')])
    const at = out.findIndex((p) => p.type === 'sung')
    const sung = sungOf(out)
    if (sung.type !== 'sung') throw new Error('unreachable')

    expect(words(sung.text)).toMatch(/^In manus tuas/)
    expect(words(sung.text)).not.toMatch(/Tu autem|Custódi/)
    expect(words(out.slice(0, at))).toMatch(/Capitulum[\s\S]*Tu autem in nobis/)
    expect(words(out.slice(at + 1))).toMatch(/Custódi nos/)
  })

  // An antiphon is often a verse of its psalm: its score alone must not take the psalm with it.
  it('leaves a psalm as text when only its antiphon has a score', async () => {
    const item = [
      'Ant. Magna ópera Dómini: * exquisíta in omnes voluntátes eius.',
      '!Psalmus 110 [2]',
      '110:1 Confitébor tibi, Dómine, in toto corde meo: * in consílio iustórum, et congregatióne.',
      '110:2 Magna ópera Dómini: * exquisíta in omnes voluntátes eius.',
      '110:3 Conféssio et magnificéntia opus eius: * et iustítia eius manet in sǽculum sǽculi.',
      '110:4 Memóriam fecit mirabílium suórum, miséricors et miserátor Dóminus: * escam dedit timéntibus se.',
    ].join('\n')
    const out = await withChant([item], [item], () => [chant('an-magna-opera-domini')])
    const sung = sungOf(out)
    if (sung.type !== 'sung') throw new Error('unreachable')

    expect(words(sung.text)).toMatch(/^Magna ópera Dómini/)
    expect(words(sung.text)).not.toMatch(/Confitébor/)
    expect(words(out.slice(out.indexOf(sung) + 1))).toMatch(/Confitébor tibi/)
  })

  it('keeps a proper’s title and citation with the text its score sets', async () => {
    const item = [
      '#Introitus',
      '!Ps 24:1-3',
      'v. Ad te levávi ánimam meam: Deus meus, in te confído, non erubéscam: neque irrídeant me inimíci mei: étenim univérsi, qui te exspéctant, non confundéntur.',
      '!Ps 24:4',
      'Vias tuas, Dómine, demónstra mihi: et sémitas tuas édoce me.',
    ].join('\n')
    const out = await withChant([item], [item], () => [chant('in-ad-te-levavi')])
    expect(out).toHaveLength(1)
    const sung = sungOf(out)
    if (sung.type !== 'sung') throw new Error('unreachable')
    expect(sung.text[0]).toMatchObject({ type: 'heading' })
  })
})
