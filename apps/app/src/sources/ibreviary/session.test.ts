import { describe, expect, it } from 'vitest'
import { fetchSectionHtml } from './session'

type Call = { url: string; method: string; body?: string }

// fetchImpl that records calls and lets each response resolve on demand, so
// tests can assert ordering across concurrent fetchSectionHtml calls.
function makeFetch(opts?: { failPost?: boolean; delayMs?: number }) {
  const calls: Call[] = []
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    calls.push({ url, method, body: typeof init?.body === 'string' ? init.body : undefined })
    if (opts?.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs))
    if (opts?.failPost && method === 'POST') {
      return { ok: false, status: 500, text: async () => '' } as Response
    }
    return { ok: true, status: 200, text: async () => `<html>${url}</html>` } as Response
  }) as typeof fetch
  return { calls, fetchImpl }
}

describe('fetchSectionHtml', () => {
  it('issues POST opzioni then GET section per unit, with date/lang form fields', async () => {
    const { calls, fetchImpl } = makeFetch()
    const html = await fetchSectionHtml('pt', new Date(2026, 5, 14), 'lodi', fetchImpl)
    expect(calls).toHaveLength(2)
    expect(calls[0].method).toBe('POST')
    expect(calls[0].url).toContain('opzioni.php')
    expect(calls[0].body).toBe('lang=pt&giorno=14&mese=6&anno=2026&ok=ok')
    expect(calls[1].method).toBe('GET')
    expect(calls[1].url).toContain('breviario.php?s=lodi')
    expect(html).toContain('lodi')
  })

  it('serializes concurrent units so POST+GET pairs never interleave', async () => {
    const { calls, fetchImpl } = makeFetch({ delayMs: 5 })
    await Promise.all([
      fetchSectionHtml('pt', new Date(2026, 5, 14), 'vespri', fetchImpl),
      fetchSectionHtml('en', new Date(2026, 5, 15), 'compieta', fetchImpl),
    ])
    expect(calls.map((c) => c.method)).toEqual(['POST', 'GET', 'POST', 'GET'])
    expect(calls[1].url).toContain('s=vespri')
    expect(calls[2].body).toContain('lang=en')
    expect(calls[3].url).toContain('s=compieta')
  })

  it('dedupes concurrent calls for the same lang/date/section into one unit', async () => {
    const { calls, fetchImpl } = makeFetch({ delayMs: 5 })
    const [a, b] = await Promise.all([
      fetchSectionHtml('en', new Date(2026, 5, 16), 'ora_media', fetchImpl),
      fetchSectionHtml('en', new Date(2026, 5, 16), 'ora_media', fetchImpl),
    ])
    expect(calls).toHaveLength(2)
    expect(a).toBe(b)
  })

  it('a failed unit rejects but does not poison the next unit', async () => {
    const failing = makeFetch({ failPost: true })
    await expect(
      fetchSectionHtml('en', new Date(2026, 5, 17), 'lodi', failing.fetchImpl),
    ).rejects.toThrow('500')
    const ok = makeFetch()
    const html = await fetchSectionHtml('en', new Date(2026, 5, 18), 'lodi', ok.fetchImpl)
    expect(html).toContain('lodi')
    expect(ok.calls).toHaveLength(2)
  })
})
