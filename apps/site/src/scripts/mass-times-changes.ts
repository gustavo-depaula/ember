// The directory's change log, read live from the API: the whole log on its own page, and a
// church's latest changes on the church's page. Live because a correction applied on the desk
// should show within minutes, not at the next daily build.

import type { Locale } from '~/lib/locale'
import {
  type Change,
  type ChangesContext,
  type ChangesPage,
  changesHtml,
  changesStrings,
} from '~/lib/massTimes/changes'

function context(element: HTMLElement) {
  const locale = element.dataset.locale as Locale
  const churchBase = element.dataset.churchBase as string
  const ctx: ChangesContext = {
    s: changesStrings[locale],
    locale,
    // The church shell renders any church, even one the last build hadn't seen.
    churchHref: (id) => `${churchBase}?id=${encodeURIComponent(id)}`,
  }
  const lang = locale === 'pt-BR' ? 'pt' : 'en'
  const load = async (query: Record<string, string>): Promise<ChangesPage> => {
    const params = new URLSearchParams({ lang, ...query })
    const res = await fetch(`${element.dataset.api}/changes?${params}`)
    if (!res.ok) throw new Error(String(res.status))
    return res.json() as Promise<ChangesPage>
  }
  return { ctx, load }
}

const feed = document.querySelector<HTMLElement>('[data-changes-feed]')
if (feed) {
  const { ctx, load } = context(feed)
  const list = feed.querySelector<HTMLElement>('[data-list]') as HTMLElement
  const status = feed.querySelector<HTMLElement>('[data-status]') as HTMLElement
  const older = feed.querySelector<HTMLButtonElement>('[data-older]') as HTMLButtonElement
  let last: Change | undefined
  let next: string | undefined

  const more = async () => {
    older.disabled = true
    try {
      const page = await load({ limit: '20', ...(next ? { before: next } : {}) })
      list.insertAdjacentHTML('beforeend', changesHtml(page.changes, ctx, last))
      last = page.changes.at(-1) ?? last
      next = page.next
      status.textContent = last ? '' : ctx.s.none
    } catch {
      status.textContent = ctx.s.error
    }
    older.disabled = false
    older.hidden = !next
  }
  older.addEventListener('click', more)
  more()
}

// A church page's latest changes. The static page knows its church; the shell reads `?id=`.
const recent = document.querySelector<HTMLElement>('[data-church-changes]')
if (recent) {
  const id = recent.dataset.id || new URLSearchParams(location.search).get('id')
  const { ctx, load } = context(recent)
  if (id) {
    load({ church: id, limit: '3' }).then(
      ({ changes }) => {
        if (!changes.length) return
        const list = recent.querySelector<HTMLElement>('[data-list]') as HTMLElement
        list.innerHTML = changesHtml(changes, ctx)
        recent.hidden = false
      },
      () => {
        const status = recent.querySelector<HTMLElement>('[data-status]') as HTMLElement
        status.textContent = ctx.s.error
        recent.hidden = false
      },
    )
  }
}
