// PROTOTYPE — throwaway. Three variants of the edition picker on the book page,
// switchable via `?variant=A|B|C` (and `?offer=1` to force the "also in your
// language" line). Answers: what should choosing an edition look like?
import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, useWindowDimensions } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import { editionsOfWork, getBookCatalogEntry, loadBooks, getResidentBook } from '@/content/books'
import { BookCover, bookCoverFormat } from '@/features/covers'
import { toneByIndex, toneIndexForId } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'

type Edition = { bookId: string; lang: string; by: string; year?: number | string; from?: string; current: boolean }

function useEditions(bookRef: string, lang: string): Edition[] {
  const ids = editionsOfWork(bookRef)
  const { data } = useQuery({
    queryKey: ['prototype-editions', ...ids],
    queryFn: async () => {
      await loadBooks(ids)
      return ids
    },
  })
  return (data ?? []).flatMap((id) => {
    const book = getResidentBook(id)
    const langs = book?.languages ?? getBookCatalogEntry(id)?.langs ?? []
    return langs.map((l) => {
      const e = book?.editions?.[l]
      return {
        bookId: id.replace(/^book\//, ''),
        lang: l,
        by: e?.translator ?? e?.editor ?? '—',
        year: e?.year,
        from: e?.from,
        current: id === bookRef && l === lang,
      }
    })
  })
}

function useLabel() {
  const { t } = useTranslation()
  const language = (l: string) => t(`languages.${l}`, { defaultValue: l })
  return (e: Edition) =>
    e.from
      ? `${language(e.lang)} · tradução ${e.by}, do ${t('languages.' + e.from).toLowerCase()}`
      : `${language(e.lang)} · ${e.by}${e.year ? `, ${e.year}` : ''}`
}

function useOpen() {
  const router = useRouter()
  return (e: Edition) => router.replace(`/browse/book/${e.bookId}?variant=${variantParam}` as never)
}
let variantParam = 'A'

/** "Também em português ›" — the named book doesn't read in your language, another edition does. */
export function OfferLine({ bookRef, lang, force }: { bookRef: string; lang: string; force: boolean }) {
  const editions = useEditions(bookRef, lang)
  const open = useOpen()
  const label = useLabel()
  const mine = editions.find((e) => e.lang === lang && !e.current)
  const reads = editions.some((e) => e.current)
  if (!mine || (reads && !force)) return null
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={label(mine)} onPress={() => open(mine)}>
      <Typography variant="interface" color="$accent" textAlign="left">
        Também em português › <Typography variant="label" color="$colorSecondary">({label(mine)})</Typography>
      </Typography>
    </Pressable>
  )
}

/** A — a quiet line naming this edition; "Outras edições (n) ›" opens a sheet. */
function VariantA({ editions, sheet }: { editions: Edition[]; sheet: boolean }) {
  const [open, setOpen] = useState(false)
  // The native sheet ignores an index it mounts with; open it once it's up.
  useEffect(() => {
    if (!sheet) return
    const id = setTimeout(() => setOpen(true), 1200)
    return () => clearTimeout(id)
  }, [sheet])
  const theme = useTheme()
  const label = useLabel()
  const go = useOpen()
  const current = editions.find((e) => e.current)
  const others = editions.filter((e) => !e.current)
  return (
    <YStack gap="$xs">
      {current && (
        <Typography variant="interface" tone="muted" textAlign="left">
          {label(current)}
        </Typography>
      )}
      {others.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="Outras edições" onPress={() => setOpen(true)}>
          <Typography variant="interface" color="$accent" textAlign="left">
            Outras edições ({others.length}) ›
          </Typography>
        </Pressable>
      )}
      <BottomSheet
        index={open ? 0 : -1}
        snapPoints={['45%']}
        enablePanDownToClose
        onClose={() => setOpen(false)}
        backgroundStyle={{ backgroundColor: theme.background?.val }}
      >
        <YStack padding="$lg" gap="$md">
          <Typography variant="screen-title" textAlign="left">
            Edições
          </Typography>
          {editions.map((e) => (
            <Pressable
              key={e.bookId + e.lang}
              accessibilityRole="button"
              accessibilityLabel={label(e)}
              onPress={() => {
                setOpen(false)
                go(e)
              }}
            >
              <XStack justifyContent="space-between" paddingVertical="$sm">
                <Typography variant="interface" textAlign="left">
                  {label(e)}
                </Typography>
                {e.current && <Typography color="$accent">✓</Typography>}
              </XStack>
            </Pressable>
          ))}
        </YStack>
      </BottomSheet>
    </YStack>
  )
}

/** B — every edition as a label in one row; the current one underlined. */
function VariantB({ editions }: { editions: Edition[] }) {
  const go = useOpen()
  const { t } = useTranslation()
  return (
    <XStack flexWrap="wrap" columnGap="$lg" rowGap="$sm">
      {editions.map((e) => (
        <Pressable key={e.bookId + e.lang} accessibilityRole="tab" accessibilityLabel={e.by} onPress={() => go(e)}>
          <YStack>
            <Typography variant="label" color={e.current ? '$color' : '$colorSecondary'}>
              {t(`languages.${e.lang}`)} · {e.by.split(',')[0]}
            </Typography>
            <YStack height={2} marginTop={4} backgroundColor={e.current ? '$accent' : 'transparent'} />
          </YStack>
        </Pressable>
      ))}
    </XStack>
  )
}

/** C — an "Edições" section above the contents, one row per edition, like the TOC rows. */
function VariantC({ editions }: { editions: Edition[] }) {
  const go = useOpen()
  const label = useLabel()
  return (
    <YStack gap="$xs">
      <XStack alignItems="center" gap="$sm">
        <Typography fontSize="$1">✦</Typography>
        <Typography variant="screen-title" fontSize="$4" textAlign="left">
          Edições
        </Typography>
      </XStack>
      {editions.map((e) => (
        <Pressable key={e.bookId + e.lang} accessibilityRole="button" accessibilityLabel={label(e)} onPress={() => go(e)}>
          <XStack
            justifyContent="space-between"
            paddingVertical="$sm"
            borderBottomWidth={1}
            borderColor="$borderColor"
          >
            <Typography variant="interface" textAlign="left" color={e.current ? '$color' : '$colorSecondary'}>
              {label(e)}
            </Typography>
            <Typography color="$accent">{e.current ? '✓' : '›'}</Typography>
          </XStack>
        </Pressable>
      ))}
    </YStack>
  )
}

export { useEditions, useLabel, useOpen }

export function EditionPickerPrototype({
  bookRef,
  lang,
  variant,
  offer,
  sheet = false,
}: {
  bookRef: string
  lang: string
  variant: string
  offer: boolean
  sheet?: boolean
}) {
  variantParam = variant
  const editions = useEditions(bookRef, lang)
  const router = useRouter()
  if (!__DEV__) return null
  const keys = ['A', 'B', 'C', 'D', 'E', 'F']
  const i = keys.indexOf(variant)
  const step = (d: number) => router.setParams({ variant: keys[(i + d + keys.length) % keys.length] })
  return (
    <YStack gap="$md">
      <OfferLine bookRef={bookRef} lang={lang} force={offer} />
      {editions.length > 1 && variant === 'A' && <VariantA editions={editions} sheet={sheet} />}
      {editions.length > 1 && variant === 'B' && <VariantB editions={editions} />}
      {editions.length > 1 && variant === 'C' && <VariantC editions={editions} />}
      <XStack
        alignSelf="center"
        gap="$md"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderRadius={999}
        backgroundColor="#111"
      >
        <Pressable accessibilityRole="button" accessibilityLabel="previous variant" onPress={() => step(-1)}>
          <Typography color="#fff">‹</Typography>
        </Pressable>
        <Typography color="#fff" fontSize="$1">
          prototype {variant} ({{ A: 'line + sheet', B: 'tab row', C: 'section', D: 'swipe covers', E: 'title-page line', F: 'shelf' }[variant]})
        </Typography>
        <Pressable accessibilityRole="button" accessibilityLabel="next variant" onPress={() => step(1)}>
          <Typography color="#fff">›</Typography>
        </Pressable>
      </XStack>
    </YStack>
  )
}

/** The cover an edition shows: its book's cover, titled in the edition's language. */
function EditionCover({ e, width }: { e: Edition; width: number }) {
  const entry = getBookCatalogEntry(e.bookId)
  const name = (entry?.name as Record<string, string> | undefined)?.[e.lang] ?? localizeContent(entry?.name ?? {})
  const author = (entry?.author as Record<string, string> | undefined)?.[e.lang] ?? localizeContent(entry?.author ?? {})
  return (
    <BookCover
      title={name}
      author={author}
      tone={toneByIndex(toneIndexForId(`book/${e.bookId}`))}
      format={bookCoverFormat(entry?.cover)}
      width={width}
    />
  )
}

/** D — the hero's cover pages sideways through the editions; each carries its credit. */
export function HeroCovers({
  bookRef,
  lang,
  width,
  page: shown,
}: {
  bookRef: string
  lang: string
  width: number
  page?: number
}) {
  const editions = useEditions(bookRef, lang)
  const go = useOpen()
  const label = useLabel()
  const { width: page } = useWindowDimensions()
  const start = shown ?? Math.max(0, editions.findIndex((e) => e.current))
  if (editions.length < 2) return null
  return (
    <YStack width={page} alignItems="center">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: start * page, y: 0 }}
        onMomentumScrollEnd={(ev) => {
          const i = Math.round(ev.nativeEvent.contentOffset.x / page)
          const e = editions[i]
          if (e && !e.current) go(e)
        }}
      >
        {editions.map((e) => (
          <YStack key={e.bookId + e.lang} width={page} alignItems="center" gap="$sm">
            <EditionCover e={e} width={width} />
            <Typography variant="interface" fontSize="$2" color="rgba(255,255,255,0.75)">
              {label(e)}
            </Typography>
          </YStack>
        ))}
      </ScrollView>
      <XStack gap={6} marginTop="$xs">
        {editions.map((e) => (
          <YStack key={e.bookId + e.lang} width={6} height={6} borderRadius={3} backgroundColor={e.current ? '#fff' : 'rgba(255,255,255,0.35)'} />
        ))}
      </XStack>
    </YStack>
  )
}

/** E — a title-page credit line under the author; a tap turns to the next edition. */
export function HeroByline({ bookRef, lang }: { bookRef: string; lang: string }) {
  const editions = useEditions(bookRef, lang)
  const go = useOpen()
  const label = useLabel()
  const i = editions.findIndex((e) => e.current)
  if (editions.length < 2 || i < 0) return null
  const next = editions[(i + 1) % editions.length]
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label(next)} onPress={() => go(next)}>
      <Typography variant="interface" fontStyle="italic" fontSize="$2" color="rgba(255,255,255,0.85)" textAlign="center">
        {label(editions[i])}
      </Typography>
      <Typography variant="label" fontSize={10} color="rgba(255,255,255,0.55)" textAlign="center">
        edição {i + 1} de {editions.length} · tocar para a próxima
      </Typography>
    </Pressable>
  )
}

/** F — "Outras edições" as a shelf of small covers after the contents. */
export function EditionShelf({ bookRef, lang }: { bookRef: string; lang: string }) {
  const editions = useEditions(bookRef, lang).filter((e) => !e.current)
  const go = useOpen()
  const { t } = useTranslation()
  if (!editions.length) return null
  return (
    <YStack gap="$md" paddingVertical="$xl" paddingHorizontal="$lg">
      <XStack alignItems="center" gap="$sm">
        <Typography fontSize="$1">✦</Typography>
        <Typography variant="screen-title" fontSize="$4" textAlign="left">
          Outras edições
        </Typography>
      </XStack>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
        {editions.map((e) => (
          <Pressable key={e.bookId + e.lang} accessibilityRole="button" accessibilityLabel={e.by} onPress={() => go(e)}>
            <YStack width={110} gap="$xs">
              <EditionCover e={e} width={110} />
              <Typography variant="label" fontSize={10} textAlign="left">
                {t(`languages.${e.lang}`)}
              </Typography>
              <Typography variant="interface" fontSize="$1" tone="muted" textAlign="left" numberOfLines={2}>
                {e.from ? `Ember, do ${t(`languages.${e.from}`).toLowerCase()}` : `${e.by}${e.year ? `, ${e.year}` : ''}`}
              </Typography>
            </YStack>
          </Pressable>
        ))}
      </ScrollView>
    </YStack>
  )
}
