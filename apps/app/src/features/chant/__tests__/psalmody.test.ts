// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseGabc } from '../gabc'
import { layoutScore } from '../layoutScore'
import { pointPsalm, psalmOf, toneOf } from '../psalmody'

const propers = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../content/chant-propers',
)
const antiphon = (opening: string) => {
  const file = readdirSync(propers).find((name) => name.startsWith(`an-${opening}-`))
  if (!file) throw new Error(`no antiphon ${opening}`)
  return parseGabc(readFileSync(resolve(propers, file), 'utf8'))
}

// Sunday Vespers' second psalm, as the hour gives it.
const item = [
  'Ant. Magna ópera Dómini: * exquisíta in omnes voluntátes eius.',
  '!Psalmus 110 [2]',
  '/:110:1:/ Confitébor tibi, Dómine, in toto corde meo: * in consílio iustórum, et congregatióne.',
  '/:110:2:/ Magna ópera Dómini: * exquisíta in omnes voluntátes eius.',
  '/:110:9:/ /:(fit reverentia):/ Sanctum, et terríbile nomen eius: *  inítium sapiéntiæ timor Dómini.',
  'V. Glória Patri, et Fílio, * et Spirítui Sancto.',
  'R. Sicut erat in princípio, et nunc, et semper, * et in sǽcula sæculórum. Amen.',
  '',
  'Ant. Magna ópera Dómini: exquisíta in omnes voluntátes eius.',
]

describe('toneOf', () => {
  it('reads the tone from the antiphon’s mode and the ending from its euouae', () => {
    const { headers, score } = antiphon('magna-opera-domini')
    // Mode III, and over its euouae the notes j j j h j i: the third tone's ending on b.
    expect(headers.mode).toBe('3')
    expect(toneOf(headers.mode, score)?.name).toBe('3 b')
  })

  it('has no tone for an antiphon without an euouae', () => {
    expect(toneOf('1', '(c4) SAl(d)ve(d) Re(a)gí(h)na(g) (::)')).toBeUndefined()
  })
})

describe('psalmOf', () => {
  it('takes the verses and the Gloria Patri, without numbers, rubrics or the antiphon', () => {
    const psalm = psalmOf(item)
    expect(psalm?.name).toBe('Psalmus 110')
    expect(psalm?.verses).toEqual([
      'Confitébor tibi, Dómine, in toto corde meo: * in consílio iustórum, et congregatióne.',
      'Magna ópera Dómini: * exquisíta in omnes voluntátes eius.',
      'Sanctum, et terríbile nomen eius: * inítium sapiéntiæ timor Dómini.',
      'Glória Patri, et Fílio, * et Spirítui Sancto.',
      'Sicut erat in princípio, et nunc, et semper, * et in sǽcula sæculórum. Amen.',
    ])
  })
})

describe('pointPsalm', () => {
  const { headers, score } = antiphon('magna-opera-domini')
  const tone = toneOf(headers.mode, score)
  if (!tone) throw new Error('no tone')
  const psalm = psalmOf(item)
  if (!psalm) throw new Error('no psalm')
  const gabc = pointPsalm(tone, psalm.verses)

  it('sets the cadences on the accents: the third tone’s two at the asterisk, one at the end', () => {
    const [first, second] = gabc.split('\n')
    // Intonation on the first verse only; "córde méo" takes the mediant's two accents.
    expect(first).toMatch(/^\(c4\) Con\(g\)fi\(hj\)té\(j\)bor\(j\)/)
    expect(first).toContain('cor(k)de(j) me(ih)o:(j.) *(:)')
    expect(first).toMatch(/con\(j\)gre\(j\)ga\(j\)ti\(h\)ó\(j\)ne\.\(i\.\) \(::\)$/)
    expect(second).toMatch(/^Ma\(j\)gna\(j\) ó\(k\)pe\(j\)ra\(j\) Dó\(j\)mi\(ih\)ni:\(j\.\)/)
  })

  it('ends the psalm as the antiphon’s euouae says it ends', () => {
    const amen = gabc.trim().split('\n').at(-1) ?? ''
    expect(amen).toMatch(/sæ\(j\)cu\(j\)ló\(j\)rum\.\(h\) A\(j\)men\.\(i\.\) \(::\)$/)
  })

  it('is a score the engraver sets, a staff or more a verse', () => {
    const layout = layoutScore(gabc, { width: 340 })
    expect(layout.lines.length).toBeGreaterThanOrEqual(psalm.verses.length)
  })
})
