import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { View, YStack } from 'tamagui'

import {
  PrayerSpinner,
  ReaderErrorState,
  ReadingConfigModal,
  ScreenLayout,
  TwoColumnReaderHeader,
} from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { editionLanguage, findTranslation } from '@/lib/bibleTranslations'
import { type Book, servingEdition } from '@/lib/content'
import { isHebrew, showHebrewMarks } from '@/lib/typography/hebrew'
import { useBibleStore } from '@/stores/bibleStore'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { spanForVerse } from '../commentary'
import { accentOf, accentSystem } from '../hebrew/accents'
import { describeHebrew } from '../hebrew/morphology'
import { type HebrewWord, hebrewTokens, isStudiable, mainPiece } from '../hebrew/words'
import {
  useAccentTable,
  useBooks,
  useChapter,
  useChapterCommentary,
  useChapterWords,
  useHebrewChapterWords,
  useHebrewMorphology,
  useHebrewParagraphs,
  useParallelVerses,
  usePrefetchAdjacentChapters,
  useVersePane,
  useVersification,
} from '../hooks'
import { describeParsing, parseRobinson } from '../morphology'
import { isReferenceKind } from '../references'
import { getVersification, getVersificationAt, whereChapterWent } from '../versification'
import { isUnchecked, verseTokens } from '../words'
import { BibleDrawer } from './BibleDrawer'
import { ChapterContent, type PageLayout, type Witness } from './ChapterContent'
import { ChapterNav } from './ChapterNav'
import { HebrewInterlinear } from './HebrewInterlinear'
import { HebrewWordStudy } from './HebrewWordStudy'
import { InterlinearChapter } from './InterlinearChapter'
import { StudyLayoutBar } from './StudyLayoutBar'
import { VersePane } from './VersePane'
import { paneFraction } from './VersePaneContent'
import { WordStudy } from './WordStudy'

const springConfig = { damping: 24, stiffness: 200, mass: 0.8 }
const noBooks: Book[] = []
// How long a chapter stays open before it counts as read, so that leafing
// through the drawer to look something up moves no place.
const readingDwellMs = 20_000
// Where a tapped verse comes to rest below the top of the page, so the line
// before it stays in view.
const verseRestOffset = 72

type Place = { bookId: string; chapter: number; verse: number }

/** A Hebrew slot's study key: its word's own piece, the word before for a joined slot, nothing for punctuation. */
function hebrewKey(list: HebrewWord[], i: number): string | undefined {
  const word = list[i]
  if (word?.j) return i > 0 ? hebrewKey(list, i - 1) : undefined
  return isStudiable(word) ? mainPiece(word)?.[0] : undefined
}

export function BibleReader({ initialDrawerOpen = false }: { initialDrawerOpen?: boolean }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const bottomClearance = useBottomClearance()
  const drawerWidth = Math.min(screenWidth * 0.8, 360)
  const stripWidth = drawerWidth + screenWidth

  const translation = usePreferencesStore((s) => s.translation)
  const { bookId, chapter, setPosition, recordReading } = useBibleStore()

  const slideX = useSharedValue(initialDrawerOpen ? drawerWidth : 0)
  const startX = useSharedValue(0)
  const [panelOpen, setPanelOpen] = useState(initialDrawerOpen)
  const [readingConfigVisible, setReadingConfigVisible] = useState(false)

  // The verse the lower half is open on; none, and the page is whole.
  const [commentedVerse, setCommentedVerse] = useState<number>()
  const [paneHeight, setPaneHeight] = useState(Math.round(screenHeight * paneFraction))
  const scrollRef = useRef<ScrollView>(null)
  const chapterTop = useRef(0)
  const verseTops = useRef(new Map<number, number>())
  // A verse of another chapter to open once that chapter is on the page, and
  // the verse to keep bringing into view while that chapter settles: a verse
  // is laid out more than once, as the lines above it are broken.
  const arriving = useRef<number | undefined>(undefined)
  const unrevealed = useRef<number | undefined>(undefined)
  // The places citations were followed from, the last one first to go back to.
  const [trail, setTrail] = useState<Place[]>([])
  // The word on the study sheet; `fromPane` when it was opened from the
  // verse's Words, which the sheet goes back to.
  const [study, setStudy] = useState<{ verse: number; index: number; fromPane: boolean }>()

  const {
    data: books = noBooks,
    isError: booksError,
    refetch: refetchBooks,
  } = useBooks(translation)
  const {
    data: chapterData,
    isLoading,
    isError: chapterError,
    refetch: refetchChapter,
  } = useChapter(translation, bookId, chapter)
  usePrefetchAdjacentChapters(translation, bookId, chapter, books)

  // The edition the page is read from: the one chosen, the one completing it,
  // or the Douay-Rheims standing in.
  const edition = chapterData?.edition ?? translation
  const hebrewPage = isHebrew(editionLanguage(edition))
  const marks = useBibleStore((s) => s.studyLayout.marks)
  // The verses as the page shows them: a Hebrew page with as much of its
  // pointing as the reader chose. Word data keys on tokens, which marks never
  // add or remove, so it reads against either.
  const pageVerses = useMemo(() => {
    if (!chapterData || !hebrewPage || marks === 'chant') return chapterData?.verses
    return chapterData.verses.map((v) => ({ ...v, text: showHebrewMarks(v.text, marks) }))
  }, [chapterData, hebrewPage, marks])
  const { data: words } = useChapterWords(edition, bookId, chapter)
  const greekWords = words ?? undefined
  const { data: hebrewWords } = useHebrewChapterWords(edition, bookId, chapter, hebrewPage)
  const { data: hebrewMorphology } = useHebrewMorphology(edition, hebrewPage)
  const tokenize = hebrewPage ? hebrewTokens : verseTokens
  const tokensOf = (verse: number) => {
    const found = chapterData?.verses.find((v) => v.verse === verse)
    return found ? tokenize(found.text) : []
  }
  // What each word slot is studied by: a Greek lemma, a Hebrew word's
  // Strong's number; undefined for a slot with nothing to study (a paseq). A
  // Hebrew slot joined to the word before it is studied as that word.
  const pageKeys = useMemo(() => {
    const byVerse = <T,>(
      all: Record<number, T[]>,
      key: (list: T[], i: number) => string | undefined,
    ) =>
      Object.fromEntries(
        Object.entries(all).map(([verse, list]) => [
          Number(verse),
          list.map((_, i) => key(list, i)),
        ]),
      ) as Record<number, (string | undefined)[]>
    if (hebrewWords) return byVerse(hebrewWords, hebrewKey)
    if (greekWords) return byVerse(greekWords, (list, i) => list[i][0] || undefined)
    return undefined
  }, [greekWords, hebrewWords])
  const studiedEntry = study && greekWords?.[study.verse]?.[study.index]
  const studiedLemma = study ? pageKeys?.[study.verse]?.[study.index] : undefined
  // Memoised on its fields: every verse holding the lemma is justified again
  // when this changes identity.
  const studiedVerse = study?.verse
  const studiedIndex = study?.index
  const studied = useMemo(
    () =>
      studiedVerse !== undefined && studiedIndex !== undefined && studiedLemma !== undefined
        ? { verse: studiedVerse, index: studiedIndex, lemma: studiedLemma }
        : undefined,
    [studiedVerse, studiedIndex, studiedLemma],
  )
  const studyLayout = useBibleStore((s) => s.studyLayout)
  const setStudyLayout = useBibleStore((s) => s.setStudyLayout)
  const layout = pageKeys ? studyLayout.mode : 'text'
  const parallel = useParallelVerses(
    edition,
    studyLayout.parallel,
    bookId,
    chapter,
    layout === 'parallel',
  )

  // The page is in the numbering of the edition it was read from; everything
  // that points at a verse is read at its shared address.
  const { data: versification } = useVersification(chapterData?.edition)
  const shared =
    commentedVerse === undefined || !versification
      ? undefined
      : versification.toShared({ bookId, chapter, verse: commentedVerse })
  const unmatched = commentedVerse !== undefined && versification !== undefined && !shared
  const commentedKeys = commentedVerse === undefined ? undefined : pageKeys?.[commentedVerse]
  const commentary = useChapterCommentary(bookId, shared?.chapter ?? chapter, shared !== undefined)
  const pane = useVersePane(bookId, shared?.chapter ?? chapter, shared?.verse, commentary, {
    hasWords: commentedKeys !== undefined,
    unmatched,
  })
  const closeCommentary = useCallback(() => {
    setCommentedVerse(undefined)
    setStudy(undefined)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new chapter is the trigger
  useEffect(() => {
    const verse = arriving.current
    arriving.current = undefined
    unrevealed.current = verse
    setCommentedVerse(verse)
    setStudy(undefined)
    // A chapter turned to by hand leaves the trail of citations behind.
    if (verse === undefined) setTrail([])
    scrollRef.current?.scrollTo({ y: 0, animated: false })
    const settled = setTimeout(() => {
      unrevealed.current = undefined
    }, 2000)
    return () => clearTimeout(settled)
  }, [bookId, chapter])

  const marked = (() => {
    if (commentedVerse === undefined) return undefined
    // Only a commentator speaks of a passage; what cites a verse is listed by the verse.
    const span =
      !shared || isReferenceKind(pane.kind)
        ? undefined
        : spanForVerse(commentary.bySource[pane.kind] ?? [], shared.verse)
    // The passage is spoken of in the shared numbering; on the page its ends
    // are the edition's own verses, where they stand in this chapter.
    const onPage = (verse: number | undefined) => {
      if (verse === undefined || !shared) return undefined
      const own = versification?.fromShared({ bookId, chapter: shared.chapter, verse })
      return own?.chapter === chapter ? own.verse : undefined
    }
    return {
      verse: commentedVerse,
      from: onPage(span?.from) ?? commentedVerse,
      to: onPage(span?.to) ?? commentedVerse,
    }
  })()

  function reveal(y: number) {
    scrollRef.current?.scrollTo({ y: Math.max(0, chapterTop.current + y - verseRestOffset) })
  }

  // Stable, like the word handlers below, so a verse is drawn again only when
  // what it shows changes: an interlinear chapter is a thousand words.
  const commentedRef = useRef(commentedVerse)
  commentedRef.current = commentedVerse
  // biome-ignore lint/correctness/useExhaustiveDependencies: `reveal` reads only refs
  const handleVersePress = useCallback(
    (verse: number, y: number) => {
      if (verse === commentedRef.current) {
        closeCommentary()
        return
      }
      setStudy(undefined)
      unrevealed.current = undefined
      setCommentedVerse(verse)
      reveal(y)
    },
    [closeCommentary],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: `reveal` reads only refs
  const handleVerseLayout = useCallback((verse: number, y: number) => {
    verseTops.current.set(verse, y)
    if (unrevealed.current === verse) reveal(y)
  }, [])

  function turnTo(place: Place) {
    setStudy(undefined)
    if (place.bookId === bookId && place.chapter === chapter) {
      setCommentedVerse(place.verse)
      const y = verseTops.current.get(place.verse)
      if (y !== undefined) reveal(y)
      return
    }
    arriving.current = place.verse
    setPosition(place.bookId, place.chapter)
  }

  /** Marks the verse open as the place to come back to, before the reader leaves it. */
  function leaveTrail() {
    if (commentedVerse === undefined) return
    setTrail([{ bookId, chapter, verse: commentedVerse }, ...trail])
  }

  /** `place` is a shared address: what the pane cites is numbered as the Vulgate. */
  function followCitation(place: Place) {
    leaveTrail()
    // A citation may lead to a book another edition completes this one with.
    getVersificationAt(translation, place.bookId).then((target) =>
      turnTo(target.fromShared(place) ?? place),
    )
  }

  function goBack() {
    const [last, ...earlier] = trail
    if (!last) return
    setTrail(earlier)
    turnTo(last)
  }

  function readOn(source: string) {
    if (!shared) return
    router.push({
      pathname: '/bible/verse',
      params: { bookId, chapter: String(shared.chapter), verse: String(shared.verse), source },
    })
  }

  // Stable, so a verse's word segments (and its line breaks) are built once.
  const studyRef = useRef(study)
  studyRef.current = study
  const onWordPress = useCallback((verse: number, index: number) => {
    const open = studyRef.current
    if (open?.verse === verse && open.index === index) {
      setStudy(undefined)
      return
    }
    setCommentedVerse(undefined)
    setStudy({ verse, index, fromPane: false })
  }, [])
  // biome-ignore lint/correctness/useExhaustiveDependencies: `reveal` reads only refs
  const onWordLongPress = useCallback((verse: number) => {
    setStudy(undefined)
    setCommentedVerse(verse)
    const y = verseTops.current.get(verse)
    if (y !== undefined) reveal(y)
  }, [])

  const onSplit = useCallback((split: number) => setStudyLayout({ split }), [setStudyLayout])
  // Stable, so the page's verses are set again only when what they show changes.
  const pageStudy = useMemo(
    () =>
      pageKeys ? { keys: pageKeys, tokenize, studied, onWordPress, onWordLongPress } : undefined,
    [pageKeys, tokenize, studied, onWordPress, onWordLongPress],
  )
  // The Hebrew's parallel is its witnesses: the Septuagint, the Vulgate, and
  // the reader's own translation, each at this page's verses.
  const witnessing = hebrewPage && layout === 'parallel'
  const septuagint = useParallelVerses(
    edition,
    'LXX',
    bookId,
    chapter,
    witnessing && studyLayout.septuagint,
  )
  const vulgate = useParallelVerses(
    edition,
    'VULG',
    bookId,
    chapter,
    witnessing && studyLayout.vulgate,
  )
  const witnesses = useMemo<Witness[] | undefined>(() => {
    if (!witnessing) return undefined
    const own = findTranslation(studyLayout.parallel)
    return [
      septuagint.data && studyLayout.septuagint
        ? {
            id: 'LXX',
            label: t('bible.layout.septuagint'),
            texts: septuagint.data,
            language: 'grc',
            muted: false,
          }
        : undefined,
      vulgate.data && studyLayout.vulgate
        ? {
            id: 'VULG',
            label: t('bible.layout.vulgate'),
            texts: vulgate.data,
            language: 'la',
            muted: false,
          }
        : undefined,
      parallel.data
        ? {
            id: studyLayout.parallel,
            label: own?.shortName ?? own?.name ?? studyLayout.parallel,
            note: own?.translatedFrom ? t(`bible.translatedFrom.${own.translatedFrom}`) : undefined,
            texts: parallel.data,
            language: editionLanguage(studyLayout.parallel),
            muted: true,
          }
        : undefined,
    ].filter((w): w is Witness => w !== undefined)
  }, [
    witnessing,
    septuagint.data,
    vulgate.data,
    parallel.data,
    studyLayout.parallel,
    studyLayout.septuagint,
    studyLayout.vulgate,
    t,
  ])
  const besideLanguage = editionLanguage(studyLayout.parallel)
  const beside = useMemo(
    () =>
      layout === 'parallel' && !hebrewPage && parallel.data
        ? {
            texts: parallel.data,
            language: besideLanguage,
            columns: studyLayout.columns,
            split: studyLayout.split,
            onSplit,
          }
        : undefined,
    [
      layout,
      hebrewPage,
      parallel.data,
      besideLanguage,
      studyLayout.columns,
      studyLayout.split,
      onSplit,
    ],
  )
  // What the edition prints beyond its words (see `PageLayout`).
  const { data: paragraphs } = useHebrewParagraphs(edition, bookId, hebrewPage)
  const { data: accentTable } = useAccentTable(edition, hebrewPage)
  const printed = useMemo<PageLayout | undefined>(() => {
    if (!chapterData) return undefined
    const numbers: Record<number, string> = {}
    const marks: Record<number, 'p' | 's'> = {}
    const splits: Record<number, number> = {}
    // The Vulgate's chapter for most of these verses: the heading names it
    // where it differs, and only a verse that departs from it is marked.
    const shared = chapterData.verses.map(({ verse }) =>
      versification?.toShared({ bookId, chapter, verse }),
    )
    const tally = new Map<number, number>()
    for (const at of shared) if (at) tally.set(at.chapter, (tally.get(at.chapter) ?? 0) + 1)
    const vulgate = [...tally].sort((a, b) => b[1] - a[1])[0]?.[0] ?? chapter
    chapterData.verses.forEach(({ verse, text }, i) => {
      const at = shared[i]
      if (at && (at.chapter !== vulgate || at.verse !== verse)) {
        const where = at.chapter === vulgate ? `${at.verse}` : `${at.chapter}:${at.verse}`
        numbers[verse] = `${verse} · ${t('bible.vulgShort')} ${where}`
      }
      const mark = paragraphs?.after[`${chapter}:${verse}`]
      if (mark) marks[verse] = mark
      if (accentTable && accentSystem(accentTable, bookId, chapter, verse) === 'poetic') {
        // The verse breaks after its first word in great pause short of the end.
        const slots = hebrewTokens(text)
        const pause = slots.findIndex(
          (_, i) => i < slots.length - 2 && accentOf(accentTable, 'poetic', slots, i)?.inPause,
        )
        if (pause >= 0) splits[verse] = pause + 1
      }
    })
    return { vulgateChapter: vulgate === chapter ? undefined : vulgate, numbers, marks, splits }
  }, [chapterData, versification, bookId, chapter, paragraphs, accentTable, t])
  const completedBy =
    !chapterData || chapterData.edition === translation || chapterData.fallback
      ? undefined
      : findTranslation(chapterData.edition)?.name

  // A chapter the edition has no page for (the Douay-Rheims stands in) may be
  // one it prints elsewhere: the Septuagint's Proverbs 30 is in its chapter 24.
  const { data: movedTo } = useQuery({
    queryKey: ['bible', 'moved', translation, bookId, chapter],
    queryFn: async () => {
      // Named after the edition that prints the book, which for a Greek New
      // Testament's Proverbs is the Septuagint completing it.
      const edition = await servingEdition(translation, bookId)
      const place = whereChapterWent(await getVersification(edition), bookId, chapter)
      return place ? { place, edition } : null
    },
    enabled: chapterData?.fallback === true && translation !== 'DRB',
    staleTime: Number.POSITIVE_INFINITY,
  })
  const moved = movedTo
    ? {
        label: t('bible.chapterMoved', {
          name: findTranslation(movedTo.edition)?.name ?? movedTo.edition,
          chapter: movedTo.place.chapter,
        }),
        onPress: () => turnTo(movedTo.place),
      }
    : undefined

  /** ‹ › walk the chapter word by word, across verses, past what has nothing to study. */
  function stepWord(direction: -1 | 1) {
    if (!study || !chapterData) return
    const verses = chapterData.verses.map((v) => v.verse)
    let { verse, index } = study
    for (;;) {
      index += direction
      if (index < 0 || index >= tokensOf(verse).length) {
        const next = verses[verses.indexOf(verse) + direction]
        if (next === undefined) return
        verse = next
        index = direction === 1 ? 0 : tokensOf(verse).length - 1
      }
      const key = pageKeys?.[verse]?.[index]
      // A Hebrew slot joined to the one before is that word again.
      if (key !== undefined && !hebrewWords?.[verse]?.[index]?.j) break
    }
    setStudy({ ...study, verse, index })
  }

  // The studied Hebrew word, from the slot tapped or the word it is joined to.
  const hebrewStudied = (() => {
    if (!study || !hebrewWords) return undefined
    const list = hebrewWords[study.verse] ?? []
    const index = list[study.index]?.j ? study.index - 1 : study.index
    const word = list[index]
    return isStudiable(word) ? { index, word } : undefined
  })()
  // The verse with all its marks, whatever the page shows: accents are read from them.
  const chantTokensOf = (verse: number) => {
    const found = chapterData?.verses.find((v) => v.verse === verse)
    return found ? hebrewTokens(found.text) : []
  }

  /** The verse pane's list of words: each word, its headword and gloss, its grammar in plain words. */
  function verseWordRows(verse: number) {
    const slots = tokensOf(verse)
    if (hebrewWords) {
      const list = hebrewWords[verse] ?? []
      return slots.map((token, i) => {
        const word = list[i]
        const piece = isStudiable(word) ? mainPiece(word) : undefined
        const fields = piece && hebrewMorphology?.[piece[2]]
        return {
          token,
          head:
            word?.p
              .map(([, gloss]) => gloss)
              .filter(Boolean)
              .join(' · ') ?? '',
          grammar: fields ? describeHebrew(fields, t).join(' · ') : undefined,
          studiable: piece !== undefined,
        }
      })
    }
    const entries = greekWords?.[verse] ?? []
    return slots.map((token, i) => {
      const entry = entries[i]
      const [lemma, morph, gloss] = entry ?? []
      const parsing = morph ? parseRobinson(morph) : undefined
      return {
        token,
        head: [lemma, gloss && `“${gloss}”`].filter(Boolean).join('  '),
        grammar: parsing
          ? `${describeParsing(parsing, t)}${isUnchecked(entry) ? ` · ${t('bible.study.uncheckedShort')}` : ''}`
          : undefined,
        studiable: entry !== undefined,
      }
    })
  }

  const currentBook = books.find((b) => b.id === bookId)
  const bookName = t(`bookName.${bookId}`, { defaultValue: currentBook?.name ?? bookId })
  // The pane names the verse as the page does, and its Vulgate address beside
  // it where the two differ, since that is where what it shows is read from.
  const paneHeading = (() => {
    if (!shared || commentedVerse === undefined) return undefined
    if (shared.chapter === chapter && shared.verse === commentedVerse) return undefined
    const place = t('bible.sharedPlace', { place: `${shared.chapter}:${shared.verse}` })
    return `${bookName} ${chapter}:${commentedVerse} · ${place}`
  })()
  const cameFrom = (() => {
    const [last] = trail
    if (!last) return undefined
    const name = t(`bookName.${last.bookId}`, {
      defaultValue: books.find((b) => b.id === last.bookId)?.name ?? last.bookId,
    })
    return `${name} ${last.chapter}:${last.verse}`
  })()

  useEffect(() => {
    if (books.length === 0 || !chapterData) return
    const timer = setTimeout(() => recordReading(books), readingDwellMs)
    return () => clearTimeout(timer)
    // A new chapter arrives as new `chapterData`, which restarts the wait.
  }, [books, chapterData, recordReading])

  const handleNavigate = useCallback(
    (newBookId: string, newChapter: number) => {
      setPosition(newBookId, newChapter)
    },
    [setPosition],
  )

  function openDrawer() {
    setPanelOpen(true)
    slideX.value = withSpring(drawerWidth, springConfig)
  }

  function closeDrawer() {
    setPanelOpen(false)
    slideX.value = withSpring(0, springConfig)
  }

  // On iOS the pane is a sheet over the page, not a part of it: the page keeps
  // its height, and its drawer swipe never starts under the sheet.
  const paneInPage = Platform.OS !== 'ios'
  const paneOpen = commentedVerse !== undefined || study !== undefined
  const paneReach = !paneOpen || !paneInPage ? 0 : paneHeight
  // What the chapter's last verses must clear to be read with the pane open.
  const openFoot = paneInPage ? 24 : Math.round(screenHeight * paneFraction) + 24
  const pageHeight = useSharedValue(screenHeight)
  const paneReachPx = useSharedValue(0)
  useEffect(() => {
    paneReachPx.value = paneReach
  }, [paneReach, paneReachPx])
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-15, 15])
        // The lower half has a line and pages of its own to slide sideways:
        // a touch that lands there is not for the drawer. Refused as it
        // lands, since a pan that has begun takes the touch from the
        // scrolling under it whether or not it ever opens anything.
        .onTouchesDown((e, state) => {
          if (e.allTouches[0].y > pageHeight.value - paneReachPx.value) state.fail()
        })
        .onStart(() => {
          startX.value = slideX.value
        })
        .onUpdate((e) => {
          slideX.value = clamp(startX.value + e.translationX, 0, drawerWidth)
        })
        .onEnd((e) => {
          // Closing is easy: any meaningful drag or flick back snaps shut.
          const closing = startX.value > 0 && (e.translationX < -20 || e.velocityX < -300)
          // Opening asks for more commitment.
          const opening = slideX.value > drawerWidth * 0.4 || e.velocityX > 800
          const open = !closing && opening
          slideX.value = withSpring(open ? drawerWidth : 0, springConfig)
          runOnJS(setPanelOpen)(open)
        }),
    [slideX, startX, drawerWidth, pageHeight, paneReachPx],
  )

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -drawerWidth + slideX.value }],
  }))

  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideX.value, [0, drawerWidth], [1, 0.4]),
  }))

  // The verse the pane is open on: a studied word's own, an unmatched verse
  // by the page's number (nothing points at it), else its shared address.
  const paneVerse = (() => {
    if (study) return study.verse
    if (unmatched) return commentedVerse
    return shared?.verse
  })()

  function renderContent() {
    if (booksError || chapterError) {
      return (
        <ReaderErrorState
          onRetry={() => {
            if (booksError) refetchBooks()
            if (chapterError) refetchChapter()
          }}
        />
      )
    }
    if (isLoading) {
      return <PrayerSpinner />
    }
    if (!chapterData) return undefined
    return (
      <>
        {pageKeys || hebrewPage ? (
          <StudyLayoutBar hebrew={hebrewPage} study={pageKeys !== undefined} />
        ) : undefined}
        {layout === 'interlinear' && hebrewWords ? (
          <HebrewInterlinear
            bookName={bookName}
            chapter={chapter}
            fallback={chapterData.fallback}
            completedBy={completedBy}
            vulgateChapter={printed?.vulgateChapter}
            verses={pageVerses ?? chapterData.verses}
            words={hebrewWords}
            morphology={hebrewMorphology}
            pieces={studyLayout.pieces}
            sound={studyLayout.sound}
            parsing={studyLayout.parsing}
            studied={studied}
            markedVerse={commentedVerse}
            onWordPress={onWordPress}
            onWordLongPress={onWordLongPress}
            onVersePress={handleVersePress}
            onVerseLayout={handleVerseLayout}
          />
        ) : layout === 'interlinear' && greekWords ? (
          <InterlinearChapter
            bookName={bookName}
            chapter={chapter}
            fallback={chapterData.fallback}
            completedBy={completedBy}
            verses={pageVerses ?? chapterData.verses}
            words={greekWords}
            lemma={studyLayout.lemma}
            parsing={studyLayout.parsing}
            studied={studied}
            markedVerse={commentedVerse}
            onWordPress={onWordPress}
            onWordLongPress={onWordLongPress}
            onVersePress={handleVersePress}
            onVerseLayout={handleVerseLayout}
          />
        ) : (
          <View
            onLayout={(e) => {
              chapterTop.current = e.nativeEvent.layout.y
            }}
          >
            <ChapterContent
              bookName={bookName}
              chapter={chapter}
              verses={pageVerses ?? chapterData.verses}
              language={editionLanguage(chapterData.edition)}
              fallback={chapterData.fallback}
              study={pageStudy}
              beside={beside}
              layout={printed}
              witnesses={witnesses}
              completedBy={completedBy}
              moved={moved}
              marked={marked}
              onVersePress={handleVersePress}
              onVerseLayout={handleVerseLayout}
            />
          </View>
        )}
        <ChapterNav bookId={bookId} chapter={chapter} books={books} onNavigate={handleNavigate} />
      </>
    )
  }

  return (
    <View flex={1} backgroundColor="$background" overflow="hidden">
      {readingConfigVisible ? (
        <ReadingConfigModal
          visible={readingConfigVisible}
          onClose={() => setReadingConfigVisible(false)}
        />
      ) : undefined}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.strip, { width: stripWidth }, stripStyle]}
          onLayout={(e) => {
            pageHeight.value = e.nativeEvent.layout.height
          }}
        >
          <View style={styles.drawer}>
            <BibleDrawer
              width={drawerWidth}
              open={panelOpen}
              books={books}
              bookId={bookId}
              chapter={chapter}
              onNavigate={(newBookId, newChapter) => {
                handleNavigate(newBookId, newChapter)
                closeDrawer()
              }}
              onOpenReadingConfig={() => setReadingConfigVisible(true)}
            />
          </View>

          <Animated.View style={[{ width: screenWidth }, dimStyle]}>
            <View flex={1}>
              {/* The page scrolls here and not in ScreenLayout, so a tapped
                verse can be brought up clear of the commentary below it. */}
              <ScreenLayout scroll={false} modal>
                <ScrollView
                  ref={scrollRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: paneOpen ? openFoot : bottomClearance,
                  }}
                >
                  <YStack flex={1}>
                    <TwoColumnReaderHeader
                      variant="plain"
                      leftLabel={bookName}
                      rightValue={String(chapter)}
                      onLeftPress={openDrawer}
                      onRightPress={openDrawer}
                      leftA11yLabel={t('a11y.selectBook')}
                      rightA11yLabel={t('a11y.selectChapter')}
                    />
                    {renderContent()}
                  </YStack>
                </ScrollView>
              </ScreenLayout>
            </View>
            <VersePane
              bookId={bookId}
              bookName={bookName}
              chapter={shared?.chapter ?? chapter}
              verse={paneVerse}
              renderStudy={
                study && hebrewStudied
                  ? (bottomPadding) => (
                      <HebrewWordStudy
                        // A new word starts its sheet afresh: its pieces, its tab.
                        key={`${study.verse}:${hebrewStudied.index}`}
                        edition={edition}
                        bookName={bookName}
                        bookId={bookId}
                        chapter={chapter}
                        verse={study.verse}
                        slots={chantTokensOf(study.verse)}
                        index={hebrewStudied.index}
                        word={hebrewStudied.word}
                        backTo={
                          study.fromPane ? `${bookName} ${chapter}:${study.verse}` : undefined
                        }
                        bottomPadding={bottomPadding}
                        onStep={stepWord}
                        onBack={() => setStudy(undefined)}
                        onClose={closeCommentary}
                        onOpenPlace={(toBook, toChapter, verse) => {
                          leaveTrail()
                          turnTo({ bookId: toBook, chapter: toChapter, verse })
                        }}
                      />
                    )
                  : study && studiedEntry
                    ? (bottomPadding) => (
                        <WordStudy
                          edition={edition}
                          bookName={bookName}
                          chapter={chapter}
                          verse={study.verse}
                          token={tokensOf(study.verse)[study.index] ?? ''}
                          entry={studiedEntry}
                          backTo={
                            study.fromPane ? `${bookName} ${chapter}:${study.verse}` : undefined
                          }
                          bottomPadding={bottomPadding}
                          onStep={stepWord}
                          onBack={() => setStudy(undefined)}
                          onClose={closeCommentary}
                          onOpenPlace={(toBook, toChapter, verse) => {
                            leaveTrail()
                            turnTo({ bookId: toBook, chapter: toChapter, verse })
                          }}
                        />
                      )
                    : undefined
              }
              verseWords={
                commentedVerse !== undefined && commentedKeys
                  ? {
                      rows: verseWordRows(commentedVerse),
                      onStudy: (index) =>
                        setStudy({ verse: commentedVerse, index, fromPane: true }),
                    }
                  : undefined
              }
              heading={paneHeading}
              unmatched={unmatched}
              commentary={commentary}
              pane={pane}
              initialHeight={paneHeight}
              maxHeight={Math.round(screenHeight * 0.8)}
              cameFrom={cameFrom}
              onResize={setPaneHeight}
              onClose={closeCommentary}
              onReadOn={readOn}
              onOpenPlace={(toBook, toChapter, verse) =>
                followCitation({ bookId: toBook, chapter: toChapter, verse })
              }
              onReturn={goBack}
            />
            {panelOpen ? (
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={closeDrawer}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.closeModal')}
              />
            ) : undefined}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    flexDirection: 'row',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(128,128,128,0.3)',
  },
})
