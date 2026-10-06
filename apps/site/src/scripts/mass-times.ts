// The Mass Times finder: search by name or by where you are, against the live
// API the app uses. Rows and church pages are drawn by the same functions that
// draw them at build.

import type { ServiceKind } from '@ember/api'
import { type Dict, makeT } from '~/lib/massTimes/t'
import {
  bySoonest,
  type ChurchDetail,
  churchHtml,
  churchRowHtml,
  type ListedChurch,
  type ViewContext,
} from '~/lib/massTimes/view'
import type { ChurchMap } from './mass-times-map'

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
    kind: kind as ServiceKind,
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
  let map: ChurchMap | undefined
  const mapElement = root.querySelector<HTMLElement>('[data-map]')

  const say = (message: string) => {
    if (status) status.textContent = message
  }

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${api}${path}`)
    if (!res.ok) throw new Error(String(res.status))
    return res.json() as Promise<T>
  }

  // A place's churches are listed by what begins soonest; a search by name keeps its own order.
  function show(churches: ListedChurch[], empty: string, soonest = true) {
    if (!results) return
    const view = ctx()
    results.innerHTML = (soonest ? bySoonest(churches, view) : churches)
      .map((church) => `<li>${churchRowHtml(church, view)}</li>`)
      .join('')
    say(churches.length ? '' : empty)
  }

  async function run(load: () => Promise<ListedChurch[]>, empty: string, soonest = true) {
    const mine = ++request
    try {
      const churches = await load()
      if (mine === request) show(churches, empty, soonest)
    } catch {
      if (mine === request) say(t('massTimes.error'))
    }
  }

  // With a map, the list is what the map shows: moving the map is the search.
  function nearby() {
    if (map && here) {
      map.flyTo(here.lat, here.lng)
      return
    }
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
    const from = here ?? map?.centre()
    const near = from ? `&near=${from.lat},${from.lng}` : ''
    void run(
      async () =>
        (
          await get<{ churches: ListedChurch[] }>(
            `/churches?q=${encodeURIComponent(query)}&limit=30${near}`,
          )
        ).churches,
      t('massTimes.noResults'),
      false,
    )
  }

  let timer: number | undefined
  input?.addEventListener('input', () => {
    window.clearTimeout(timer)
    const query = input.value.trim()
    timer = window.setTimeout(() => {
      if (query.length >= 2) search(query)
      else if (map) map.setKind(kind)
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
      if (input?.value.trim()) return
      if (map) map.setKind(kind)
      else if (here) nearby()
    })
  }

  // The map is a large library: it loads only where there is room to show it.
  if (mapElement && mapElement.offsetParent !== null) {
    import('./mass-times-map').then(({ mountChurchMap }) => {
      map = mountChurchMap({
        element: mapElement,
        api,
        kind,
        churchHref: (id) => `${churchBase}?id=${encodeURIComponent(id)}`,
        onChurches: (churches) => {
          if (!input?.value.trim()) show(churches, t('massTimes.emptyHint'))
        },
      })
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
