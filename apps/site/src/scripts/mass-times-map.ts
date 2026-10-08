// The churches on a map, as in the app: the same tiles (OpenFreeMap), the
// same jewel-toned pins, the API's own clustering. Loaded only on the Mass
// Times page, and only when the page has room for a map.
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// MapLibre's ESM build keeps its worker in a file of its own; Vite bundles it and hands back the URL.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { pinColor } from '@/features/mass-times/components/mapPins'
import type { ListedChurch } from '~/lib/massTimes/view'

type Cluster = {
  id: string
  lat: number
  lng: number
  count: number
  church?: { id: string; name: string }
}
type Viewport = { churches: ListedChurch[]; clusters: Cluster[] }

export type ChurchMap = {
  /** Centre on a point (the reader's position, a search result). */
  flyTo(lat: number, lng: number, zoom?: number): void
  centre(): { lat: number; lng: number }
  setKind(kind: string): void
}

maplibregl.setWorkerUrl(workerUrl)

// São Paulo, where the catalogue began: the app's own default.
const start = { lat: -23.5505, lng: -46.6333, zoom: 12 }

export function mountChurchMap(options: {
  element: HTMLElement
  api: string
  kind: string
  churchHref: (id: string) => string
  /** What a pin shows when clicked: the church's row, linking on to its page. */
  cardHtml: (church: ListedChurch) => string
  onChurches: (churches: ListedChurch[]) => void
}): ChurchMap {
  const dark =
    document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches)
  const map = new maplibregl.Map({
    container: options.element,
    style: `https://tiles.openfreemap.org/styles/${dark ? 'dark' : 'liberty'}`,
    center: [start.lng, start.lat],
    zoom: start.zoom,
    attributionControl: { compact: true },
  })
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

  let kind = options.kind
  let markers: maplibregl.Marker[] = []
  let request = 0
  // The card belongs to the map, not to its pin: pins are redrawn on every move.
  let card: maplibregl.Popup | undefined

  function show(at: { lat: number; lng: number }, fill: (popup: maplibregl.Popup) => void) {
    card?.remove()
    card = new maplibregl.Popup({
      offset: 18,
      closeButton: false,
      maxWidth: '300px',
      // MapLibre would focus the card's link, ringing a card opened by mouse.
      focusAfterOpen: false,
    }).setLngLat([at.lng, at.lat])
    fill(card)
    card.addTo(map)
  }

  function pin(at: { name: string; lat: number; lng: number }, onClick: () => void) {
    const element = document.createElement('button')
    element.type = 'button'
    element.className = 'map-pin'
    element.title = at.name
    element.style.background = pinColor(at.name)
    element.textContent = '✝'
    element.addEventListener('click', (event) => {
      // The map would take the same click for one on itself, and close the card it just opened.
      event.stopPropagation()
      onClick()
    })
    markers.push(new maplibregl.Marker({ element }).setLngLat([at.lng, at.lat]).addTo(map))
  }

  // A church the viewport only counted comes without its schedule: the card asks for it,
  // and failing that still names the church and leads to its page.
  async function showCounted(church: { id: string; name: string }, at: Cluster) {
    const res = await fetch(`${options.api}/churches/${encodeURIComponent(church.id)}`).catch(
      () => undefined,
    )
    if (res?.ok) {
      const full = (await res.json()) as ListedChurch
      show(at, (popup) => popup.setHTML(options.cardHtml(full)))
      return
    }
    const link = document.createElement('a')
    link.className = 'mt-row'
    link.href = options.churchHref(church.id)
    const name = document.createElement('span')
    name.className = 'mt-name'
    name.textContent = church.name
    link.append(name)
    show(at, (popup) => popup.setDOMContent(link))
  }

  async function refresh() {
    const mine = ++request
    const b = map.getBounds()
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
      .map((n) => n.toFixed(5))
      .join(',')
    const res = await fetch(`${options.api}/churches?bbox=${bbox}&limit=100&kind=${kind}`)
    if (!res.ok || mine !== request) return
    const view = (await res.json()) as Viewport
    for (const marker of markers) marker.remove()
    markers = []
    // Zoomed out, the clusters account for every church in view (a cluster of one stands in
    // for its church) and `churches` is only the list's nearest few: pinning both would draw
    // those churches twice, once alone and once inside a count.
    if (view.clusters.length === 0) {
      for (const church of view.churches) {
        pin({ ...church, name: church.longName ?? church.name }, () =>
          show(church, (popup) => popup.setHTML(options.cardHtml(church))),
        )
      }
    }
    const listed = new Map(view.churches.map((church) => [church.id, church]))
    for (const cluster of view.clusters) {
      const { church } = cluster
      if (church) {
        const known = listed.get(church.id)
        pin({ ...cluster, name: church.name }, () =>
          known
            ? show(cluster, (popup) => popup.setHTML(options.cardHtml(known)))
            : void showCounted(church, cluster),
        )
        continue
      }
      const bubble = document.createElement('button')
      bubble.type = 'button'
      bubble.className = 'map-cluster'
      bubble.textContent =
        cluster.count > 999 ? `${Math.round(cluster.count / 1000)}k` : String(cluster.count)
      bubble.addEventListener('click', () =>
        map.flyTo({ center: [cluster.lng, cluster.lat], zoom: map.getZoom() + 2 }),
      )
      markers.push(
        new maplibregl.Marker({ element: bubble }).setLngLat([cluster.lng, cluster.lat]).addTo(map),
      )
    }
    options.onChurches(view.churches)
  }

  map.on('load', refresh)
  map.on('moveend', refresh)

  return {
    flyTo: (lat, lng, zoom = 13) => map.flyTo({ center: [lng, lat], zoom }),
    centre: () => ({ lat: map.getCenter().lat, lng: map.getCenter().lng }),
    setKind: (next) => {
      kind = next
      card?.remove()
      void refresh()
    },
  }
}
