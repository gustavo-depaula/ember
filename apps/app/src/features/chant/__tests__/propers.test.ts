import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { beforeAll, describe, expect, it } from 'vitest'

import { setCatalog } from '@/content/contentIndex'
import { findMassChants } from '../propers'

// The built corpus: the index and the bundles are what the lookup is against.
beforeAll(() => {
  const corpus = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../../_site/hearth/v2',
  )
  setCatalog(JSON.parse(readFileSync(resolve(corpus, 'catalog.json'), 'utf8')))
})

describe('findMassChants', () => {
  it('finds an Introit by the antiphon, whatever follows it', async () => {
    const [chant, ...rest] = await findMassChants('Introitus', [
      '!Ps 24:1-3',
      'v. Ad te levávi ánimam meam: Deus meus, in te confído, non erubéscam: neque irrídeant me inimíci mei: étenim univérsi, qui te exspéctant, non confundéntur.',
      '!Ps 24:4',
      'Vias tuas, Dómine, demónstra mihi: et sémitas tuas édoce me.',
      'V. Glória Patri, et Fílio, et Spirítui Sancto.',
    ])
    expect(rest).toEqual([])
    expect(chant).toMatchObject({ name: 'Ad te levavi', genre: 'in', mode: '8' })
    expect(chant.score).toMatch(/^\(c[1-4]\) AD\(/)
  })

  it('gives a Graduale its gradual and its alleluia, in that order', async () => {
    const chants = await findMassChants('Graduale', [
      '!Ps 24:3; 24:4',
      'Univérsi, qui te exspéctant, non confundéntur, Dómine.',
      'V. Vias tuas, Dómine, notas fac mihi: et sémitas tuas édoce me. Allelúia, allelúia.',
      '!Ps 84:8.',
      'V. Osténde nobis, Dómine, misericórdiam tuam: et salutáre tuum da nobis. Allelúia.',
    ])
    expect(chants.map((c) => [c.genre, c.name])).toEqual([
      ['gr', 'Universi'],
      ['al', 'Ostende nobis'],
    ])
  })

  it('finds the Gradual’s wording for the Missal’s: "Ad te Domine levavi" for "Ad te levavi"', async () => {
    const [chant] = await findMassChants('Offertorium', [
      '!Ps 24:1-3.',
      'Ad te levávi ánimam meam: Deus meus, in te confído, non erubéscam: neque irrídeant me inimíci mei: étenim univérsi, qui te exspéctant, non confundéntur.',
    ])
    expect(chant).toMatchObject({ name: 'Ad te Domine', genre: 'of' })
  })

  it('has nothing for a text no book sets, and for a section that is not sung', async () => {
    expect(
      await findMassChants('Communio', ['!Ps 1:1', 'Verba quae nemo umquam cantavit in ecclesia.']),
    ).toEqual([])
    expect(
      await findMassChants('Oratio', ['Excita, quǽsumus, Dómine, poténtiam tuam, et veni.']),
    ).toEqual([])
  })
})
