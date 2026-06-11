import type { Lang, Line } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { type BlockLines, splitNumberedForms } from '../src/enrich/order-forms'

const rubric = (text: string): Line => [{ type: 'rubric', text }]
const text = (t: string): Line => [{ type: 'text', text: t }]

/** A block map with the same shape the upstream Penitential Act produces. */
function blocks(entries: Array<[number, Partial<Record<Lang, Line[]>>]>): BlockLines {
  return new Map(entries)
}

describe('splitNumberedForms', () => {
  const labels = [{ 'pt-BR': 'A' }, { 'pt-BR': 'B' }]

  it('carves numbered forms, keeps the intro, drops the digit artifact', () => {
    const map = blocks([
      [1, { 'pt-BR': [rubric('O sacerdote convida:')] }], // intro
      [2, { 'pt-BR': [text('1 2 3')] }], // navigation artifact → dropped
      [3, { 'pt-BR': [rubric('1')] }], // marker
      [4, { 'pt-BR': [text('Forma um.')] }], // form A body
      [5, { 'pt-BR': [rubric('2')] }], // marker
      [6, { 'pt-BR': [text('Forma dois.')] }], // form B body
    ])
    const segs = splitNumberedForms(map, [1, 6], labels)
    expect(segs).toBeDefined()
    expect(segs).toHaveLength(2)
    const [intro, choice] = segs!
    expect(intro.kind).toBe('text')
    // The "1 2 3" artifact must not leak into the intro.
    const introText = JSON.stringify(intro)
    expect(introText).toContain('O sacerdote convida:')
    expect(introText).not.toContain('1 2 3')
    expect(choice.kind).toBe('choice')
    if (choice.kind !== 'choice') throw new Error('unreachable')
    expect(choice.options).toHaveLength(2)
    expect(choice.options[0].label['pt-BR']).toBe('A')
    expect(JSON.stringify(choice.options[0].segments)).toContain('Forma um.')
    expect(JSON.stringify(choice.options[1].segments)).toContain('Forma dois.')
  })

  it('returns undefined when fewer than two markers exist (flat body fallback)', () => {
    const map = blocks([
      [1, { 'pt-BR': [rubric('1')] }],
      [2, { 'pt-BR': [text('Only one form.')] }],
    ])
    expect(splitNumberedForms(map, [1, 2], labels)).toBeUndefined()
  })

  it('finds the same boundaries from any language (digits are language-independent)', () => {
    const map = blocks([
      [1, { la: [rubric('1')], 'pt-BR': [rubric('1')] }],
      [2, { la: [text('Forma I')], 'pt-BR': [text('Forma um')] }],
      [3, { la: [rubric('2')], 'pt-BR': [rubric('2')] }],
      [4, { la: [text('Forma II')], 'pt-BR': [text('Forma dois')] }],
    ])
    const segs = splitNumberedForms(map, [1, 4], labels)
    const choice = segs?.find((s) => s.kind === 'choice')
    if (choice?.kind !== 'choice') throw new Error('expected a choice segment')
    expect(JSON.stringify(choice.options[0].segments)).toContain('Forma I')
    expect(JSON.stringify(choice.options[0].segments)).toContain('Forma um')
  })
})
