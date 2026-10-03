import {
  Camera,
  type CameraRef,
  type FilterSpecification,
  GeoJSONSource,
  Images,
  Layer,
  Map as MapView,
  UserLocation,
  type ViewStateChangeEvent,
} from '@maplibre/maplibre-react-native'
import { LocateFixed } from 'lucide-react-native'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type NativeSyntheticEvent, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName } from 'tamagui'
import { AnimatedPressable, GlassSurface } from '@/components'
import type { Cluster } from '@/lib/mass-times'
import { useFavoritesStore } from '../favorites'
import type { MassTimesNearby } from '../useMassTimesNearby'
import { clusterPrefix, pinColor } from './mapPins'
import type { CameraIdle, CameraPosition, MapHandle, PinnedChurch } from './NativeChurchesMap'

// Google Maps on Android wants an API key tied to a billing account; MapLibre
// over OpenFreeMap's OpenStreetMap tiles needs neither, so the map works in any
// build as it is.
const lightStyle = 'https://tiles.openfreemap.org/styles/liberty'
const darkStyle = 'https://tiles.openfreemap.org/styles/dark'

// The rest of the feature counts zoom the Apple/Google way, on 256px tiles.
// MapLibre's are 512px, so the same view is one level lower.
const zoomOffset = 1
const userZoom = 14
const cameraMs = 600

// Named apart from the map style's own sprite, which has a `cross` of its own.
const pinIcons = {
  'ember-cross': require('../../../../assets/map/pin-cross.png'),
  'ember-heart': require('../../../../assets/map/pin-heart.png'),
}

// A tap lands on a pin within this many points of it — a 12pt disc alone is
// too small a target for a finger.
const pinHitbox = { top: 14, right: 14, bottom: 14, left: 14 }

/** The Mass Times map on Android: the same pins, clusters and camera contract as the iOS map. */
const NativeChurchesMap = forwardRef<
  MapHandle,
  {
    nearby: MassTimesNearby
    initialCamera: CameraPosition
    onSelect: (church: PinnedChurch) => void
    onCluster: (cluster: Cluster) => void
    onDeselect?: () => void
    onCameraIdle?: (camera: CameraIdle) => void
  }
>(function NativeChurchesMap(
  { nearby, initialCamera, onSelect, onCluster, onDeselect, onCameraIdle },
  ref,
) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const insets = useSafeAreaInsets()
  const accent = theme.accent.val
  const favoriteTint = theme.colorBurgundy?.val ?? accent
  const { churches, clusters, location } = nearby
  const favorites = useFavoritesStore((s) => s.favorites)

  const cameraRef = useRef<CameraRef>(null)
  const [selectedId, setSelectedId] = useState('')

  const moveCamera = useCallback(
    (camera: CameraPosition) =>
      cameraRef.current?.easeTo({
        center: [camera.coordinates.longitude, camera.coordinates.latitude],
        zoom: camera.zoom - zoomOffset,
        duration: cameraMs,
      }),
    [],
  )

  useImperativeHandle(
    ref,
    () => ({
      setCameraPosition: moveCamera,
      select: setSelectedId,
      deselect: () => setSelectedId(''),
    }),
    [moveCamera],
  )

  // Zoomed out, the clusters cover every church in view (a one-church cluster stands in for its
  // church); otherwise every church in view is its own pin.
  const pins = useMemo<PinnedChurch[]>(() => {
    if (clusters.length === 0)
      return (churches ?? []).map(({ id, name, lat, lng }) => ({ id, name, lat, lng }))
    return clusters.flatMap((c) => (c.church ? [{ ...c.church, lat: c.lat, lng: c.lng }] : []))
  }, [churches, clusters])
  const groups = useMemo(() => clusters.filter((c) => !c.church), [clusters])
  const pinsById = useMemo(() => new Map(pins.map((p) => [p.id, p])), [pins])
  const groupsById = useMemo(() => new Map(groups.map((g) => [clusterPrefix + g.id, g])), [groups])

  // A cross for the directory in a name-hashed jewel tone, a heart for saved ones, a count for a
  // cluster — drawn as map layers, which stay smooth with a hundred pins where views would not.
  const features = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: [
        ...pins.map((p) => {
          const isFavorite = Boolean(favorites[p.id])
          return {
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
            properties: {
              id: p.id,
              icon: isFavorite ? 'ember-heart' : 'ember-cross',
              color: isFavorite ? favoriteTint : pinColor(p.name),
            },
          }
        }),
        ...groups.map((g) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [g.lng, g.lat] },
          properties: {
            id: clusterPrefix + g.id,
            count: g.count > 99 ? '99+' : String(g.count),
          },
        })),
      ],
    }),
    [pins, groups, favorites, favoriteTint],
  )

  const handleRegion = (e: NativeSyntheticEvent<ViewStateChangeEvent>) => {
    const { center, zoom, bounds } = e.nativeEvent
    const [west, south, east, north] = bounds
    onCameraIdle?.({
      latitude: center[1],
      longitude: center[0],
      latitudeDelta: north - south,
      longitudeDelta: east - west,
      zoom: zoom + zoomOffset,
    })
  }

  const isSelected: FilterSpecification = ['==', ['get', 'id'], selectedId]

  return (
    <View style={styles.fill}>
      <MapView
        style={styles.fill}
        mapStyle={isDark ? darkStyle : lightStyle}
        logo={false}
        // OpenStreetMap's licence asks for the credit; the sheet covers the bottom edge, so it sits
        // beside the back button.
        attribution
        attributionPosition={{ top: insets.top + 18, left: 72 }}
        compass
        compassPosition={{ top: insets.top + 64, right: 14 }}
        touchPitch={false}
        onPress={onDeselect}
        onRegionDidChange={handleRegion}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: [initialCamera.coordinates.longitude, initialCamera.coordinates.latitude],
            zoom: initialCamera.zoom - zoomOffset,
          }}
        />
        <Images images={pinIcons} />
        {location.status === 'granted' && <UserLocation />}
        <GeoJSONSource
          id="churches"
          data={features}
          hitbox={pinHitbox}
          onPress={(e) => {
            // The press also reaches the map, which would read it as a tap on empty ground.
            e.stopPropagation()
            const id = e.nativeEvent.features[0]?.properties?.id as string | undefined
            if (!id) return
            const group = groupsById.get(id)
            if (group) return onCluster(group)
            const pin = pinsById.get(id)
            if (pin) onSelect(pin)
          }}
        >
          <Layer
            id="church-clusters"
            type="circle"
            filter={['has', 'count']}
            paint={{
              'circle-radius': 17,
              'circle-color': accent,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2,
            }}
          />
          <Layer
            id="church-cluster-counts"
            type="symbol"
            filter={['has', 'count']}
            layout={{
              'text-field': ['get', 'count'],
              'text-font': ['Noto Sans Bold'],
              'text-size': 13,
              'text-allow-overlap': true,
            }}
            paint={{ 'text-color': '#FFFFFF' }}
          />
          <Layer
            id="church-pins"
            type="circle"
            filter={['!', ['has', 'count']]}
            paint={{
              'circle-radius': ['case', isSelected, 17, 12],
              'circle-color': ['get', 'color'],
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': ['case', isSelected, 3, 2],
            }}
          />
          <Layer
            id="church-pin-icons"
            type="symbol"
            filter={['!', ['has', 'count']]}
            layout={{
              'icon-image': ['get', 'icon'],
              'icon-size': ['case', isSelected, 0.8, 0.58],
              'icon-allow-overlap': true,
            }}
          />
        </GeoJSONSource>
      </MapView>

      {location.status === 'granted' && (
        <View style={[styles.locate, { top: insets.top + 8 }]}>
          <AnimatedPressable
            onPress={() =>
              moveCamera({
                coordinates: { latitude: location.coords.lat, longitude: location.coords.lng },
                zoom: userZoom,
              })
            }
            accessibilityRole="button"
            accessibilityLabel={t('a11y.recenterMap')}
          >
            <GlassSurface isDark={isDark} style={styles.locateDisc}>
              <LocateFixed size={20} color={theme.colorSecondary?.val} />
            </GlassSurface>
          </AnimatedPressable>
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  fill: { flex: 1 },
  locate: { position: 'absolute', right: 12 },
  locateDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default NativeChurchesMap
