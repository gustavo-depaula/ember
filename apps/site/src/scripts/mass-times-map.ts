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
    for (const church of view.churches) {
      const pin = document.createElement('a')
      pin.className = 'map-pin'
      pin.href = options.churchHref(church.id)
      pin.title = church.longName ?? church.name
      pin.style.background = pinColor(church.name)
      pin.textContent = '✝'
      markers.push(
        new maplibregl.Marker({ element: pin }).setLngLat([church.lng, church.lat]).addTo(map),
      )
    }
    for (const cluster of view.clusters) {
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
      void refresh()
    },
  }
}
