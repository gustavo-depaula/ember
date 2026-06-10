import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type {
  Primitive,
  RubricPrimitive,
  TextPrimitive,
  VersesPrimitive,
} from '@/content/primitives'
import { parseHour, splitDaytime } from './parse'

const load = (f: string) => readFileSync(join(__dirname, '__fixtures__', f), 'utf-8')

const allText = (ps: Primitive[]) =>
  ps.map((p) => ('text' in p && p.text ? (p.text as { primary: string }).primary : '')).join('\n')

const rubrics = (ps: Primitive[]) =>
  ps.filter((p): p is RubricPrimitive => p.type === 'rubric').map((p) => p.text.primary)

const fixtures = [
  'pt-lodi.html',
  'pt-vespri.html',
  'pt-compieta.html',
  'pt-ufficio_delle_letture.html',
  'pt-ora_media.html',
  'en-lodi.html',
  'en-vespri.html',
  'en-compieta.html',
  'en-ufficio_delle_letture.html',
  'en-ora_media.html',
]

describe('parseHour — all fixtures', () => {
  it.each(fixtures)('%s parses to substantial content', (f) => {
    const out = parseHour(load(f))
    expect(out.length).toBeGreaterThan(30)
  })

  it.each(fixtures)('%s strips nav links, donate junk, and the appendix', (f) => {
    const text = allText(parseHour(load(f)))
    expect(text).not.toContain('Menu')
    expect(text).not.toContain('DONATE')
    expect(text).not.toContain('SUBSCRIBE')
    expect(text).not.toContain('***')
    expect(text).not.toContain('Go to')
  })

  it('throws when the content container is missing', () => {
    expect(() => parseHour('<html><body><div>nothing</div></body></html>')).toThrow(/#contenuto/)
  })
})

describe('parseHour — PT edition mapping', () => {
  const out = parseHour(load('pt-lodi.html'))

  it('decodes entities', () => {
    expect(allText(out)).toContain('Glória ao Senhor nas alturas')
  })

  it('drops the page title and h1', () => {
    const text = allText(out)
    expect(text).not.toContain('Breviário')
    expect(rubrics(out)).not.toContain('Laudes')
  })

  it('maps section labels and stage directions to rubrics', () => {
    const r = rubrics(out)
    expect(r).toContain('SALMODIA')
    expect(r).toContain('HINO')
    expect(r.some((t) => t.startsWith('Se antes das Laudes'))).toBe(true)
  })

  it('merges psalm title + subtitle into one rubric', () => {
    expect(rubrics(out)).toContain('Salmo 92 (93)\nAo Rei da Criação')
  })

  it('splits leading inline labels into rubric + text', () => {
    const i = out.findIndex((p) => p.type === 'rubric' && p.text.primary === 'Ant. 2')
    expect(i).toBeGreaterThan(0)
    const next = out[i + 1] as TextPrimitive
    expect(next.type).toBe('text')
    expect(next.text.primary).toContain('A Vós, Senhor')
  })

  it('keeps the reading label with its citation', () => {
    expect(rubrics(out).some((t) => t.startsWith('LEITURA BREVE'))).toBe(true)
  })

  it('maps the responsory to vr verses with roles', () => {
    const responsory = out.find(
      (p): p is VersesPrimitive =>
        p.type === 'verses' && p.items.length === 6 && p.items[0].text.primary.includes('Cristo'),
    )
    expect(responsory).toBeDefined()
    expect(responsory?.style).toBe('vr')
    expect(responsory?.items.map((x) => x.role)).toEqual(['v', 'r', 'v', 'r', 'v', 'r'])
  })

  it('renders psalm stanzas as multi-line text with flex marks and indent', () => {
    const stanza = out.find(
      (p): p is TextPrimitive => p.type === 'text' && p.text.primary.includes('revestiu-Se'),
    )
    expect(stanza?.text.primary).toContain('O Senhor é rei, revestiu-Se de majestade, *')
    expect(stanza?.text.primary).toContain('\n  revestiu-Se e cingiu-Se de poder, †')
  })

  it('renders epigraphs as italic text', () => {
    const epigraph = out.find(
      (p): p is TextPrimitive => p.type === 'text' && p.text.primary.includes('Exortai-vos'),
    )
    expect(epigraph?.style).toBe('italic')
  })

  it('folds multi-line versicles into one verses primitive', () => {
    const blessing = out[out.length - 1] as VersesPrimitive
    expect(blessing.type).toBe('verses')
    expect(blessing.items).toHaveLength(2)
    expect(blessing.items[0].text.primary).toContain('O Senhor nos abençoe')
    expect(blessing.items[0].text.primary).toContain('vida eterna')
    expect(blessing.items[1].text.primary).toContain('Amen')
  })
})

describe('parseHour — EN edition mapping', () => {
  const out = parseHour(load('en-lodi.html'))

  it('maps capolettera section labels to rubrics', () => {
    const r = rubrics(out)
    expect(r).toContain('INVITATORY')
    expect(r).toContain('PSALMODY')
    expect(r.some((t) => t.startsWith('READING'))).toBe(true)
    expect(r).toContain('DISMISSAL')
  })

  it('folds — response markers into text lines', () => {
    const text = allText(out)
    expect(text).toContain('— And my mouth will proclaim your praise.')
  })

  it('keeps Latin antiphons with their [ET] label', () => {
    expect(rubrics(out)).toContain('[ET]')
    expect(allText(out)).toContain('Duódecim apóstolos misit Iesus')
  })

  it('merges multi-line rubric spans (canticle title)', () => {
    expect(rubrics(out)).toContain(
      'Canticle of Zechariah\nLuke 1:68-79\nThe Messiah and his forerunner',
    )
  })
})

describe('splitDaytime', () => {
  const pt = splitDaytime(parseHour(load('pt-ora_media.html')), 'pt')
  const en = splitDaytime(parseHour(load('en-ora_media.html')), 'en')

  it('gives each PT hour its own reading and the shared psalmody + conclusion', () => {
    expect(rubrics(pt.terce).some((t) => t.includes('Rom 8, 15-16'))).toBe(true)
    expect(rubrics(pt.sext).some((t) => t.includes('Rom 8, 22-23'))).toBe(true)
    expect(rubrics(pt.none).some((t) => t.includes('2 Tim 1, 9'))).toBe(true)
    for (const hour of [pt.terce, pt.sext, pt.none]) {
      expect(allText(hour)).toContain('SALMODIA') // shared psalmody
      const last = hour[hour.length - 1] as VersesPrimitive
      expect(last.type).toBe('verses')
      expect(last.items[0].text.primary).toContain('Bendigamos o Senhor')
    }
    // no hour leaks another hour's reading
    expect(rubrics(pt.terce).some((t) => t.includes('2 Tim'))).toBe(false)
  })

  it('gives each EN hour the shared concluding prayer + acclamation', () => {
    for (const hour of [en.terce, en.sext, en.none]) {
      const r = rubrics(hour)
      expect(r.some((t) => t.startsWith('CONCLUDING PRAYER'))).toBe(true)
      expect(r.some((t) => t.startsWith('ACCLAMATION'))).toBe(true)
    }
    expect(allText(en.terce)).toContain('Romans 8:15-16')
    expect(allText(en.sext)).toContain('Romans 8:22-23')
    expect(allText(en.terce)).not.toContain('Romans 8:22-23')
  })

  it('drops the hour marker paragraphs themselves', () => {
    expect(allText(pt.terce)).not.toContain('Tércia')
    expect(rubrics(en.terce).some((t) => t.startsWith('MIDMORNING'))).toBe(false)
  })

  it('throws when markers are missing', () => {
    expect(() => splitDaytime(parseHour(load('pt-lodi.html')), 'pt')).toThrow(/markers/)
  })
})
