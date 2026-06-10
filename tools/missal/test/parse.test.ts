import { describe, expect, it } from 'vitest'
import { parseEstructura } from '../src/parse/estructura'
import { parseHijoBlocks } from '../src/parse/hijo'
import { mergeDay } from '../src/parse/merge'

const hijoHtml = `
<html><body>
<div class="port hijo hijo_1"><h2>PRIMEIRO DOMINGO DO ADVENTO</h2></div>
<div class="port hijo hijo_2">
  <span class="red">Antífona da entrada</span>
  <span class="alindcha">Sl 24, 1-3</span><br>
  A vós, meu Deus, <i>elevo</i> a minha alma.
</div>
<div class="port hijo hijo_3"><p>Oremos. Ó Deus todo-poderoso.</p></div>
</body></html>`

describe('parseHijoBlocks', () => {
  it('extracts blocks by hijo_N with typed segments', () => {
    const blocks = parseHijoBlocks(hijoHtml, 'port')
    expect(blocks.map((b) => b.n)).toEqual([1, 2, 3])

    expect(blocks[0].segments).toEqual([
      { type: 'heading', level: 2, text: 'PRIMEIRO DOMINGO DO ADVENTO' },
    ])
    expect(blocks[0].text).toBe('PRIMEIRO DOMINGO DO ADVENTO')

    const types = blocks[1].segments.map((s) => s.type)
    expect(types).toContain('rubric')
    expect(types).toContain('reference')
    expect(types).toContain('break')
    expect(types).toContain('italic')

    expect(blocks[2].segments[0]).toEqual({ type: 'paragraph_start' })
    expect(blocks[2].segments.at(-1)).toEqual({ type: 'paragraph_end' })
  })

  it('falls back to bare .hijo when no language class is present', () => {
    const html = `<div class="hijo hijo_7">Per ómnia sǽcula sæculórum.</div>`
    const blocks = parseHijoBlocks(html, 'latin')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].n).toBe(7)
  })
})

const estructuraHtml = `
<html><body>
<div class="dia xlatin xport" id="A010">
  <div class="x_titulo padre padre_1"></div>
  <div class="x_ant_ent">
    <div class="padre padre_2"></div>
    <div class="agrupado_ant padre padre_3"></div>
  </div>
  <div class="cicloA">
    <div class="x_prim_lect"><div class="padre padre_4"></div></div>
  </div>
  <div class="annoprimo">
    <div class="x_evangelio"><div class="padre padre_5"></div></div>
  </div>
  <div class="padre padre_6 oracion"></div>
</div>
</body></html>`

describe('parseEstructura', () => {
  it('parses dia containers with slots, cycles, groups, and generics', () => {
    const days = parseEstructura(estructuraHtml)
    expect(days).toHaveLength(1)
    const day = days[0]
    expect(day.id).toBe('A010')
    expect(day.languages).toEqual(['latin', 'port'])

    const kinds = day.parts.map((p) => (p.kind === 'slot' ? p.type : p.kind))
    expect(kinds).toEqual([
      'x_titulo',
      'x_ant_ent',
      'cycle_start',
      'x_prim_lect',
      'cycle_end',
      'cycle_start',
      'x_evangelio',
      'cycle_end',
      'generic',
    ])

    const antEnt = day.parts[1]
    if (antEnt.kind !== 'slot') throw new Error('expected slot')
    expect(antEnt.padres).toEqual([2])
    expect(antEnt.groups).toEqual([{ group: 'ant', padre: 3 }])

    // annoprimo normalizes to cicloI
    const cycleStarts = day.parts.filter((p) => p.kind === 'cycle_start')
    expect(cycleStarts.map((p) => (p.kind === 'cycle_start' ? p.cycle : ''))).toEqual([
      'cicloA',
      'cicloI',
    ])

    const generic = day.parts.at(-1)
    if (generic?.kind !== 'slot') throw new Error('expected slot')
    expect(generic.classes).toEqual(['oracion'])
  })

  it('descends into nested padres inside a slot (Pentecost sequence case)', () => {
    const html = `
      <div class="dia" id="A860">
        <div class="x_salmo">
          <div class="padre padre_41">
            <div class="PsalmAlleluiaVerse padre padre_42"></div>
          </div>
        </div>
      </div>`
    const [day] = parseEstructura(html)
    const slot = day.parts[0]
    if (slot.kind !== 'slot') throw new Error('expected slot')
    expect(slot.padres).toEqual([41, 42])
    expect(slot.padreClasses?.['42']).toEqual(['PsalmAlleluiaVerse'])
  })
})

describe('mergeDay', () => {
  it('joins estructura padres with per-language blocks by N', () => {
    const [day] = parseEstructura(estructuraHtml)
    const merged = mergeDay('tiempos', 'tiempos_advnav', day, {
      port: parseHijoBlocks(hijoHtml, 'port'),
      latin: [{ n: 1, text: 'DOMINICA I ADVENTUS', segments: [] }],
    })

    expect(merged.id).toBe('A010')
    expect(merged.languagesWithContent).toEqual(['latin', 'port'])

    const titulo = merged.parts[0]
    if (titulo.kind !== 'slot') throw new Error('expected slot')
    expect(titulo.items[0].content.port?.text).toBe('PRIMEIRO DOMINGO DO ADVENTO')
    expect(titulo.items[0].content.latin?.text).toBe('DOMINICA I ADVENTUS')

    const antEnt = merged.parts[1]
    if (antEnt.kind !== 'slot') throw new Error('expected slot')
    expect(antEnt.items.map((i) => i.role)).toEqual(['main', 'ant'])
  })
})
