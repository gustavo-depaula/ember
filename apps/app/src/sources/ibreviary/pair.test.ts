import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Primitive, TextPrimitive } from '@/content/primitives'
import { pairEditions, segment } from './pair'
import { parseHour } from './parse'

const load = (f: string) => readFileSync(join(__dirname, '__fixtures__', f), 'utf-8')

const texts = (ps: Primitive[]) => ps.filter((p): p is TextPrimitive => p.type === 'text')

const findText = (ps: Primitive[], needle: string) =>
  texts(ps).find((p) => p.text.primary.includes(needle))

describe('segment', () => {
  it('recognizes the canonical sections of Lauds in every edition', () => {
    for (const [f, lang] of [
      ['pt-lodi.html', 'pt'],
      ['en-lodi.html', 'en'],
      ['la-lodi.html', 'la'],
    ] as const) {
      const ids = segment(parseHour(load(f)), lang).map((s) => s.id)
      for (const expected of ['hymn', 'psalmody', 'reading', 'responsory', 'gospel-canticle']) {
        expect(ids, f).toContain(expected)
      }
    }
  })

  it('maps OOR labels onto shared section ids across editions', () => {
    const en = segment(parseHour(load('en-ufficio_delle_letture.html')), 'en').map((s) => s.id)
    const la = segment(parseHour(load('la-ufficio_delle_letture.html')), 'la').map((s) => s.id)
    for (const id of ['first-reading', 'second-reading', 'responsory']) {
      expect(en).toContain(id)
      expect(la).toContain(id)
    }
    // EN's TE DEUM and LA's second HYMNUS both land on 'hymn'
    expect(en.filter((id) => id === 'hymn').length).toBeGreaterThan(1)
    expect(la.filter((id) => id === 'hymn').length).toBeGreaterThan(1)
  })
})

describe('pairEditions — PT Lauds + LA', () => {
  const out = pairEditions(
    parseHour(load('pt-lodi.html')),
    parseHour(load('la-lodi.html')),
    'pt',
    'la',
  )

  it('pairs antiphons', () => {
    const ant = findText(out, 'Glória ao Senhor nas alturas')
    expect(ant?.text.secondary).toContain('Mirábilis in altis Dóminus')
  })

  it('pairs psalm epigraphs (italic ↔ italic)', () => {
    const epigraph = findText(out, 'O Senhor Deus omnipotente reina')
    expect(epigraph?.style).toBe('italic')
    expect(epigraph?.text.secondary).toContain('Regnavit Dominus')
  })

  it('pairs psalm stanzas by stanza correspondence despite different versification', () => {
    // PT counts 5 mediant stars in Ps 92(93), LA 6 — but both break it into
    // three stanzas, so stanza-count pairing applies.
    const s1 = findText(out, 'revestiu-Se de majestade')
    expect(s1?.text.secondary).toContain('Dóminus regnávit')
    const s3 = findText(out, 'Os vossos testemunhos')
    expect(s3?.text.secondary).toContain('Testimónia tua')
  })

  it('leaves bodies unpaired when both rules fail (Dan canticle versifies differently)', () => {
    const dan = findText(out, 'Obras do Senhor, bendizei o Senhor')
    expect(dan?.text.secondary).toBeUndefined()
  })

  it('pairs the short reading and the oration', () => {
    expect(findText(out, 'Vou abrir os vossos túmulos')?.text.secondary).toContain(
      'Hæc dicit Dóminus Deus',
    )
    expect(findText(out, 'fortaleza dos que esperam')?.text.secondary).toContain(
      'in te sperántium fortitúdo',
    )
  })

  it('leaves the hymn unpaired — the editions sing different hymns at Lauds', () => {
    const hymn = findText(out, 'Vão-se as sombras da noite')
    expect(hymn?.text.secondary).toBeUndefined()
  })
})

describe('pairEditions — EN Vespers + LA', () => {
  const out = pairEditions(
    parseHour(load('en-vespri.html')),
    parseHour(load('la-vespri.html')),
    'en',
    'la',
  )

  it('pairs hymn stanzas (EN Vespers hymn is a translation of Lucis creator)', () => {
    const hymn = findText(out, 'Sublime Creator of the light')
    expect(hymn?.text.secondary).toContain('Lucis creátor óptime')
  })

  it('pairs psalm verses one-to-one when versification agrees (Ps 111)', () => {
    const v1 = findText(out, 'I will thank the Lord with all my heart')
    expect(v1?.text.secondary).toContain('Confitébor Dómino in toto corde meo')
  })

  it('keeps the repeated antiphon and the numbered one on the right texts', () => {
    const ant2 = findText(out, 'memorial of his wonderful work')
    expect(ant2?.text.secondary).toContain('Memóriam fecit mirabílium')
    const ant3 = findText(out, 'All power is yours')
    expect(ant3?.text.secondary).toContain('Regnávit Dóminus Deus noster')
  })

  it('pairs the Gloria Patri even when the psalm body cannot align (Ps 110)', () => {
    const body = findText(out, 'revelation to my Master')
    expect(body?.text.secondary).toBeUndefined()
    const glorias = texts(out).filter((p) =>
      p.text.primary.startsWith('Glory to the Father, and to the Son, *'),
    )
    expect(glorias.some((g) => g.text.secondary?.includes('Glória Patri'))).toBe(true)
  })

  it('never pairs the EN-only Psalm Prayer', () => {
    const pp = findText(out, 'give us victory and peace')
    expect(pp?.text.secondary).toBeUndefined()
  })

  it('pairs the reading', () => {
    expect(findText(out, 'Praised be the God and Father')?.text.secondary).toContain(
      'Benedíctus Deus et Pater',
    )
  })
})

describe('pairEditions — PT Lauds + EN (vernacular ↔ vernacular)', () => {
  const out = pairEditions(
    parseHour(load('pt-lodi.html')),
    parseHour(load('en-lodi.html')),
    'pt',
    'en',
  )

  it('pairs antiphons and the reading', () => {
    expect(findText(out, 'Glória ao Senhor nas alturas')?.text.secondary).toContain(
      'Glorious is the Lord on high',
    )
    expect(findText(out, 'Vou abrir os vossos túmulos')?.text.secondary).toContain(
      'I will open your graves',
    )
  })

  it('redistributes EN verses onto PT stanzas with flexa-opened verses intact', () => {
    // PT chunks Ps 92(93) into 3 stanzas, EN into one stanza per verse — the
    // verse-unit path applies, and EN's unindented "…; †" lines must open
    // their own verse rather than glue to the previous one.
    const s2 = findText(out, 'os rios levantaram a sua voz')
    expect(s2?.text.secondary?.startsWith('The waters have lifted up, O Lord, †')).toBe(true)
    const s3 = findText(out, 'Os vossos testemunhos')
    expect(s3?.text.secondary?.startsWith('Truly your decrees are to be trusted. †')).toBe(true)
  })
})

describe('pairEditions — no false pairs across whole offices', () => {
  it('every secondary on a paired EN Compline is Latin (spot heuristic)', () => {
    const out = pairEditions(
      parseHour(load('en-compieta.html')),
      parseHour(load('la-compieta.html')),
      'en',
      'la',
    )
    const paired = texts(out).filter((p) => p.text.secondary)
    expect(paired.length).toBeGreaterThan(3)
    for (const p of paired) {
      // Latin texts in these fixtures never contain English function words.
      expect(p.text.secondary).not.toMatch(/\b(the|and the|of the)\b/)
    }
  })
})
