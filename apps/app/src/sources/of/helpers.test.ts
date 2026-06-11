import type { RichText } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import type { Primitive } from '@/content/primitives'
import { lines } from './helpers'

const lang = { primary: 'pt-BR' as const }
const seg = (type: string, text: string) => ({ type, text }) as { type: string; text: string }
const rt = (lns: ReturnType<typeof seg>[][]): RichText =>
  ({ lines: { 'pt-BR': lns } }) as unknown as RichText

const types = (p: Primitive[]) => p.map((x) => x.type)

describe('lines — Order-of-Mass prose rendering', () => {
  it('keeps a rubric-led mixed line whole (quoted prayer stays inline, never broken)', () => {
    const p = lines(
      rt([
        [
          seg('rubric', 'Seguem-se as invocações '),
          seg('text', 'Senhor, tende piedade de nós '),
          seg('rubric', '(Kýrie, eléison)'),
          seg('rubric', ', caso já não tenham ocorrido.'),
        ],
      ]),
      lang,
    )
    expect(types(p)).toEqual(['rubric'])
    expect((p[0] as { text: { primary: string } }).text.primary).toContain('(Kýrie, eléison)')
  })

  it('groups V/. and R/. lines into one versicle/response block with the marks', () => {
    const p = lines(
      rt([
        [seg('rubric', 'V/.'), seg('text', 'O Senhor esteja convosco.')],
        [seg('rubric', 'R/.'), seg('response', 'Ele está no meio de nós.')],
      ]),
      lang,
    )
    expect(p).toHaveLength(1)
    const v = p[0] as {
      type: string
      style: string
      items: Array<{ role: string; text: { primary: string } }>
    }
    expect(v.type).toBe('verses')
    expect(v.style).toBe('vr')
    expect(v.items.map((i) => i.role)).toEqual(['v', 'r'])
    expect(v.items[1].text.primary).toBe('Ele está no meio de nós.')
  })

  it('marks a bare people-response line (the `response` parts) with ℟', () => {
    const p = lines(rt([[seg('response', 'Amém.')]]), lang)
    const v = p[0] as { type: string; items: Array<{ role: string }> }
    expect(v.type).toBe('verses')
    expect(v.items[0].role).toBe('r')
  })

  it('keeps a plain rubric line a rubric and a plain prayer line body text', () => {
    const p = lines(rt([[seg('rubric', 'Todos:')], [seg('text', 'Santo, Santo, Santo,')]]), lang)
    expect(types(p)).toEqual(['rubric', 'text'])
  })
})
