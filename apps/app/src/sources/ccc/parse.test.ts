import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extractParagraphs, pageToBookHtml } from './parse'

function fixture(name: string): string {
  return new TextDecoder('iso-8859-1').decode(readFileSync(join(__dirname, '__fixtures__', name)))
}

describe('pageToBookHtml — English (IntraText) pages', () => {
  it('tags numbered paragraphs with anchors and keeps the heading', () => {
    const html = pageToBookHtml(fixture('en-p2.html'), 'en-US')
    expect(html).toContain('<h3>I. The life of man - to know and love God</h3>')
    expect(html).toMatch(/<p id="ccc-1"><b class="ccc-n">1<\/b>/)
    const paras = extractParagraphs(html)
    expect(paras.map((p) => p.number)).toEqual([1, 2, 3])
    expect(paras[0].text).toContain('God, infinitely perfect and blessed in himself')
  })

  it('handles IN BRIEF summaries (number wrapped in <i>)', () => {
    const html = pageToBookHtml(fixture('en-pae.html'), 'en-US')
    expect(html).toContain('<h3>IN BRIEF</h3>')
    const paras = extractParagraphs(html)
    expect(paras.map((p) => p.number)).toEqual([
      2857, 2858, 2859, 2860, 2861, 2862, 2863, 2864, 2865,
    ])
  })

  it('strips chrome: no tables, fonts, MsoNormal, sup footnotes', () => {
    const html = pageToBookHtml(fixture('en-p2.html'), 'en-US')
    expect(html).not.toMatch(/<table|<font|MsoNormal|<sup|class=["']?MsoNormal/i)
  })
})

describe('pageToBookHtml — Portuguese chapter pages', () => {
  it('extracts every numbered paragraph in the chapter (incl. blockquotes)', () => {
    const html = pageToBookHtml(fixture('pt-p1s1c1.html'), 'pt-BR')
    const nums = extractParagraphs(html).map((p) => p.number)
    expect(nums).toEqual(Array.from({ length: 24 }, (_, i) => 26 + i))
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<h3>I. O desejo de Deus</h3>')
  })

  it('preserves part/section headings as non-paragraph text', () => {
    const html = pageToBookHtml(fixture('pt-p1s1c1.html'), 'pt-BR')
    expect(html).toContain('<h3>PRIMEIRA PARTE</h3>')
    expect(html).toContain('<h3>A PROFISSÃO DA FÉ</h3>')
  })

  it('recovers a paragraph whose marker floats after a block close (§17)', () => {
    const html = pageToBookHtml(fixture('pt-prologo.html'), 'pt-BR')
    const nums = extractParagraphs(html).map((p) => p.number)
    expect(nums).toEqual(Array.from({ length: 25 }, (_, i) => 1 + i))
    expect(html).toContain('id="ccc-17"')
  })

  it('strips chrome: no tables, fonts, td, MsoNormal', () => {
    const html = pageToBookHtml(fixture('pt-p1s1c1.html'), 'pt-BR')
    expect(html).not.toMatch(/<table|<font|<td|MsoNormal/i)
  })
})
