import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft, ChevronsDownUp, ChevronsUpDown } from 'lucide-react-native'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, type View } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type {
  CollectionBlock,
  CollectionItemManifest,
  CollectionSection,
} from '@/content/manifestTypes'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { CollectionProse, collapseKey, SectionList, useCollapseStore } from '@/features/collections'
import { PinToggle } from '@/features/pinning/PinToggle'
import { PrayerModal } from '@/features/practices/components'
import { localizeContent } from '@/lib/i18n'

function collectSectionKeys(
  collectionId: string,
  sections: CollectionSection[] | undefined,
): { key: string; defaultCollapsed: boolean }[] {
  const out: { key: string; defaultCollapsed: boolean }[] = []
  function walk(secs: CollectionSection[] | undefined): void {
    if (!secs) return
    for (const s of secs) {
      out.push({
        key: collapseKey(collectionId, s.id),
        defaultCollapsed: s.defaultCollapsed ?? false,
      })
      const nested: CollectionSection[] = []
      for (const b of s.blocks) {
        if (b.kind === 'section') nested.push(b)
      }
      walk(nested)
    }
  }
  walk(sections)
  return out
}

function countLeafItems(blocks: CollectionBlock[] | undefined): number {
  if (!blocks) return 0
  let n = 0
  for (const b of blocks) {
    if (b.kind === 'item') n++
    else if (b.kind === 'section') n += countLeafItems(b.blocks)
  }
  return n
}

/**
 * Find the chain of section ids that lead to a target item ref.
 * Returns undefined if the ref is not in this collection.
 */
function findRefAncestors(
  sections: CollectionSection[] | undefined,
  targetRef: string,
): string[] | undefined {
  if (!sections) return undefined
  function walk(secs: CollectionSection[], path: string[]): string[] | undefined {
    for (const s of secs) {
      const here = [...path, s.id]
      for (const b of s.blocks) {
        if (b.kind === 'item' && b.ref === targetRef) return here
        if (b.kind === 'section') {
          const found = walk([b], here)
          if (found) return found
        }
      }
    }
    return undefined
  }
  return walk(sections, [])
}

export default function CollectionDetailScreen() {
  const { collectionId: bareId } = useLocalSearchParams<{ collectionId: string }>()
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const catalogVersion = useCatalogVersion()
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | undefined>()

  const collectionId = `collection/${bareId}`
  const collectionEntry = getEntry(collectionId)

  const hydrate = useCollapseStore((s) => s.hydrate)
  const collapseHydrated = useCollapseStore((s) => s.hydrated)
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // biome-ignore lint/correctness/useExhaustiveDependencies: catalogVersion drives re-derivation as deferred manifests warm.
  const manifest = useMemo<CollectionItemManifest | undefined>(() => {
    if (!collectionEntry) return undefined
    return getRememberedManifest<CollectionItemManifest>(collectionEntry.hash)
  }, [collectionEntry, catalogVersion])

  const sections = manifest?.sections
  const sectionKeys = useMemo(
    () => collectSectionKeys(collectionId, sections),
    [collectionId, sections],
  )

  const allExpanded = useCollapseStore((s) => {
    if (!collapseHydrated) return true
    if (sectionKeys.length === 0) return true
    return sectionKeys.every(({ key, defaultCollapsed }) => !s.isCollapsed(key, defaultCollapsed))
  })
  const setMany = useCollapseStore((s) => s.setMany)

  // For see-also same-collection scroll: keep a map from ref → DOM node so we
  // can scrollIntoView once any ancestor sections have been expanded.
  const itemNodes = useRef<Map<string, View>>(new Map())
  const registerItemRef = useCallback((ref: string, node: View | null) => {
    if (node) itemNodes.current.set(ref, node)
    else itemNodes.current.delete(ref)
  }, [])

  const handleSeeAlsoTap = useCallback(
    (ref: string) => {
      // Same-collection: expand ancestors then scroll into view
      const ancestors = findRefAncestors(sections, ref)
      if (ancestors) {
        setMany(ancestors.map((sid) => ({ key: collapseKey(collectionId, sid), collapsed: false })))
        // Wait a frame for the collapsed sections to render before scrolling.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const node = itemNodes.current.get(ref)
            // RN-Web exposes the underlying HTMLElement on the View ref.
            const dom = node as unknown as {
              scrollIntoView?: (opts?: ScrollIntoViewOptions) => void
            }
            dom?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
          })
        })
        return
      }

      // Cross-collection / outside this collection: route to standard destination.
      const slash = ref.indexOf('/')
      if (slash < 0) return
      const kind = ref.slice(0, slash)
      const id = ref.slice(slash + 1)
      if (kind === 'prayer') setSelectedPrayerId(id)
      else if (kind === 'practice')
        router.push({ pathname: '/practices/[manifestId]', params: { manifestId: id } })
      else if (kind === 'chapter')
        router.push({ pathname: '/browse/chapters/[chapterId]', params: { chapterId: id } })
      else if (kind === 'book')
        router.push({ pathname: '/browse/book/[bookId]', params: { bookId: id } })
      else if (kind === 'collection')
        router.push({ pathname: '/browse/[collectionId]', params: { collectionId: id } })
    },
    [collectionId, sections, setMany, router],
  )

  if (!collectionEntry) {
    return (
      <ScreenLayout>
        <YStack padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            {t('browse.collectionNotFound')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const name = collectionEntry.name ? localizeContent(collectionEntry.name) : (bareId ?? '')
  const description = collectionEntry.description
    ? localizeContent(collectionEntry.description)
    : undefined
  const totalCount = sections ? countLeafItems(sections.flatMap((s) => s.blocks)) : 0

  function handleToggleAll() {
    setMany(sectionKeys.map(({ key }) => ({ key, collapsed: allExpanded })))
  }

  return (
    <YStack flex={1}>
      <ScreenLayout>
        <YStack gap="$lg" paddingVertical="$lg">
          <XStack alignItems="center" gap="$md">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
              <ChevronLeft size={24} color={theme.color?.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$5" color="$color">
                {name}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                {totalCount} {t('browse.items')}
              </Text>
            </YStack>
            {sectionKeys.length > 0 && (
              <Pressable
                onPress={handleToggleAll}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={allExpanded ? t('browse.collapseAll') : t('browse.expandAll')}
              >
                {allExpanded ? (
                  <ChevronsDownUp size={20} color={theme.colorSecondary?.val} />
                ) : (
                  <ChevronsUpDown size={20} color={theme.colorSecondary?.val} />
                )}
              </Pressable>
            )}
          </XStack>

          {description && (
            <Text fontFamily="$body" fontSize="$3" color="$colorSecondary">
              {description}
            </Text>
          )}

          <XStack>
            <PinToggle itemId={collectionId} />
          </XStack>

          {manifest?.prologue && <CollectionProse prose={manifest.prologue} />}

          {sections && sections.length > 0 && (
            <SectionList
              collectionId={collectionId}
              sections={sections}
              onOpenPrayer={setSelectedPrayerId}
              onSeeAlsoTap={handleSeeAlsoTap}
              registerItemRef={registerItemRef}
            />
          )}
        </YStack>
      </ScreenLayout>

      <PrayerModal prayerId={selectedPrayerId} onClose={() => setSelectedPrayerId(undefined)} />
    </YStack>
  )
}
