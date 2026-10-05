// Search, ranked as the app ranks it: the catalog scoring is the app's own
// module, and saints, Bible books and readings are matched with the same
// word matcher.
import { type IndexEntry, searchIndex } from '@/features/practices/searchScore'
import { matchWords, normalizeForSearch, searchWords } from '@/lib/search'
import type { ExtraEntry, SearchData } from '~/lib/searchData'

const root = document.querySelector<HTMLElement>('[data-search]')

if (root) {
  const input = root.querySelector<HTMLInputElement>('input[type=search]')
  const out = root.querySelector<HTMLElement>('[data-results]')
  const status = root.querySelector<HTMLElement>('[data-status]')
  const labels = JSON.parse(root.dataset.labels ?? '{}') as Record<string, string>
  let data: SearchData | undefined

  const esc = (text: string) => text.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`)

  function row(url: string, title: string, sub?: string): string {
    return `<li><a class="row" href="${esc(url)}"><span class="grow"><span class="row-title">${esc(title)}</span>${
      sub ? `<span class="t-caption" style="display:block">${esc(sub)}</span>` : ''
    }</span></a></li>`
  }

  function group(key: string, rows: string[]): string {
    if (!rows.length) return ''
    return `<section class="stack-sm"><div class="row-head"><h2>${esc(labels[key] ?? key)}</h2><span class="t-annotation">${rows.length}</span></div><ul class="rows">${rows
      .slice(0, 40)
      .join('')}</ul></section>`
  }

  function extraMatches(kind: ExtraEntry['kind'], tokens: string[]): ExtraEntry[] {
    const rank = { exact: 0, prefix: 1, typo: 2 }
    return (data?.extra ?? [])
      .filter((entry) => entry.kind === kind)
      .flatMap((entry) => {
        const match = matchWords(entry.words, tokens)
        return match ? [{ entry, match }] : []
      })
      .sort((a, b) => rank[a.match] - rank[b.match] || a.entry.title.length - b.entry.title.length)
      .map((m) => m.entry)
  }

  function run() {
    if (!data || !input || !out) return
    const query = input.value.trim()
    const tokens = searchWords(normalizeForSearch(query))
    if (!tokens.length) {
      out.innerHTML = ''
      if (status) status.hidden = true
      return
    }
    const urls = new Map(
      data.catalog.map((entry) => [`${entry.result.kind}/${entry.result.id}`, entry.url]),
    )
    const results = searchIndex(data.catalog as IndexEntry[], query)
    const of = (kind: string) =>
      results
        .filter((r) => r.kind === kind)
        .map((r) =>
          row(
            urls.get(`${r.kind}/${r.id}`) ?? '#',
            r.title,
            'subtitle' in r ? r.subtitle : undefined,
          ),
        )
    const html = [
      group('practice', of('practice')),
      group(
        'saint',
        extraMatches('saint', tokens).map((e) => row(e.url, e.title, e.sub)),
      ),
      group('collection', of('collection')),
      group('book', of('book')),
      group(
        'bible',
        extraMatches('bible', tokens).map((e) => row(e.url, e.title, e.sub)),
      ),
      group(
        'reading',
        extraMatches('reading', tokens).map((e) => row(e.url, e.title, e.sub)),
      ),
    ].join('')
    out.innerHTML = html
    if (status) status.hidden = html !== ''
    history.replaceState(null, '', `?q=${encodeURIComponent(query)}`)
  }

  if (input) {
    input.value = new URLSearchParams(location.search).get('q') ?? ''
    input.addEventListener('input', run)
    input.focus()
  }

  fetch(root.dataset.index as string)
    .then((res) => res.json())
    .then((json: SearchData) => {
      data = json
      run()
    })
}
