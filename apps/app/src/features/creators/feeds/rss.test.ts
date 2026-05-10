import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseRssFeed } from './rss'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = readFileSync(join(here, '__fixtures__/blog-rss.xml'), 'utf-8')

describe('parseRssFeed', () => {
  it('parses an RSS 2.0 blog feed', () => {
    const drafts = parseRssFeed(fixture)
    expect(drafts).toHaveLength(2)
    expect(drafts[0]).toMatchObject({
      guid: 'https://example.org/blog/totb',
      title: 'On the Theology of the Body',
      webUrl: 'https://example.org/blog/totb',
      summary: 'Summary paragraph for the article.',
      publishedAt: Date.parse('Mon, 28 Apr 2026 14:00:00 +0000'),
    })
    expect(drafts[1].title).toBe('Patristic readings on Confession')
  })

  it('parses Atom feeds', () => {
    const xml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>tag:example.org,2026:post-1</id>
    <title>The Examen for Beginners</title>
    <link rel="alternate" href="https://example.org/post-1"/>
    <published>2026-04-30T08:00:00Z</published>
    <summary>Short reflection on Ignatian examen.</summary>
  </entry>
</feed>`
    const drafts = parseRssFeed(xml)
    expect(drafts).toHaveLength(1)
    expect(drafts[0].title).toBe('The Examen for Beginners')
    expect(drafts[0].webUrl).toBe('https://example.org/post-1')
    expect(drafts[0].publishedAt).toBe(Date.parse('2026-04-30T08:00:00Z'))
  })

  it('returns empty for unrecognized roots', () => {
    expect(parseRssFeed('<other/>')).toEqual([])
  })
})
