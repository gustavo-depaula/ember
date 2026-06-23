import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import type { Primitive } from '@/content/primitives'
import { packageEpub } from './epub/packageEpub'
import { buildRegistry, handleOpdsRequest } from './opds/routes'
import { createImageSink } from './serialize/imageSink'
import { primitivesToXhtml } from './serialize/primitivesToXhtml'
import type { SyncDocument } from './types'

const decode = (u: Uint8Array) => new TextDecoder().decode(u)

describe('primitivesToXhtml', () => {
  const sink = () => createImageSink().sink

  it('renders text, headings, rubrics, verses, dividers', () => {
    const primitives: Primitive[] = [
      { type: 'heading', text: { primary: 'Lauds' }, size: 'h1' },
      { type: 'rubric', text: { primary: 'All stand.' } },
      { type: 'text', text: { primary: 'Line one\nLine two' } },
      { type: 'divider' },
      {
        type: 'verses',
        items: [
          { num: 1, text: { primary: 'O God, come to my assistance.' }, role: 'v' },
          { text: { primary: 'O Lord, make haste to help me.' }, role: 'r' },
        ],
        style: 'vr',
      },
    ]
    const html = primitivesToXhtml(primitives, sink())
    expect(html).toContain('<h1>Lauds</h1>')
    expect(html).toContain('<p class="rubric">All stand.</p>')
    expect(html).toContain('Line one<br/>Line two')
    expect(html).toContain('<hr/>')
    expect(html).toContain('class="verse v"')
    expect(html).toContain('class="verse r"')
  })

  it('escapes XML and parses inline markdown', () => {
    const html = primitivesToXhtml(
      [{ type: 'text', text: { primary: 'Faith **&** hope <here>' } }],
      sink(),
    )
    expect(html).toContain('<strong>&amp;</strong>')
    expect(html).toContain('&lt;here&gt;')
  })

  it('drops interaction primitives and collapses select to the chosen branch', () => {
    const html = primitivesToXhtml(
      [
        {
          type: 'interaction',
          kind: 'offering',
          mode: 'both',
          default: 'all-active',
          show: 'list',
        },
        {
          type: 'container',
          behavior: {
            kind: 'select',
            label: { primary: 'Year' },
            overrideKey: 'year',
            selectedId: 'b',
            options: [
              {
                id: 'a',
                label: { primary: 'A' },
                children: [{ type: 'text', text: { primary: 'YEAR A' } }],
              },
              {
                id: 'b',
                label: { primary: 'B' },
                children: [{ type: 'text', text: { primary: 'YEAR B' } }],
              },
            ],
          },
        },
      ],
      sink(),
    )
    expect(html).toContain('YEAR B')
    expect(html).not.toContain('YEAR A')
    expect(html).not.toContain('offering')
  })

  it('registers corpus images and rewrites the src', () => {
    const { sink: s, getImages } = createImageSink()
    const html = primitivesToXhtml(
      [{ type: 'image', src: 'corpus://abc123.webp', caption: { primary: 'Icon' } }],
      s,
    )
    expect(html).toContain('src="images/abc123.webp"')
    expect(getImages()).toEqual([{ hash: 'abc123', ext: 'webp', mime: 'image/webp' }])
  })
})

describe('OPDS routes', () => {
  const docs: SyncDocument[] = [
    {
      id: 'office-2026-06-23',
      title: "Today's Office",
      category: 'daily',
      updated: '2026-06-23T08:00:00Z',
      build: async () => ({
        id: 'office-2026-06-23',
        title: "Today's Office",
        language: 'en-US',
        chapters: [{ id: 'lauds', title: 'Lauds', xhtml: '<p class="prayer">Praise.</p>' }],
        images: [],
      }),
    },
  ]
  const registry = buildRegistry(docs)

  it('serves a navigation feed at /opds', async () => {
    const res = await handleOpdsRequest('/opds', registry)
    expect(res.status).toBe(200)
    expect(res.contentType).toContain('kind=navigation')
    const body = decode(res.body)
    expect(body).toContain('<title>Ember</title>')
    expect(body).toContain('href="/opds/daily"')
  })

  it('serves an acquisition feed with an epub link', async () => {
    const res = await handleOpdsRequest('/opds/daily', registry)
    expect(res.status).toBe(200)
    expect(res.contentType).toContain('kind=acquisition')
    const body = decode(res.body)
    expect(body).toContain('href="/epub/office-2026-06-23.epub"')
    expect(body).toContain('type="application/epub+zip"')
  })

  it('builds and serves an EPUB on request', async () => {
    const res = await handleOpdsRequest('/epub/office-2026-06-23.epub', registry)
    expect(res.status).toBe(200)
    expect(res.contentType).toBe('application/epub+zip')
    const files = unzipSync(res.body)
    expect(decode(files.mimetype)).toBe('application/epub+zip')
  })

  it('404s unknown paths', async () => {
    expect((await handleOpdsRequest('/nope', registry)).status).toBe(404)
    expect((await handleOpdsRequest('/epub/missing.epub', registry)).status).toBe(404)
  })
})

describe('packageEpub', () => {
  it('produces a valid OCF zip with mimetype first and uncompressed', async () => {
    const bytes = await packageEpub({
      id: 'sample',
      title: 'Sample',
      language: 'en-US',
      chapters: [
        { id: 'one', title: 'One', xhtml: '<p>First.</p>' },
        { id: 'two', title: 'Two', xhtml: '<p>Second.</p>' },
      ],
      images: [],
    })

    // OCF requires the first entry to be an uncompressed `mimetype`. fflate
    // writes entries in insertion order; bytes 30..(30+len) hold the name then
    // the stored payload.
    const head = new TextDecoder().decode(bytes.slice(30, 38))
    expect(head).toBe('mimetype')

    const files = unzipSync(bytes)
    expect(decode(files.mimetype)).toBe('application/epub+zip')
    expect(files['META-INF/container.xml']).toBeDefined()
    expect(files['OEBPS/content.opf']).toBeDefined()
    expect(files['OEBPS/nav.xhtml']).toBeDefined()
    expect(files['OEBPS/toc.ncx']).toBeDefined()
    const opf = decode(files['OEBPS/content.opf'])
    expect(opf).toContain('<dc:title>Sample</dc:title>')
    expect(opf).toContain('media-type="application/xhtml+xml"')
  })
})
