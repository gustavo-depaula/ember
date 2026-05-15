/**
 * Small tappable chips below an item card for cross-references.
 * Resolves each ref through the catalog to display a label; falls back to
 * the kind-prefixed id when the catalog hasn't warmed.
 *
 * Tap behavior is delegated to the parent — same-collection refs scroll
 * within the screen (parent expands collapsed ancestors first); cross-
 * collection refs route normally.
 */

import { Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'

import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { BookEntry, ChapterManifest, PracticeManifest } from '@/content/manifestTypes'
import { localizeContent } from '@/lib/i18n'

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

function resolveLabel(ref: string): string {
  const entry = getEntry(ref)
  if (!entry) return ref
  const id = bareId(ref)
  if (entry.kind === 'practice') {
    const body = getRememberedManifest<PracticeManifest>(entry.hash)
    const name = body?.name ?? entry.name ?? { 'en-US': id }
    return localizeContent(name)
  }
  if (entry.kind === 'chapter') {
    const body = getRememberedManifest<ChapterManifest>(entry.hash)
    const title = body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }
    return localizeContent(title)
  }
  if (entry.kind === 'book') {
    const body = getRememberedManifest<BookEntry>(entry.hash)
    const name = body?.name ?? entry.name ?? { 'en-US': id }
    return localizeContent(name)
  }
  return id
}

export function SeeAlsoChips({ refs, onTap }: { refs: string[]; onTap: (ref: string) => void }) {
  if (refs.length === 0) return null
  return (
    <XStack flexWrap="wrap" gap="$xs" paddingTop="$xs">
      {refs.map((ref) => (
        <Pressable
          key={ref}
          onPress={() => onTap(ref)}
          accessibilityRole="link"
          accessibilityLabel={resolveLabel(ref)}
        >
          <XStack
            backgroundColor="$backgroundSurface"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius={999}
            paddingHorizontal="$sm"
            paddingVertical={2}
          >
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              {resolveLabel(ref)}
            </Text>
          </XStack>
        </Pressable>
      ))}
    </XStack>
  )
}
