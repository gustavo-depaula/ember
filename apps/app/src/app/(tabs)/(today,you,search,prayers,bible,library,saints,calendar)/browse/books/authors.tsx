import { Stack, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable, PageHeader, ScreenLayout } from '@/components'
import { Typography } from '@/components/typography'
import {
  AuthorFace,
  AuthorTile,
  roman,
  type ShelfAuthor,
  ShelfLabel,
  ShelfTabs,
  sortName,
  useShelf,
} from '@/features/books/shelf'

type View = 'century' | 'alphabetical'

/** The authors as faces in time, century by century, or as a directory from A to Z. */
export default function AuthorsScreen() {
  const { t } = useTranslation()
  const shelf = useShelf()
  const [view, setView] = useState<View>('century')

  const centuries = useMemo(() => {
    const byCentury = new Map<number, ShelfAuthor[]>()
    const undated: ShelfAuthor[] = []
    for (const author of shelf.authors) {
      if (!author.century) {
        undated.push(author)
        continue
      }
      const list = byCentury.get(author.century)
      if (list) list.push(author)
      else byCentury.set(author.century, [author])
    }
    const groups = [...byCentury]
      .sort(([a], [b]) => a - b)
      .map(([century, authors]) => ({
        key: String(century),
        label: t('shelf.century', { range: roman(century) }),
        authors: authors.sort((a, b) => b.books.length - a.books.length),
      }))
    return undated.length > 0
      ? [...groups, { key: 'undated', label: t('shelf.noCentury'), authors: undated }]
      : groups
  }, [shelf.authors, t])

  const alphabetical = useMemo(
    () => [...shelf.authors].sort((a, b) => sortName(a.name).localeCompare(sortName(b.name))),
    [shelf.authors],
  )

  return (
    <ScreenLayout measure="wide">
      <Stack.Screen options={{ title: t('shelf.authors') }} />
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('shelf.authors')} />
        <ShelfTabs
          options={[
            { value: 'century', label: t('shelf.byCentury') },
            { value: 'alphabetical', label: t('shelf.alphabetical') },
          ]}
          value={view}
          onChange={setView}
        />
        {view === 'century'
          ? centuries.map((group) => (
              <YStack key={group.key} gap="$sm">
                <ShelfLabel>{group.label}</ShelfLabel>
                <XStack flexWrap="wrap" columnGap="$sm" rowGap="$md">
                  {group.authors.map((author) => (
                    <AuthorTile key={author.id} author={author} />
                  ))}
                </XStack>
              </YStack>
            ))
          : alphabetical.map((author) => <AuthorLine key={author.id} author={author} />)}
      </YStack>
    </ScreenLayout>
  )
}

function AuthorLine({ author }: { author: ShelfAuthor }) {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <AnimatedPressable
      onPress={() =>
        router.push({
          pathname: '/browse/books/author/[authorId]',
          params: { authorId: author.id },
        })
      }
      accessibilityRole="link"
      accessibilityLabel={t('a11y.openShelfItem', { name: author.name })}
    >
      <XStack gap="$md" alignItems="center" minHeight={52}>
        <AuthorFace author={author} size={40} />
        <YStack flex={1}>
          <Typography fontSize="$3">{author.name}</Typography>
          <Typography variant="caption">
            {[
              author.century ? t('shelf.century', { range: roman(author.century) }) : undefined,
              t('shelf.works', { count: author.books.length }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </YStack>
      </XStack>
    </AnimatedPressable>
  )
}
