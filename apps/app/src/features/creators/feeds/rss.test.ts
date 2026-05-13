import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseRssFeed } from './rss'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = readFileSync(join(here, '__fixtures__/blog-rss.xml'), 'utf-8')

describe('parseRssFeed', () => {
  it('parses an RSS 2.0 blog feed', () => {
    const { items } = parseRssFeed(fixture)
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      guid: 'https://example.org/blog/totb',
      title: 'On the Theology of the Body',
      webUrl: 'https://example.org/blog/totb',
      summary: 'Summary paragraph for the article.',
      publishedAt: Date.parse('Mon, 28 Apr 2026 14:00:00 +0000'),
    })
    expect(items[1].title).toBe('Patristic readings on Confession')
  })

  it('parses Atom feeds and surfaces channel icon when present', () => {
    const xml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <icon>https://example.org/icon.png</icon>
  <entry>
    <id>tag:example.org,2026:post-1</id>
    <title>The Examen for Beginners</title>
    <link rel="alternate" href="https://example.org/post-1"/>
    <published>2026-04-30T08:00:00Z</published>
    <summary>Short reflection on Ignatian examen.</summary>
  </entry>
</feed>`
    const { items, channelImage } = parseRssFeed(xml)
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('The Examen for Beginners')
    expect(items[0].webUrl).toBe('https://example.org/post-1')
    expect(items[0].publishedAt).toBe(Date.parse('2026-04-30T08:00:00Z'))
    expect(channelImage).toBe('https://example.org/icon.png')
  })

  it('returns empty result for unrecognized roots', () => {
    expect(parseRssFeed('<other/>')).toEqual({ items: [] })
  })
})
