// The Mass Times finder: search by name or by where you are, against the live
// API the app uses. Rows and church pages are drawn by the same functions that
// draw them at build.

import { type Dict, makeT } from '~/lib/massTimes/t'
import {
  type ChurchDetail,
  churchHtml,
  churchRowHtml,
  type ListedChurch,
  type ViewContext,
} from '~/lib/massTimes/view'

const root = document.querySelector<HTMLElement>('[data-mass-times]')

if (root) {
  const api = root.dataset.api as string
  const locale = root.dataset.locale as string
  const churchBase = root.dataset.churchBase as string
  const t = makeT(
    'massTimes',
    JSON.parse(document.getElementById('mass-times-strings')?.textContent ?? '{}') as Dict,
  )
  const ctx = (): ViewContext => ({
    t,
    locale,
    now: new Date(),
    churchHref: (id) => `${churchBase}?id=${encodeURIComponent(id)}`,
  })

  const results = root.querySelector<HTMLElement>('[data-results]')
  const status = root.querySelector<HTMLElement>('[data-status]')
  const input = root.querySelector<HTMLInputElement>('input[type=search]')
  const locate = root.querySelector<HTMLButtonElement>('[data-locate]')
  const detail = root.querySelector<HTMLElement>('[data-church]')
  let kind = 'mass'
  let here: { lat: number; lng: number } | undefined
  let request = 0

  const say = (message: string) => {
    if (status) status.textContent = message
  }

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${api}${path}`)
    if (!res.ok) throw new Error(String(res.status))
    return res.json() as Promise<T>
  }

  function show(churches: ListedChurch[], empty: string) {
    if (!results) return
    results.innerHTML = churches
      .map((church) => `<li>${churchRowHtml(church, ctx())}</li>`)
      .join('')
    say(churches.length ? '' : empty)
  }

  async function run(load: () => Promise<ListedChurch[]>, empty: string) {
    const mine = ++request
    try {
      const churches = await load()
      if (mine === request) show(churches, empty)
    } catch {
      if (mine === request) say(t('massTimes.error'))
    }
  }

  function nearby() {
    if (!here) return
    const { lat, lng } = here
    void run(
      async () =>
        (
          await get<{ churches: ListedChurch[] }>(
            `/churches/near?lat=${lat}&lng=${lng}&radiusKm=15&limit=40&kind=${kind}`,
          )
        ).churches,
      t('massTimes.empty'),
    )
  }

  function search(query: string) {
    const near = here ? `&near=${here.lat},${here.lng}` : ''
    void run(
      async () =>
        (
          await get<{ churches: ListedChurch[] }>(
            `/churches?q=${encodeURIComponent(query)}&limit=30${near}`,
          )
        ).churches,
      t('massTimes.noResults'),
    )
  }

  let timer: number | undefined
  input?.addEventListener('input', () => {
    window.clearTimeout(timer)
    const query = input.value.trim()
    timer = window.setTimeout(() => {
      if (query.length >= 2) search(query)
      else if (here) nearby()
      else show([], t('massTimes.searchHint'))
    }, 250)
  })

  locate?.addEventListener('click', () => {
    say(t('massTimes.locating'))
    navigator.geolocation.getCurrentPosition(
      (position) => {
        here = { lat: position.coords.latitude, lng: position.coords.longitude }
        if (input) input.value = ''
        nearby()
      },
      (error) =>
        say(
          t(
            error.code === error.PERMISSION_DENIED
              ? 'massTimes.locationDenied'
              : 'massTimes.locationFailed',
          ),
        ),
      { maximumAge: 300_000, timeout: 15_000 },
    )
  })

  for (const chip of root.querySelectorAll<HTMLButtonElement>('[data-kind]')) {
    chip.addEventListener('click', () => {
      kind = chip.dataset.kind as string
      for (const other of root.querySelectorAll('[data-kind]')) {
        other.setAttribute('aria-pressed', String(other === chip))
      }
      if (here && !input?.value.trim()) nearby()
    })
  }

  // The church page: one static shell, filled from `?id=`.
  if (detail) {
    const id = new URLSearchParams(location.search).get('id')
    if (id) {
      get<ChurchDetail>(`/churches/${encodeURIComponent(id)}`)
        .then((church) => {
          detail.innerHTML = churchHtml(church, ctx())
          document.title = `${church.longName ?? church.name} — ${t('massTimes.title')} · Ember`
        })
        .catch(() => {
          detail.innerHTML = `<p class="mt-none">${t('massTimes.error')}</p>`
        })
    }
  }
}
