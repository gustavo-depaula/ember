import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { ProseBlock } from '@/components/prayer'
import { Typography } from '@/components/typography'
import { bareId, getEntry, getRememberedManifest } from '@/content/contentIndex'
import type { PracticeManifest } from '@/content/manifestTypes'
import { CollectionTile } from '@/features/collections'
import { CardRow } from '@/features/explore/CardRow'
import { practiceHref } from '@/features/practices/practiceHref'
import { localizeContent } from '@/lib/i18n'
import type { ContentShelf, SaintEntry } from '../data/catalog'
import type { useSaintCollect } from '../useSaintCollect'
import type { useSaintLife } from '../useSaintLife'
import { SaintCardTile } from './SaintCardTile'

const livesBook = 'book/pictorial-lives-of-saints'

/** The life: the Missal's notice, then the chapter of the Pictorial Lives, opened on request. */
export function LifeChapter({
  saint,
  life,
  about,
}: {
  saint: SaintEntry
  life: ReturnType<typeof useSaintLife>
  about: string | undefined
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const book = getEntry(livesBook)?.name

  return (
    <YStack gap="$md">
      {about && (
        <Typography variant="interface" fontSize="$4" lineHeight={30}>
          {about}
        </Typography>
      )}
      {life && <ProseBlock text={{ primary: life.opening }} />}
      {life?.rest &&
        (open ? (
          <ProseBlock text={{ primary: life.rest }} />
        ) : (
          <AnimatedPressable onPress={() => setOpen(true)} accessibilityRole="button">
            <Typography variant="reference" color="$accent" fontSize="$2">
              {t('saints.page.continueLife', { minutes: life.minutes })} ›
            </Typography>
          </AnimatedPressable>
        ))}
      {saint.reflection && (
        <YStack borderLeftWidth={2} borderLeftColor="$accent" paddingLeft="$md">
          <Typography variant="interface" fontStyle="italic" fontSize="$3" lineHeight={27}>
            {saint.reflection}
          </Typography>
        </YStack>
      )}
      {life && book && (
        <Typography variant="caption">
          {t('saints.page.source', { book: localizeContent(book) })}
        </Typography>
      )}
    </YStack>
  )
}

function ShelfTitle({ title, count }: { title: string; count?: number }) {
  return (
    <XStack justifyContent="space-between" alignItems="baseline" paddingTop="$sm">
      <Typography variant="caption" fontSize="$2">
        {title}
      </Typography>
      {count !== undefined && <Typography variant="annotation">{count}</Typography>}
    </XStack>
  )
}

/** Prayers as a list: each row opens its practice. */
export function PrayChapter({ shelves }: { shelves: ContentShelf[] }) {
  return (
    <YStack gap="$sm">
      {shelves.map((shelf) => (
        <YStack key={shelf.title ?? shelf.refs[0]}>
          {shelf.title && <ShelfTitle title={shelf.title} />}
          {shelf.refs.map((ref) => (
            <PrayerRow key={ref} practiceRef={ref} />
          ))}
        </YStack>
      ))}
    </YStack>
  )
}

function PrayerRow({ practiceRef }: { practiceRef: string }) {
  const { t } = useTranslation()
  const router = useRouter()
  const entry = getEntry(practiceRef)
  const id = bareId(practiceRef)
  const manifest = entry ? getRememberedManifest<PracticeManifest>(entry.hash) : undefined
  const name = localizeContent(manifest?.name ?? entry?.name ?? { 'en-US': id })

  return (
    <AnimatedPressable
      onPress={() => router.push(practiceHref(id))}
      accessibilityRole="link"
      accessibilityLabel={name}
    >
      <XStack
        alignItems="center"
        gap="$md"
        paddingVertical="$md"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Typography variant="interface" fontSize="$3" flex={1}>
          {name}
        </Typography>
        {manifest?.estimatedMinutes !== undefined && (
          <Typography variant="annotation">
            {t('saints.page.minutes', { count: manifest.estimatedMinutes })}
          </Typography>
        )}
        <View
          borderWidth={1}
          borderColor="$accent"
          borderRadius={14}
          paddingHorizontal={10}
          paddingVertical={3}
        >
          <Typography
            variant="label"
            fontSize={10}
            letterSpacing={1.5}
            textTransform="uppercase"
            color="$accentHover"
          >
            {t('saints.page.pray')}
          </Typography>
        </View>
      </XStack>
    </AnimatedPressable>
  )
}

const tileWidth = 140
const tileAspect = 10 / 12

/** Readings on shelves, with the collections devoted to the card last. */
export function ReadChapter({
  shelves,
  collections,
}: {
  shelves: ContentShelf[]
  collections: string[]
}) {
  const { t } = useTranslation()
  const all = [
    ...shelves,
    ...(collections.length > 0 ? [{ title: t('saints.page.collections'), refs: collections }] : []),
  ]
  return (
    <YStack gap="$md">
      {all.map((shelf) => (
        <YStack key={shelf.title ?? shelf.refs[0]} gap="$sm">
          {shelf.title && (
            <ShelfTitle
              title={shelf.title}
              count={shelf.refs.length > 1 ? shelf.refs.length : undefined}
            />
          )}
          <CardRow>
            {shelf.refs.map((ref) => (
              <CollectionTile key={ref} item={{ ref }} width={tileWidth} aspectRatio={tileAspect} />
            ))}
          </CardRow>
        </YStack>
      ))}
    </YStack>
  )
}

/** The feast's own prayer: the collect of its Mass. */
export function FeastChapter({
  saint,
  feast,
}: {
  saint: SaintEntry
  feast: NonNullable<ReturnType<typeof useSaintCollect>>
}) {
  return (
    <YStack gap="$md" alignItems="center">
      <Typography variant="reference" textAlign="center">
        {[saint.feastLabel, feast.title].filter(Boolean).join(' · ')}
      </Typography>
      <YStack>
        {feast.lines.map((line) => (
          <Typography key={line} variant="rubric" fontSize="$3" lineHeight={28} textAlign="center">
            {line}
          </Typography>
        ))}
      </YStack>
    </YStack>
  )
}

const relatedWidth = 112

/** The other cards about the same person, event or devotion. */
export function CardsChapter({
  cards,
  onOpenCard,
}: {
  cards: SaintEntry[]
  onOpenCard: (id: string) => void
}) {
  return (
    <CardRow>
      {cards.map((card) => (
        <AnimatedPressable
          key={card.id}
          onPress={() => onOpenCard(card.id)}
          accessibilityRole="link"
          accessibilityLabel={card.name}
        >
          <YStack width={relatedWidth} gap="$xs">
            <SaintCardTile saint={card} width={relatedWidth} />
            <Typography variant="interface" fontSize="$1" lineHeight={18}>
              {card.name}
            </Typography>
            {card.patronOf && (
              <Typography variant="caption" fontSize={13} lineHeight={16}>
                {card.patronOf}
              </Typography>
            )}
          </YStack>
        </AnimatedPressable>
      ))}
    </CardRow>
  )
}
