import { Marked } from 'marked'
import { describe, expect, test } from 'vitest'
import { galleryExtension, parseAttrs, parseBody } from './markedGalleryExtension'

function md() {
  return new Marked().use(galleryExtension())
}

describe('parseAttrs', () => {
  test('parses display', () => {
    expect(parseAttrs('display=row')).toEqual({ display: 'row' })
    expect(parseAttrs('display=stack')).toEqual({ display: 'stack' })
    expect(parseAttrs('display="carousel"')).toEqual({ display: 'carousel' })
  })

  test('ignores unknown display values', () => {
    expect(parseAttrs('display=banana')).toEqual({})
  })

  test('parses weights as comma-separated numbers', () => {
    expect(parseAttrs('weights="2,1"')).toEqual({ weights: [2, 1] })
    expect(parseAttrs('weights="3, 1, 2"')).toEqual({ weights: [3, 1, 2] })
  })

  test('drops non-positive weight entries', () => {
    expect(parseAttrs('weights="2,-1,3"')).toEqual({ weights: [2, 3] })
  })

  test('parses caption with spaces', () => {
    expect(parseAttrs('caption="Two views"')).toEqual({ caption: 'Two views' })
  })

  test('parses multiple attributes', () => {
    expect(parseAttrs('display=row weights="1,1" caption="x"')).toEqual({
      display: 'row',
      weights: [1, 1],
      caption: 'x',
    })
  })

  test('returns empty for missing input', () => {
    expect(parseAttrs(undefined)).toEqual({})
    expect(parseAttrs('')).toEqual({})
  })
})

describe('parseBody', () => {
  test('pairs each image with the paragraph that follows', () => {
    const body = [
      '![Alpha](a.jpg)',
      'Caption for alpha.',
      '',
      '![Beta](b.jpg "Beta Author")',
      'Caption for beta.',
    ].join('\n')
    expect(parseBody(body)).toEqual([
      { src: 'a.jpg', alt: 'Alpha', attribution: undefined, captionText: 'Caption for alpha.' },
      { src: 'b.jpg', alt: 'Beta', attribution: 'Beta Author', captionText: 'Caption for beta.' },
    ])
  })

  test('handles images with no captions', () => {
    expect(parseBody('![](a.jpg)\n![](b.jpg)')).toEqual([
      { src: 'a.jpg', alt: undefined, attribution: undefined },
      { src: 'b.jpg', alt: undefined, attribution: undefined },
    ])
  })

  test('ignores lines before the first image', () => {
    expect(parseBody('Ignored intro line\n\n![](a.jpg)\nCap.')).toEqual([
      { src: 'a.jpg', alt: undefined, attribution: undefined, captionText: 'Cap.' },
    ])
  })

  test('ignores lines after a blank-line-closed caption', () => {
    const body = ['![](a.jpg)', 'first cap', '', 'stray text', '', '![](b.jpg)', 'second cap'].join(
      '\n',
    )
    expect(parseBody(body)).toEqual([
      { src: 'a.jpg', alt: undefined, attribution: undefined, captionText: 'first cap' },
      { src: 'b.jpg', alt: undefined, attribution: undefined, captionText: 'second cap' },
    ])
  })

  test('multi-line caption with no blank line between lines', () => {
    const body = '![](a.jpg)\nline one\nline two'
    expect(parseBody(body)).toEqual([
      {
        src: 'a.jpg',
        alt: undefined,
        attribution: undefined,
        captionText: 'line one\nline two',
      },
    ])
  })

  test('returns empty for body with no images', () => {
    expect(parseBody('Just some text.')).toEqual([])
  })
})

describe('galleryExtension — :::gallery directive', () => {
  test('default display is carousel', async () => {
    const html = await md().parse(':::gallery\n![](a.jpg)\n:::\n')
    expect(html).toContain('data-display="carousel"')
    expect(html).toContain('data-count="1"')
    expect(html).toContain('class="ember-gallery"')
    expect(html).toContain('<img src="a.jpg"')
  })

  test('attribute can override default display', async () => {
    const html = await md().parse(':::gallery{display=stack}\n![](a.jpg)\n:::\n')
    expect(html).toContain('data-display="stack"')
  })

  test('alt becomes title; markdown title becomes attribution; paragraph becomes prose', async () => {
    const html = await md().parse(
      ':::gallery\n![Sacred Heart](a.jpg "Batoni, 1767")\nThe most influential painting.\n:::\n',
    )
    expect(html).toContain('<strong class="ember-gallery-title">Sacred Heart</strong>')
    expect(html).toContain('<em class="ember-gallery-attribution">Batoni, 1767</em>')
    expect(html).toContain('The most influential painting.')
  })

  test('inline markdown in caption survives', async () => {
    const html = await md().parse(
      ':::gallery\n![](a.jpg)\nA *luminous* caption with **emphasis**.\n:::\n',
    )
    expect(html).toContain('<em>luminous</em>')
    expect(html).toContain('<strong>emphasis</strong>')
  })

  test('multiple items', async () => {
    const src = ':::gallery\n![Alpha](a.jpg)\nFirst.\n\n![Beta](b.jpg)\nSecond.\n:::\n'
    const html = await md().parse(src)
    expect(html).toContain('data-count="2"')
    expect(html.match(/class="ember-gallery-slide"/g)?.length).toBe(2)
    expect(html).toContain('First.')
    expect(html).toContain('Second.')
  })

  test('shared caption attribute renders below the figure', async () => {
    const html = await md().parse(':::gallery{caption="Overview"}\n![](a.jpg)\n:::\n')
    expect(html).toContain('<figcaption class="ember-gallery-caption">Overview</figcaption>')
  })
})

describe('galleryExtension — :::row directive', () => {
  test('default display is row', async () => {
    const html = await md().parse(':::row\n![](a.jpg)\n![](b.jpg)\n:::\n')
    expect(html).toContain('data-display="row"')
  })

  test('respects display=carousel attribute', async () => {
    const html = await md().parse(':::row{display=carousel}\n![](a.jpg)\n:::\n')
    expect(html).toContain('data-display="carousel"')
  })

  test('emits grid-template-columns when weights present', async () => {
    const html = await md().parse(':::row{weights="2,1"}\n![](a.jpg)\n![](b.jpg)\n:::\n')
    expect(html).toContain('grid-template-columns:2fr 1fr')
  })

  test('omits weights style when length mismatches items', async () => {
    const html = await md().parse(':::row{weights="2,1,3"}\n![](a.jpg)\n![](b.jpg)\n:::\n')
    expect(html).not.toContain('grid-template-columns')
  })
})

describe('galleryExtension — edge cases', () => {
  test('unclosed directive falls through to default markdown parsing', async () => {
    const html = await md().parse(':::gallery\n![](a.jpg)\n')
    // The :::gallery line is not consumed by the extension and is rendered
    // as part of a normal paragraph — no <figure> wrapper.
    expect(html).not.toContain('class="ember-gallery"')
    expect(html).toContain(':::gallery')
  })

  test('empty directive renders an HTML comment', async () => {
    const html = await md().parse(':::row\n:::\n')
    expect(html).toContain('<!-- empty gallery -->')
  })

  test('escapes HTML in alt and attribution', async () => {
    const html = await md().parse(':::gallery\n![<script>](a.jpg "<bad>")\n:::\n')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&lt;bad&gt;')
  })

  test('escapes HTML in src', async () => {
    const html = await md().parse(':::gallery\n![](a.jpg?x="y")\n:::\n')
    // Single-token URL regex stops at whitespace and `)` — so the URL stays
    // verbatim including ?x="y", and we escape on render.
    expect(html).toContain('a.jpg?x=')
    expect(html).not.toContain('src="a.jpg?x="y"')
  })

  test('start hook returns undefined when no directive present', async () => {
    const html = await md().parse('# Plain markdown\n\nNo directives here.\n')
    expect(html).toContain('<h1>')
    expect(html).not.toContain('ember-gallery')
  })

  test('does not interfere with footnotes when stacked', async () => {
    const { default: footnote } = await import('marked-footnote')
    const stacked = new Marked().use(footnote()).use(galleryExtension())
    const html = await stacked.parse(
      'A ref[^x].\n\n[^x]: A footnote.\n\n:::gallery\n![](a.jpg)\n:::\n',
    )
    expect(html).toContain('class="ember-gallery"')
    expect(html).toContain('footnote-x')
  })
})
