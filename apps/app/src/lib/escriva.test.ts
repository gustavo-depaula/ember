import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchChapterHtml, fetchChapterList } from './escriva'

function mockFetch(routes: Record<string, unknown>) {
  return vi.fn(async (url: string) => {
    const body = routes[url]
    if (body === undefined) return { ok: false, status: 404, json: async () => ({}) }
    return { ok: true, status: 200, json: async () => body }
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchChapterList', () => {
  it('maps base chapters to point_list_url bodies', async () => {
    const url = 'https://escriva.org/api/v1/chapters/?book_id=12&site_id=1&limit=100'
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [url]: {
          count: 2,
          next: null,
          results: [
            { url: 'x', name: 'Character', point_list_url: 'PLU-1' },
            { url: 'y', name: 'Direction', point_list_url: 'PLU-2' },
          ],
        },
      }),
    )
    const chapters = await fetchChapterList(1, 12, 'base')
    expect(chapters).toEqual([
      { name: 'Character', bodyUrl: 'PLU-1' },
      { name: 'Direction', bodyUrl: 'PLU-2' },
    ])
  })

  it('uses the item url itself as the body for one-level books', async () => {
    const url = 'https://escriva.org/api/v1/one-level-texts/?book_id=126&site_id=1&limit=100'
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [url]: {
          count: 1,
          next: null,
          results: [{ url: 'STATION-1', name: 'First Station', point_list_url: 'ignored' }],
        },
      }),
    )
    const chapters = await fetchChapterList(1, 126, 'one-level')
    expect(chapters).toEqual([{ name: 'First Station', bodyUrl: 'STATION-1' }])
  })

  it('follows pagination via next', async () => {
    const p1 = 'https://escriva.org/api/v1/cartas-chapters/?book_id=461&site_id=6&limit=100'
    const p2 = 'https://escriva.org/api/v1/cartas-chapters/?book_id=461&offset=100'
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [p1]: {
          count: 2,
          next: p2,
          results: [{ url: 'a', name: 'Carta 1', point_list_url: 'b1' }],
        },
        [p2]: {
          count: 2,
          next: null,
          results: [{ url: 'c', name: 'Carta 2', point_list_url: 'b2' }],
        },
      }),
    )
    const chapters = await fetchChapterList(6, 461, 'cartas')
    expect(chapters.map((c) => c.name)).toEqual(['Carta 1', 'Carta 2'])
  })

  it('throws on a non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch({}))
    await expect(fetchChapterList(1, 999, 'base')).rejects.toThrow(/failed \(404\)/)
  })
})

describe('fetchChapterHtml', () => {
  it('renders numbered points with footnotes from a paginated list', async () => {
    const url = 'PLU-1'
    vi.stubGlobal(
      'fetch',
      mockFetch({
        [url]: {
          count: 2,
          next: null,
          results: [
            { number: 1, text: '<p>First.</p>', footnotes: {} },
            { number: 2, text: '<p>Second.</p>', footnotes: { '1': 'A note.' } },
          ],
        },
      }),
    )
    const html = await fetchChapterHtml(url)
    expect(html).toContain('<span class="point-num">1</span><p>First.</p>')
    expect(html).toContain('<span class="point-num">2</span><p>Second.</p>')
    expect(html).toContain('<section class="footnotes">')
    expect(html).toContain('A note.')
  })

  it('returns the single text for a one-level detail object', async () => {
    const url = 'STATION-1'
    vi.stubGlobal(
      'fetch',
      mockFetch({ [url]: { id: 99, name: 'First Station', text: '<p>It is after ten.</p>' } }),
    )
    const html = await fetchChapterHtml(url)
    expect(html).toBe('<p>It is after ten.</p>')
  })
})
