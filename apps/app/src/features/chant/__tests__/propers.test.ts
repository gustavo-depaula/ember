import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { beforeAll, describe, expect, it } from 'vitest'

import { setCatalog } from '@/content/contentIndex'
import { findMassChants, findOfficeChants } from '../propers'

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

describe('findOfficeChants', () => {
  it('finds a psalm’s antiphon once, though it is printed before the psalm and after', async () => {
    const chants = await findOfficeChants([
      'Ant. Magna ópera Dómini: * exquisíta in omnes voluntátes eius.',
      '!Psalmus 110 [2]',
      '/:110:1:/ Confitébor tibi, Dómine, in toto corde meo: * in consílio iustórum, et congregatióne.',
      'Ant. Magna ópera Dómini: exquisíta in omnes voluntátes eius.',
    ])
    expect(chants.map((c) => [c.genre, c.name, c.mode])).toEqual([
      ['an', 'Magna opera Domini', '3'],
    ])
  })

  it('finds a hymn under its rubric and a short responsory by its respond', async () => {
    const chants = await findOfficeChants([
      '#Capitulum Hymnus Versus',
      '!2 Cor 1:3-4',
      'v. Benedíctus Deus, et Pater Dómini nostri Iesu Christi.',
      '_',
      '!Hymnus',
      'v. Lucis Creátor óptime,',
      'Lucem diérum próferens,',
      'Primórdiis lucis novæ,',
      'Mundi parans oríginem:',
      '_',
      'r. Qui mane iunctum vésperi',
    ])
    expect(chants.map((c) => [c.genre, c.name])).toEqual([['hy', 'Lucis Creator optime']])
    const [respond] = await findOfficeChants([
      'R.br. In manus tuas, Dómine, * Comméndo spíritum meum.',
    ])
    expect(respond).toMatchObject({ genre: 'rb' })
  })
})
