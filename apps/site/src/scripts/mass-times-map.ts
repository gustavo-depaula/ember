// The churches on a map, as in the app: the same map tiles (OpenFreeMap), the
// same jewel-toned pins, the same church tiles read the same way. Loaded only on the Mass
// Times page, and only when the page has room for a map.
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { ServiceKind } from '@ember/api'
// MapLibre's ESM build keeps its worker in a file of its own; Vite bundles it and hands back the URL.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { pinColor } from '@/features/mass-times/components/mapPins'
import type { Cluster } from '@/lib/mass-times/client'
import {
  type DrawnView,
  drawView,
  planView,
  ringAround,
  type Tile,
  tilePath,
  type ViewPlan,
} from '@/lib/mass-times/tiles'
import type { ListedChurch } from '~/lib/massTimes/view'

export type ChurchMap = {
  /** Centre on a point (the reader's position, a search result). */
  flyTo(lat: number, lng: number, zoom?: number): void
  centre(): { lat: number; lng: number }
  setKind(kind: ServiceKind): void
}

maplibregl.setWorkerUrl(workerUrl)

// São Paulo, where the catalogue began: the app's own default.
const start = { lat: -23.5505, lng: -46.6333, zoom: 12 }

export function mountChurchMap(options: {
  element: HTMLElement
  api: string
  kind: ServiceKind
  churchHref: (id: string) => string
  /** What a pin shows when clicked: the church's row, linking on to its page. */
  cardHtml: (church: ListedChurch) => string
  /** The view changed, or more of it arrived: what the list beside the map should show. */
  onView: (view: DrawnView) => void
  onError: () => void
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
  // Every tile asked for, by its address, and the ones that have answered. A tile is asked for
  // once: panning back over it, or changing the filter over detail tiles, costs nothing.
  const asked = new Map<string, Promise<void>>()
  const arrived = new Map<string, Tile>()
  let plan: ViewPlan | undefined
  // The markers on the map by what they stand for, so a redraw moves nothing that has not changed.
  const markers = new Map<string, maplibregl.Marker>()
  // The card belongs to the map, not to its pin: pins are redrawn as the view changes.
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
    return new maplibregl.Marker({ element }).setLngLat([at.lng, at.lat]).addTo(map)
  }

  function bubble(cluster: Cluster) {
    const element = document.createElement('button')
    element.type = 'button'
    element.className = 'map-cluster'
    element.textContent =
      cluster.count > 999 ? `${Math.round(cluster.count / 1000)}k` : String(cluster.count)
    element.addEventListener('click', () =>
      map.flyTo({ center: [cluster.lng, cluster.lat], zoom: map.getZoom() + 2 }),
    )
    return new maplibregl.Marker({ element }).setLngLat([cluster.lng, cluster.lat]).addTo(map)
  }

  // A church a count tile only counted comes without its schedule: the card asks for it, and
  // failing that still names the church and leads to its page.
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

  function bounds() {
    const b = map.getBounds()
    return {
      minLng: Math.max(-180, b.getWest()),
      minLat: Math.max(-90, b.getSouth()),
      maxLng: Math.min(180, b.getEast()),
      maxLat: Math.min(90, b.getNorth()),
    }
  }

  function draw() {
    if (!plan) return
    const { mode } = plan
    const bbox = bounds()
    const view = drawView({
      plan,
      tiles: plan.tiles.map((cell) => arrived.get(tilePath(cell, mode, kind))),
      bbox,
      pxPerDeg: options.element.clientWidth / (bbox.maxLng - bbox.minLng),
      kind,
    })
    const listed = new Map(view.churches.map((church) => [church.id, church]))
    const wanted = new Map<string, () => maplibregl.Marker>()
    const pinFor = (church: ListedChurch) =>
      wanted.set(`pin:${church.id}`, () =>
        pin({ ...church, name: church.longName ?? church.name }, () =>
          show(church, (popup) => popup.setHTML(options.cardHtml(church))),
        ),
      )
    // With no clusters every church in view stands clear and is pinned; with any, the clusters
    // account for all of them, a cluster of one being its church.
    if (view.clusters.length === 0) for (const church of view.churches) pinFor(church)
    for (const cluster of view.clusters) {
      const { church } = cluster
      const known = church && listed.get(church.id)
      if (known) pinFor(known)
      else if (church)
        wanted.set(`pin:${church.id}`, () =>
          pin({ ...cluster, name: church.name }, () => void showCounted(church, cluster)),
        )
      else wanted.set(`count:${cluster.id}`, () => bubble(cluster))
    }
    for (const [key, marker] of markers) {
      if (wanted.has(key)) continue
      marker.remove()
      markers.delete(key)
    }
    for (const [key, make] of wanted) if (!markers.has(key)) markers.set(key, make())
    options.onView(view)
  }

  // Tiles answer one by one: draw once a frame, whatever has come in.
  let frame: number | undefined
  function drawSoon() {
    frame ??= requestAnimationFrame(() => {
      frame = undefined
      draw()
    })
  }

  function ask(path: string) {
    if (asked.has(path)) return
    asked.set(
      path,
      fetch(`${options.api}${path}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status))
          arrived.set(path, (await res.json()) as Tile)
          drawSoon()
        })
        .catch(() => {
          // Forgotten, so the next move over it asks again.
          asked.delete(path)
          options.onError()
        }),
    )
  }

  function refresh() {
    const bbox = bounds()
    const next = planView(bbox)
    plan = next
    for (const cell of next.tiles) ask(tilePath(cell, next.mode, kind))
    draw()
    // Where the next pan will land, asked for once the view itself is on its way.
    for (const cell of ringAround(bbox, next)) ask(tilePath(cell, 'detail'))
  }

  map.on('load', refresh)
  map.on('moveend', refresh)

  return {
    flyTo: (lat, lng, zoom = 13) => map.flyTo({ center: [lng, lat], zoom }),
    centre: () => ({ lat: map.getCenter().lat, lng: map.getCenter().lng }),
    setKind: (next) => {
      kind = next
      card?.remove()
      refresh()
    },
  }
}
