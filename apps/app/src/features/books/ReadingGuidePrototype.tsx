// PROTOTYPE — throwaway. Three looks for an author's reading guide (a curated,
// sectioned order through every work), shared by the author page and the holy
// card's Reading section. Switch with `?variant=A|B|C` on the author page or the
// A·B·C pill on either surface. Data: St. Thérèse of Lisieux, hand-written here.
import { useRouter } from 'expo-router'
import { Fragment, type ReactNode, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, useWindowDimensions } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { getEntry } from '@/content/contentIndex'
import { CollectionTile } from '@/features/collections'
import { localizeContent } from '@/lib/i18n'
import { Typography } from '@/components/typography'
import {
  BookThumb,
  bookHref,
  languagesOf,
  ShelfCover,
  type ShelfBook,
  useReadingTime,
  useShelf,
} from '@/features/books/shelf'

type L = { 'en-US': string; 'pt-BR': string }
type GuideWork = { book: string; why?: L }
type GuideSection = { title: L; note?: L; works: GuideWork[] }

const guides: Record<string, GuideSection[]> = {
  'thomas-aquinas': [{"title": {"en-US": "Daily Prayer", "pt-BR": "Oração Diária"}, "works": [{"book": "aquinas-devotional-prayers"}]}, {"title": {"en-US": "Eucharistic Hymns", "pt-BR": "Hinos Eucarísticos"}, "works": [{"book": "aquinas-hymns"}]}, {"title": {"en-US": "Catechetical Instructions", "pt-BR": "Instruções Catequéticas"}, "works": [{"book": "aquinas-catechetical-instructions"}]}, {"title": {"en-US": "The Summae", "pt-BR": "As Sumas"}, "works": [{"book": "aquinas-summa-theologiae"}, {"book": "aquinas-summa-contra-gentiles"}, {"book": "aquinas-compendium-theology"}]}, {"title": {"en-US": "Disputed Questions", "pt-BR": "Questões Disputadas"}, "works": [{"book": "aquinas-de-veritate"}, {"book": "aquinas-de-potentia"}, {"book": "aquinas-de-spiritualibus-creaturis"}, {"book": "aquinas-qd-de-anima"}, {"book": "aquinas-de-virtutibus"}, {"book": "aquinas-de-unione-verbi"}, {"book": "aquinas-de-malo"}, {"book": "aquinas-quodlibetales"}]}, {"title": {"en-US": "Scripture & Patristic Commentary", "pt-BR": "Comentários Bíblicos e Patrísticos"}, "works": [{"book": "aquinas-catena-aurea-matthew"}, {"book": "aquinas-catena-aurea-mark"}, {"book": "aquinas-catena-aurea-luke"}, {"book": "aquinas-catena-aurea-john"}, {"book": "aquinas-super-iohannem"}, {"book": "aquinas-super-romanos"}, {"book": "aquinas-super-1-cor"}, {"book": "aquinas-super-2-cor"}, {"book": "aquinas-super-galatas"}, {"book": "aquinas-super-ephesios"}, {"book": "aquinas-super-philippenses"}, {"book": "aquinas-super-colossenses"}, {"book": "aquinas-super-1-thess"}, {"book": "aquinas-super-2-thessalonicenses"}, {"book": "aquinas-super-1-timotheum"}, {"book": "aquinas-super-2-timotheum"}, {"book": "aquinas-super-titum"}, {"book": "aquinas-super-philemonem"}, {"book": "aquinas-super-hebraeos"}, {"book": "aquinas-super-matthaeum"}, {"book": "aquinas-super-matt-petri-de-scala"}, {"book": "aquinas-super-iob"}, {"book": "aquinas-super-psalmos"}, {"book": "aquinas-super-threnos"}, {"book": "aquinas-super-isaiam"}, {"book": "aquinas-super-ieremiam"}]}, {"title": {"en-US": "Philosophical Commentaries", "pt-BR": "Comentários Filosóficos"}, "works": [{"book": "aquinas-comm-ethics"}, {"book": "aquinas-tabula-ethicorum"}, {"book": "aquinas-comm-metaphysics"}, {"book": "aquinas-comm-physics"}, {"book": "aquinas-comm-de-anima"}, {"book": "aquinas-comm-politics"}, {"book": "aquinas-comm-posterior-analytics"}, {"book": "aquinas-comm-peri-hermeneias"}, {"book": "aquinas-comm-de-caelo"}, {"book": "aquinas-comm-meteora"}, {"book": "aquinas-comm-generation-corruption"}, {"book": "aquinas-comm-de-sensu"}, {"book": "aquinas-comm-de-memoria"}, {"book": "aquinas-boethius-de-trinitate"}, {"book": "aquinas-boethius-de-hebdomadibus"}, {"book": "aquinas-liber-de-causis"}, {"book": "aquinas-de-divinis-nominibus"}, {"book": "aquinas-super-sententias"}]}, {"title": {"en-US": "Opuscula — Short Treatises", "pt-BR": "Opúsculos — Tratados Breves"}, "works": [{"book": "aquinas-de-ente-et-essentia"}, {"book": "aquinas-de-principiis-naturae"}, {"book": "aquinas-de-aeternitate-mundi"}, {"book": "aquinas-de-unitate-intellectus"}, {"book": "aquinas-de-substantiis-separatis"}, {"book": "aquinas-de-regno"}, {"book": "aquinas-contra-impugnantes"}, {"book": "aquinas-contra-retrahentes"}, {"book": "aquinas-de-perfectione-vitae"}, {"book": "aquinas-contra-errores-graecorum"}, {"book": "aquinas-de-motu-cordis"}, {"book": "aquinas-de-operationibus-occultis"}, {"book": "aquinas-de-sortibus"}, {"book": "aquinas-de-judiciis-astrorum"}, {"book": "aquinas-de-mixtione-elementorum"}, {"book": "aquinas-de-articulis-fidei"}, {"book": "aquinas-de-rationibus-fidei"}, {"book": "aquinas-principium"}, {"book": "aquinas-rigans-montes"}, {"book": "aquinas-hic-est-liber"}, {"book": "aquinas-de-emptione"}, {"book": "aquinas-to-bernard-abbot"}, {"book": "aquinas-to-duchess-flanders"}, {"book": "aquinas-to-john-vercelli"}, {"book": "aquinas-letter-6-articles"}, {"book": "aquinas-letter-30-articles"}, {"book": "aquinas-letter-36-articles"}, {"book": "aquinas-letter-43-articles"}, {"book": "aquinas-letter-108-articles"}, {"book": "aquinas-de-secreto"}, {"book": "aquinas-decretalem"}, {"book": "aquinas-de-forma-absolutionis"}]}, {"title": {"en-US": "Sermons", "pt-BR": "Sermões"}, "works": [{"book": "aquinas-sermons-bilingual"}, {"book": "aquinas-catechetical-sermons-cc"}, {"book": "aquinas-sermon-immensa"}]}, {"title": {"en-US": "The Office of Corpus Christi", "pt-BR": "O Ofício de Corpus Christi"}, "works": [{"book": "aquinas-office-corpus-christi"}, {"book": "aquinas-office-corpus-christi-sapientia"}]}, {"title": {"en-US": "Dominican Historical Documents", "pt-BR": "Documentos Históricos Dominicanos"}, "works": [{"book": "aquinas-roman-chapters"}]}],
  'therese-of-lisieux': [
    {
      title: { 'en-US': 'Start here', 'pt-BR': 'Comece por aqui' },
      note: {
        'en-US': 'Her own story, written in obedience for her sisters. Everything else grows from it.',
        'pt-BR': 'A própria história, escrita por obediência para as irmãs. Todo o resto nasce dela.',
      },
      works: [
        {
          book: 'therese-histoire-d-une-ame',
          why: {
            'en-US': 'The book that made her known, as first published in 1898',
            'pt-BR': 'O livro que a tornou conhecida, como saiu em 1898',
          },
        },
        {
          book: 'therese-manuscrits-autobiographiques',
          why: {
            'en-US': 'The same story as she wrote it, in three manuscripts',
            'pt-BR': 'A mesma história como ela a escreveu, em três manuscritos',
          },
        },
      ],
    },
    {
      title: { 'en-US': 'Her last months', 'pt-BR': 'Os últimos meses' },
      note: {
        'en-US': 'Taken down at her bedside by her sisters, April to September 1897.',
        'pt-BR': 'Anotados à sua cabeceira pelas irmãs, de abril a setembro de 1897.',
      },
      works: [
        {
          book: 'therese-derniers-entretiens',
          why: {
            'en-US': 'Her last words on suffering, trust and the Little Way',
            'pt-BR': 'Suas últimas palavras sobre o sofrimento, a confiança e a pequena via',
          },
        },
      ],
    },
    {
      title: { 'en-US': 'Prayer', 'pt-BR': 'Oração' },
      note: {
        'en-US': 'The prayers she wrote for herself and her novices.',
        'pt-BR': 'As orações que escreveu para si e para as noviças.',
      },
      works: [
        {
          book: 'therese-prieres',
          why: {
            'en-US': 'All of them, with the Act of Oblation to Merciful Love',
            'pt-BR': 'Todas, com o Ato de Oferecimento ao Amor Misericordioso',
          },
        },
        {
          book: 'therese-prieres-1898',
          why: {
            'en-US': 'The selection printed with the first Story of a Soul',
            'pt-BR': 'A seleção impressa com a primeira História de uma alma',
          },
        },
      ],
    },
    {
      title: { 'en-US': 'Letters', 'pt-BR': 'Cartas' },
      note: {
        'en-US': 'To her family, her sisters in Carmel and her two missionary brothers.',
        'pt-BR': 'À família, às irmãs do Carmelo e aos dois irmãos missionários.',
      },
      works: [
        {
          book: 'therese-lettres',
          why: { 'en-US': 'The whole correspondence, 1877–1897', 'pt-BR': 'Toda a correspondência, 1877–1897' },
        },
        {
          book: 'therese-lettres-1898',
          why: {
            'en-US': 'The letters chosen for the 1898 edition',
            'pt-BR': 'As cartas escolhidas para a edição de 1898',
          },
        },
      ],
    },
    {
      title: { 'en-US': 'Poems and plays', 'pt-BR': 'Poesias e peças' },
      note: {
        'en-US': 'Written for the community’s feast days: the Little Way in verse.',
        'pt-BR': 'Escritas para as festas da comunidade: a pequena via em verso.',
      },
      works: [
        {
          book: 'therese-poesies',
          why: { 'en-US': 'Her poems, “To live by love” among them', 'pt-BR': 'Suas poesias, entre elas “Viver de amor”' },
        },
        {
          book: 'therese-recreations-pieuses',
          why: {
            'en-US': 'The plays she wrote for recreation, Joan of Arc among them',
            'pt-BR': 'As peças que escreveu para o recreio, entre elas Joana d’Arc',
          },
        },
        {
          book: 'therese-poems-emery',
          why: { 'en-US': 'An English verse translation of 1907', 'pt-BR': 'Uma tradução inglesa em verso, de 1907' },
        },
      ],
    },
    {
      title: { 'en-US': 'Other writings', 'pt-BR': 'Outros escritos' },
      works: [
        {
          book: 'therese-ecrits-divers',
          why: { 'en-US': 'Notes, holy cards and fragments', 'pt-BR': 'Notas, santinhos e fragmentos' },
        },
      ],
    },
  ],
}

export const guideOfCard: Record<string, string> = {
  therese: 'therese-of-lisieux',
  thomas_aquinas: 'thomas-aquinas',
}

export function hasGuidePrototype(authorId: string | undefined) {
  return !!authorId && authorId in guides
}

// The variant is shared by both surfaces, so flipping it on the card flips the page too.
let current = 'A'
const listeners = new Set<() => void>()
function setVariant(v: string) {
  current = v
  for (const l of listeners) l()
}
function useVariant() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}
export function initVariant(v: string | undefined) {
  if (v && ['A', 'B', 'C'].includes(v) && v !== current) setVariant(v)
}

const names: Record<string, string> = { A: 'Grouped list', B: 'Cover rows', C: 'Numbered path' }

function Switcher() {
  const variant = useVariant()
  return (
    <XStack
      alignSelf="center"
      backgroundColor="#111"
      borderRadius={999}
      paddingHorizontal="$sm"
      paddingVertical={6}
      gap="$sm"
      alignItems="center"
    >
      {['A', 'B', 'C'].map((v) => (
        <Pressable key={v} onPress={() => setVariant(v)} hitSlop={8}>
          <Typography
            variant="label"
            color={v === variant ? '#fff' : '#888'}
            paddingHorizontal={6}
          >
            {v === variant ? `${v} · ${names[v]}` : v}
          </Typography>
        </Pressable>
      ))}
    </XStack>
  )
}

type Resolved = { section: GuideSection; works: { work: GuideWork; book: ShelfBook }[] }

function useGuide(authorId: string): Resolved[] {
  const shelf = useShelf()
  const books = new Map(shelf.authorById.get(authorId)?.books.map((b) => [b.bareId, b]) ?? [])
  return (guides[authorId] ?? []).map((section) => ({
    section,
    works: section.works.flatMap((work) => {
      const book = books.get(work.book)
      return book ? [{ work, book }] : []
    }),
  }))
}

function useText() {
  const { i18n } = useTranslation()
  return (l: L | undefined) => (l ? (i18n.language.startsWith('pt') ? l['pt-BR'] : l['en-US']) : '')
}

function useDetail() {
  const readingTime = useReadingTime()
  return (book: ShelfBook) => [readingTime(book.minutes), languagesOf(book)].filter(Boolean).join(' · ')
}

/** A — iOS inset grouped sections; a section of more than five works becomes a
 * carousel of grouped columns, four rows each, the next column peeking in. */
function GuideRow({ work, book }: { work: GuideWork; book: ShelfBook }) {
  const text = useText()
  const detail = useDetail()
  const router = useRouter()
  return (
    <AnimatedPressable onPress={() => router.push(bookHref(book))} accessibilityRole="link">
      <XStack gap="$md" alignItems="center" paddingHorizontal="$md" paddingVertical="$sm" minHeight={72}>
        <BookThumb book={book} />
        <YStack flex={1} gap={2}>
          <Typography fontSize="$3" numberOfLines={2}>
            {book.title}
          </Typography>
          {work.why ? (
            <Typography variant="caption" numberOfLines={2}>
              {text(work.why)}
            </Typography>
          ) : null}
          <Typography variant="annotation" tone="muted">
            {detail(book)}
          </Typography>
        </YStack>
        <Typography tone="muted">›</Typography>
      </XStack>
    </AnimatedPressable>
  )
}

export function GroupBlock({ children, width }: { children: ReactNode[]; width?: number }) {
  return (
    <YStack backgroundColor="$backgroundSurface" borderRadius={12} overflow="hidden" width={width}>
      {children.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <YStack height={0.5} backgroundColor="$borderColor" marginLeft={68} />}
          {child}
        </Fragment>
      ))}
    </YStack>
  )
}

export function GroupHeader({ title, count }: { title: string; count?: number }) {
  return (
    <XStack justifyContent="space-between" alignItems="baseline" paddingHorizontal="$sm">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.2} tone="muted">
        {title}
      </Typography>
      {count ? <Typography variant="annotation" tone="muted">{count}</Typography> : null}
    </XStack>
  )
}

const perColumn = 4

function GroupedList({ guide }: { guide: Resolved[] }) {
  const text = useText()
  const { width } = useWindowDimensions()
  const column = width - 2 * 24 - 36
  return (
    <YStack gap="$lg">
      {guide.map(({ section, works }) => {
        const rows = works.map(({ work, book }) => <GuideRow key={book.id} work={work} book={book} />)
        const columns: ReactNode[][] = []
        for (let i = 0; i < rows.length; i += perColumn) columns.push(rows.slice(i, i + perColumn))
        return (
          <YStack key={section.title['en-US']} gap="$xs">
            <GroupHeader title={text(section.title)} count={works.length > 5 ? works.length : undefined} />
            {works.length > 5 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={column + 12}
                decelerationRate="fast"
                style={{ marginHorizontal: -24 }}
                contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}
              >
                {columns.map((c, i) => (
                  <YStack key={i} width={column}>
                    <GroupBlock>{c}</GroupBlock>
                  </YStack>
                ))}
              </ScrollView>
            ) : (
              <GroupBlock>{rows}</GroupBlock>
            )}
            {section.note ? (
              <Typography variant="caption" tone="muted" paddingHorizontal="$sm">
                {text(section.note)}
              </Typography>
            ) : null}
          </YStack>
        )
      })}
    </YStack>
  )
}

/** B — each section a swipeable row of covers, its note under the title. */
function CoverRows({ guide }: { guide: Resolved[] }) {
  const text = useText()
  return (
    <YStack gap="$lg">
      {guide.map(({ section, works }) => (
        <YStack key={section.title['en-US']} gap="$sm">
          <YStack gap={2}>
            <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
              {text(section.title)}
            </Typography>
            {section.note ? <Typography variant="caption">{text(section.note)}</Typography> : null}
          </YStack>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {works.map(({ work, book }) => (
              <YStack key={book.id} width={120} gap={4}>
                <ShelfCover book={book} size={120} />
                <Typography variant="annotation" numberOfLines={3}>
                  {text(work.why)}
                </Typography>
              </YStack>
            ))}
          </ScrollView>
        </YStack>
      ))}
    </YStack>
  )
}

/** C — one numbered path down a thread, sections as dividers on the way. */
function NumberedPath({ guide }: { guide: Resolved[] }) {
  const text = useText()
  const detail = useDetail()
  const router = useRouter()
  let n = 0
  return (
    <YStack>
      {guide.map(({ section, works }) => (
        <YStack key={section.title['en-US']}>
          <XStack alignItems="center" gap="$sm" paddingVertical="$sm">
            <YStack flex={1} height={0.5} backgroundColor="$accentSubtle" />
            <Typography variant="label" color="$accent" textTransform="uppercase" letterSpacing={1.5}>
              {text(section.title)}
            </Typography>
            <YStack flex={1} height={0.5} backgroundColor="$accentSubtle" />
          </XStack>
          {section.note ? (
            <Typography variant="caption" fontStyle="italic" textAlign="center" paddingBottom="$sm">
              {text(section.note)}
            </Typography>
          ) : null}
          {works.map(({ work, book }) => {
            n += 1
            return (
              <AnimatedPressable key={book.id} onPress={() => router.push(bookHref(book))} accessibilityRole="link">
                <XStack gap="$md" paddingVertical="$sm">
                  <YStack
                    width={30}
                    height={30}
                    borderRadius={15}
                    borderWidth={1}
                    borderColor="$accent"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography variant="label" color="$accent">
                      {n}
                    </Typography>
                  </YStack>
                  <YStack flex={1} gap={2}>
                    <Typography fontSize="$4">{book.title}</Typography>
                    <Typography variant="caption">{text(work.why)}</Typography>
                    <Typography variant="annotation" tone="muted">
                      {detail(book)}
                    </Typography>
                  </YStack>
                </XStack>
              </AnimatedPressable>
            )
          })}
        </YStack>
      ))}
    </YStack>
  )
}

type Extra = { title: string; refs: string[] }

function ExtraRow({ itemRef }: { itemRef: string }) {
  const entry = getEntry(itemRef)
  const name = localizeContent((entry?.name ?? entry?.title ?? {}) as Record<string, string>)
  return (
    <XStack gap="$md" alignItems="center" paddingHorizontal="$md" paddingVertical="$sm" minHeight={72}>
      <CollectionTile item={{ ref: itemRef }} width={44} aspectRatio={1.5} />
      <YStack flex={1}>
        <Typography fontSize="$3" numberOfLines={2}>
          {name}
        </Typography>
      </YStack>
      <Typography tone="muted">›</Typography>
    </XStack>
  )
}

export function ReadingGuidePrototype({ authorId, extras = [] }: { authorId: string; extras?: Extra[] }) {
  const guide = useGuide(authorId)
  return (
    <YStack gap="$lg">
      <GroupedList guide={guide} />
      {extras.map((x) => (
        <YStack key={x.title} gap="$xs">
          <GroupHeader title={x.title} />
          <GroupBlock>{x.refs.map((r) => <ExtraRow key={r} itemRef={r} />)}</GroupBlock>
        </YStack>
      ))}
    </YStack>
  )
}
