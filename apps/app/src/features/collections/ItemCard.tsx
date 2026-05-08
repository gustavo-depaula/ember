/**
 * One row in a collection — a tappable card that resolves a kind-prefixed
 * corpus ref to its destination route. Visual matches the cards used on the
 * legacy kind-grouped collection screen so the migration doesn't visually
 * regress; only the grouping changes. Annotations (rubric, indulgence,
 * attribution, context, recommended time) render below the title.
 */

import { useRouter } from 'expo-router'
import { Book, BookOpen } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getEntry, getRememberedManifest } from '@/content/contentIndex'
import type {
  BookEntry,
  CatalogEntry,
  ChapterManifest,
  CollectionItem,
  PracticeManifest,
  PrayerItemManifest,
} from '@/content/manifestTypes'
import { useAllSlots } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'

import { AnnotationRow } from './AnnotationRow'
import { SeeAlsoChips } from './SeeAlsoChips'

function bareId(corpusId: string): string {
  const slash = corpusId.indexOf('/')
  return slash === -1 ? corpusId : corpusId.slice(slash + 1)
}

export function ItemCard({
  item,
  onOpenPrayer,
  onSeeAlsoTap,
}: {
  item: CollectionItem
  onOpenPrayer: (prayerId: string) => void
  onSeeAlsoTap: (ref: string) => void
}) {
  const router = useRouter()
  const theme = useTheme()
  const { t } = useTranslation()
  const allSlots = useAllSlots()
  const entry: CatalogEntry | undefined = getEntry(item.ref)

  if (!entry) {
    return (
      <UnresolvedCard label={item.label ? localizeContent(item.label) : item.ref} ref_={item.ref} />
    )
  }

  const id = bareId(item.ref)

  if (entry.kind === 'chapter') {
    const body = getRememberedManifest<ChapterManifest>(entry.hash)
    const title = item.label ?? body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }
    return (
      <Row
        accessibilityLabel={localizeContent(title)}
        onPress={() =>
          router.push({ pathname: '/browse/chapters/[chapterId]', params: { chapterId: id } })
        }
        leading={<BookOpen size={22} color={theme.colorSecondary?.val} />}
      >
        <CardBody
          title={localizeContent(title)}
          annotation={item.annotation}
          seeAlso={item.seeAlso}
          onSeeAlsoTap={onSeeAlsoTap}
        />
      </Row>
    )
  }

  if (entry.kind === 'book') {
    const body = getRememberedManifest<BookEntry>(entry.hash)
    const name = item.label ?? body?.name ?? entry.name ?? { 'en-US': id }
    const author = body?.author ?? entry.author
    return (
      <Row
        accessibilityLabel={localizeContent(name)}
        onPress={() => router.push({ pathname: '/browse/book/[bookId]', params: { bookId: id } })}
        leading={<Book size={22} color={theme.accent?.val} />}
      >
        <CardBody
          title={localizeContent(name)}
          subtitle={author ? localizeContent(author) : undefined}
          annotation={item.annotation}
          seeAlso={item.seeAlso}
          onSeeAlsoTap={onSeeAlsoTap}
        />
      </Row>
    )
  }

  if (entry.kind === 'practice') {
    const body = getRememberedManifest<PracticeManifest>(entry.hash)
    const name = item.label ?? body?.name ?? entry.name ?? { 'en-US': id }
    const icon = body?.icon ?? entry.icon ?? 'prayer'
    const inPlan = allSlots.some((s) => s.enabled && s.practice_id === id)
    return (
      <Row
        accessibilityLabel={localizeContent(name)}
        onPress={() =>
          router.push({ pathname: '/practices/[manifestId]', params: { manifestId: id } })
        }
        leading={<PracticeIcon name={icon} size={22} />}
        trailing={
          inPlan ? (
            <Text fontFamily="$body" fontSize="$1" color="$accent">
              {t('catalog.alreadyInPlan')}
            </Text>
          ) : undefined
        }
      >
        <CardBody
          title={localizeContent(name)}
          annotation={item.annotation}
          seeAlso={item.seeAlso}
          onSeeAlsoTap={onSeeAlsoTap}
        />
      </Row>
    )
  }

  if (entry.kind === 'prayer') {
    const body = getRememberedManifest<PrayerItemManifest>(entry.hash)
    const title = item.label ?? body?.title ?? entry.title ?? entry.name ?? { 'en-US': id }
    return (
      <Row accessibilityLabel={localizeContent(title)} onPress={() => onOpenPrayer(id)}>
        <CardBody
          title={localizeContent(title)}
          annotation={item.annotation}
          seeAlso={item.seeAlso}
          onSeeAlsoTap={onSeeAlsoTap}
        />
      </Row>
    )
  }

  // Other kinds (collection, mass, of-*, checkup) aren't expected as collection
  // items, but render a neutral card if they appear.
  return (
    <UnresolvedCard label={item.label ? localizeContent(item.label) : entry.kind} ref_={item.ref} />
  )
}

function CardBody({
  title,
  subtitle,
  annotation,
  seeAlso,
  onSeeAlsoTap,
}: {
  title: string
  subtitle?: string
  annotation?: CollectionItem['annotation']
  seeAlso?: string[]
  onSeeAlsoTap?: (ref: string) => void
}) {
  return (
    <YStack flex={1} gap={2}>
      <Text fontFamily="$body" fontSize="$2" color="$color">
        {title}
      </Text>
      {subtitle && (
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {subtitle}
        </Text>
      )}
      <AnnotationRow annotation={annotation} />
      {seeAlso && seeAlso.length > 0 && onSeeAlsoTap && (
        <SeeAlsoChips refs={seeAlso} onTap={onSeeAlsoTap} />
      )}
    </YStack>
  )
}

function Row({
  children,
  leading,
  trailing,
  accessibilityLabel,
  onPress,
}: {
  children: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  accessibilityLabel: string
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel}
    >
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$md"
        padding="$sm"
        paddingHorizontal="$md"
        gap="$md"
        alignItems="center"
        borderWidth={1}
        borderColor="$borderColor"
      >
        {leading}
        {children}
        {trailing}
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          ›
        </Text>
      </XStack>
    </AnimatedPressable>
  )
}

function UnresolvedCard({ label, ref_ }: { label: string; ref_: string }) {
  return (
    <XStack
      backgroundColor="$backgroundSurface"
      borderRadius="$md"
      padding="$sm"
      paddingHorizontal="$md"
      gap="$md"
      alignItems="center"
      borderWidth={1}
      borderColor="$borderColor"
      opacity={0.5}
    >
      <YStack flex={1}>
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
          {label}
        </Text>
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
          {ref_}
        </Text>
      </YStack>
    </XStack>
  )
}
