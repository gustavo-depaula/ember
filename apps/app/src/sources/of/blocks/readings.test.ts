import type { Reading, ReadingSet, ResponsorialPsalm } from '@ember/missal-schema'
import { describe, expect, it } from 'vitest'
import { renderReadingSet } from './readings'

const lang = { primary: 'pt-BR' as const }
const line = (text: string) => [{ type: 'text' as const, text }]
const reading = (text: string, citation: string): Reading['options'][number] => ({
  body: { lines: { 'pt-BR': [line(text)] }, citation: { 'pt-BR': citation } },
})

describe('renderReadingSet — multiple options', () => {
  it('labels a long and short Gospel form distinctly', () => {
    const gospel: Reading = {
      options: [
        reading('Versão longa com muito mais texto do que a forma breve, repetida.', '2, 22-40'),
        reading('Versão breve.', '2, 22-32'),
      ],
    }
    const flat = JSON.stringify(renderReadingSet({ gospel }, lang))
    expect(flat).toMatch(/Forma longa/)
    expect(flat).toMatch(/Forma breve/)
  })

  it('renders the psalm as a titled ℟ responsorial keeping every refrain', () => {
    const psalm: ResponsorialPsalm = {
      options: [
        {
          responses: [
            { lines: { 'pt-BR': [line('O Senhor é meu pastor.')] } },
            { lines: { 'pt-BR': [line('Aleluia.')] } },
          ],
          verses: { 'pt-BR': [[line('Verso um.')]] },
        },
      ],
    }
    const flat = renderReadingSet({ psalm }, lang)
    // Title is a heading, refrains are vr (℟) items, both kept.
    expect(flat.some((p) => p.type === 'heading')).toBe(true)
    const vr = flat.filter(
      (p) =>
        (p as { type: string; style?: string }).type === 'verses' &&
        (p as { style?: string }).style === 'vr',
    )
    const s = JSON.stringify(vr)
    expect(s).toContain('O Senhor é meu pastor.')
    expect(s).toContain('Aleluia.') // the alternate refrain is not dropped
    expect(s).toContain('"role":"r"')
  })
})
