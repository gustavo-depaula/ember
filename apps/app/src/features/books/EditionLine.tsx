import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import { editionsOfWork, getBookCatalogEntry, getResidentBook, loadBooks } from '@/content/books'

/** One language of one book: what the reader picks between. */
type Edition = {
  bookId: string
  lang: string
  by?: string
  year?: number | string
  from?: string
  current: boolean
}

function useEditions(bookRef: string, lang: string): Edition[] {
  const ids = editionsOfWork(bookRef)
  const { data } = useQuery({
    queryKey: ['book-editions', ...ids],
    queryFn: async () => {
      await loadBooks(ids)
      return ids
    },
    enabled: ids.length > 1,
    staleTime: Number.POSITIVE_INFINITY,
  })
  return (data ?? []).flatMap((id) => {
    const book = getResidentBook(id)
    const langs = book?.languages ?? getBookCatalogEntry(id)?.langs ?? []
    return langs.map((l) => {
      const edition = book?.editions?.[l]
      return {
        bookId: id.replace(/^book\//, ''),
        lang: l,
        by: edition?.translator ?? edition?.editor,
        year: edition?.year,
        from: edition?.from,
        current: id === bookRef && l === lang,
      }
    })
  })
}

function useEditionLabel() {
  const { t, i18n } = useTranslation()
  // Portuguese writes language names in lowercase mid-sentence ("do inglês").
  const language = (code: string, inline = false) => {
    const name = t(`languages.${code}`, { defaultValue: code })
    return inline && !i18n.language.startsWith('en') ? name.toLocaleLowerCase(i18n.language) : name
  }
  return (e: Edition) => {
    if (!e.by) return language(e.lang)
    if (e.from)
      return t('books.editionTranslated', {
        language: language(e.lang),
        by: e.by,
        from: language(e.from, true),
      })
    return e.year
      ? t('books.editionByYear', { language: language(e.lang), by: e.by, year: e.year })
      : t('books.editionBy', { language: language(e.lang), by: e.by })
  }
}

/**
 * Under the book's actions: which edition this is, and the way to the others
 * of the same work (a native sheet). When the book doesn't read in the
 * reader's language and another edition does, it offers that one. Renders
 * nothing for a book that is the only edition of its work.
 */
export function EditionLine({
  bookRef,
  lang,
  contentLanguage,
}: {
  bookRef: string
  lang: string
  contentLanguage: string
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const editions = useEditions(bookRef, lang)
  const label = useEditionLabel()
  if (editions.length < 2) return null

  const current = editions.find((e) => e.current)
  const others = editions.filter((e) => !e.current)
  const inMyLanguage =
    lang === contentLanguage ? undefined : others.find((e) => e.lang === contentLanguage)
  const openEdition = (e: Edition) => {
    setOpen(false)
    router.replace({
      pathname: '/browse/book/[bookId]',
      params: { bookId: e.bookId, lang: e.lang },
    })
  }

  return (
    <YStack gap="$xs">
      {inMyLanguage && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('a11y.openEdition', { edition: label(inMyLanguage) })}
          onPress={() => openEdition(inMyLanguage)}
          hitSlop={12}
        >
          <Typography variant="interface" color="$accent" textAlign="left">
            {t('books.alsoIn', { language: t(`languages.${contentLanguage}`) })}
          </Typography>
        </Pressable>
      )}
      {current && (
        <Typography variant="interface" tone="muted" textAlign="left">
          {label(current)}
        </Typography>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('a11y.otherEditions')}
        onPress={() => setOpen(true)}
        hitSlop={12}
      >
        <Typography variant="interface" color="$accent" textAlign="left">
          {t('books.otherEditions', { count: others.length })}
        </Typography>
      </Pressable>

      <BottomSheet
        index={open ? 0 : -1}
        snapPoints={[`${Math.min(85, 22 + editions.length * 8)}%`]}
        enablePanDownToClose
        onClose={() => setOpen(false)}
        backgroundStyle={{ backgroundColor: theme.background?.val }}
      >
        <YStack padding="$lg" gap="$sm">
          <Typography variant="screen-title" textAlign="left">
            {t('books.editionsTitle')}
          </Typography>
          {editions.map((e) => (
            <Pressable
              key={`${e.bookId}/${e.lang}`}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.openEdition', { edition: label(e) })}
              accessibilityState={{ selected: e.current }}
              onPress={() => (e.current ? setOpen(false) : openEdition(e))}
            >
              <XStack minHeight={44} alignItems="center" justifyContent="space-between" gap="$md">
                <Typography variant="interface" textAlign="left" flexShrink={1}>
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
