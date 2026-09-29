import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import type { getHourSelect } from '@/content/pins'
import type { SlotState } from '@/db/events'
import { localizeContent } from '@/lib/i18n'

import { capitalize, phrasing } from '../phrasing'
import { parseSchedule, type Schedule } from '../schedule'

/** Times that share their days — the Angelus's 6h, noon and 18h — read as one clause. */
export type RuleClause = { key: string; schedule: Schedule; slots: SlotState[] }

/** One sentence of the rule; an office writes one per hour. */
export type RuleSentence = { key: string; hour?: string; clauses: RuleClause[] }

type HourSelect = NonNullable<ReturnType<typeof getHourSelect>>

function scheduleKey(schedule: Schedule): string {
  if (schedule.type === 'days-of-week' && schedule.days.length === 7) {
    return JSON.stringify({ type: 'daily', seasons: schedule.seasons })
  }
  if (schedule.type === 'days-of-week') {
    return JSON.stringify({ ...schedule, days: [...schedule.days].sort() })
  }
  return JSON.stringify(schedule)
}

const byTime = (a: SlotState, b: SlotState) => (a.time ?? '99').localeCompare(b.time ?? '99')

function clausesOf(slots: SlotState[]): RuleClause[] {
  const groups = new Map<string, RuleClause>()
  for (const slot of [...slots].sort(byTime)) {
    const schedule = parseSchedule(slot.schedule)
    const key = scheduleKey(schedule)
    const group = groups.get(key)
    if (group) group.slots.push(slot)
    else groups.set(key, { key, schedule, slots: [slot] })
  }
  // In the week's order — "Monday to Saturday" before "on Sundays" — with
  // every-day clauses first and monthly ones last.
  return [...groups.values()].sort((a, b) => weekRank(a.schedule) - weekRank(b.schedule))
}

function weekRank(schedule: Schedule): number {
  if (schedule.type === 'daily') return -1
  if (schedule.type !== 'days-of-week') return 10
  if (schedule.days.length === 7) return -1
  return Math.min(...schedule.days.map((d) => (d + 6) % 7))
}

/**
 * The enabled times as sentences: one per set of days, or — for an office —
 * one per hour, in the office's own order, with the hour's days and times.
 */
export function ruleSentences(slots: SlotState[], hours?: HourSelect): RuleSentence[] {
  const enabled = slots.filter((s) => s.enabled === 1)
  if (!hours) {
    return clausesOf(enabled).map((clause) => ({ key: clause.key, clauses: [clause] }))
  }
  const hourOf = (s: SlotState) => s.pins?.[hours.as]
  const sentences: RuleSentence[] = hours.options.flatMap((option) => {
    const mine = enabled.filter((s) => hourOf(s) === option.id)
    if (mine.length === 0) return []
    return [{ key: option.id, hour: localizeContent(option.label), clauses: clausesOf(mine) }]
  })
  const whole = enabled.filter((s) => !hourOf(s))
  return [
    ...sentences,
    ...clausesOf(whole).map((clause) => ({ key: clause.key, clauses: [clause] })),
  ]
}

const isEveryDay = (s: Schedule) =>
  (s.type === 'daily' || (s.type === 'days-of-week' && s.days.length === 7)) && !s.seasons?.length

/**
 * The rule as prose, every term a link to its sheet: "Às sextas, às 15h." An
 * office names its hours: "Laudes às 6h30; aos domingos, às 8h."
 */
export function RuleProse({
  sentences,
  onDays,
  onTime,
}: {
  sentences: RuleSentence[]
  onDays: (clause: RuleClause) => void
  onTime: (slot: SlotState) => void
}) {
  const { t, i18n } = useTranslation()
  const words = phrasing(i18n.language)

  const piecesOf = (sentence: RuleSentence): ProsePiece[] => [
    ...(sentence.hour
      ? [
          {
            text: sentence.hour,
            onPress: () => onDays(sentence.clauses[0]),
            label: t('a11y.ruleEditDays', { days: sentence.hour }),
          },
        ]
      : []),
    ...sentence.clauses.flatMap((clause, i): ProsePiece[] => {
      const days = words.days(clause.schedule)
      const showDays = !sentence.hour || !isEveryDay(clause.schedule)
      const lead = sentence.hour ? (i === 0 ? ' ' : '; ') : ''
      const times = clause.slots.map((slot) => ({
        text: slot.time ? words.time(slot.time) : words.noTime,
        onPress: () => onTime(slot),
        label: t('a11y.ruleEditTime', { time: slot.time ?? '' }),
      }))
      return [
        lead,
        ...(showDays
          ? [
              {
                text: sentence.hour ? days : capitalize(days),
                onPress: () => onDays(clause),
                label: t('a11y.ruleEditDays', { days }),
              },
              ', ',
            ]
          : []),
        ...joinPieces(times, words.and),
      ]
    }),
    // A sentence left on "a que horas?" already has its stop.
    sentence.clauses.at(-1)?.slots.at(-1)?.time ? '.' : '',
  ]

  return (
    <YStack gap={14} paddingTop="$lg">
      {sentences.map((sentence) => (
        <Prose key={sentence.key} pieces={piecesOf(sentence)} fontSize={22} />
      ))}
    </YStack>
  )
}

/** A run of prose: plain words, or a term that opens its sheet. */
export type ProsePiece = string | ProseTerm
type ProseTerm = { text: string; onPress: () => void; label: string }

type Part = { text: string; term?: ProseTerm }
// `bridged`: the space after this word still belongs to its term, and is underlined.
type Token = { parts: Part[]; bridged: boolean }

// A term this short never breaks across lines — "às 15h" stays whole.
const atomicTerm = 24

/**
 * Words, each glued to the punctuation that follows it, so a line never
 * starts with a comma. A long term breaks between its words.
 */
function tokenize(pieces: ProsePiece[]): Token[] {
  const tokens: Token[] = []
  let glued = false
  const push = (part: Part, bridged = false) => {
    const last = tokens.at(-1)
    if (glued && last) {
      last.parts.push(part)
      last.bridged = bridged
    } else tokens.push({ parts: [part], bridged })
    glued = true
  }
  for (const piece of pieces) {
    const text = typeof piece === 'string' ? piece : piece.text
    const term = typeof piece === 'string' ? undefined : piece
    const words = term && text.length <= atomicTerm ? [text] : text.split(' ')
    words.forEach((word, i) => {
      if (i > 0) glued = false
      if (word) push({ text: word, term }, !!term && i < words.length - 1)
    })
  }
  return tokens
}

/**
 * Centered prose whose terms sit over a hairline, as a printed rule marks
 * what can be filled in. Laid out word by word: a nested `Text` underline
 * runs thick along the baseline and through every descender, and RN has no
 * underline offset.
 */
export function Prose({
  pieces,
  fontSize,
  color = '$color',
}: {
  pieces: ProsePiece[]
  fontSize: number
  color?: '$color' | '$colorSecondary'
}) {
  const lineHeight = Math.round(fontSize * 1.3)
  const space = Math.round(fontSize * 0.22)
  return (
    <XStack flexWrap="wrap" justifyContent="center" columnGap={space} rowGap={fontSize * 0.36}>
      {tokenize(pieces).map((token, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: words of one fixed sentence
        <XStack key={i} marginRight={token.bridged ? -space : 0}>
          {token.parts.map((part, j) => {
            const bridge = token.bridged && j === token.parts.length - 1 ? space : 0
            if (!part.term) {
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: parts of one word
                <Typography key={j} fontSize={fontSize} lineHeight={lineHeight} color={color}>
                  {part.text}
                </Typography>
              )
            }
            return (
              <Pressable
                // biome-ignore lint/suspicious/noArrayIndexKey: parts of one word
                key={j}
                onPress={part.term.onPress}
                hitSlop={{ top: 6, bottom: 6 }}
                accessibilityRole="link"
                accessibilityLabel={part.term.label}
              >
                <YStack
                  paddingRight={bridge}
                  borderBottomWidth={1}
                  borderBottomColor="$colorBurgundy"
                >
                  {/* Ink, not burgundy: a long run of red on the dark page is hard to read,
                      and the rubric hairline alone marks what can be changed. */}
                  <Typography fontSize={fontSize} lineHeight={lineHeight} color="$color">
                    {part.text}
                  </Typography>
                </YStack>
              </Pressable>
            )
          })}
        </XStack>
      ))}
    </XStack>
  )
}

/** Pieces joined like a spoken list: "a, b e c". */
function joinPieces(pieces: ProsePiece[], and: string): ProsePiece[] {
  return pieces.flatMap((piece, i) => [
    ...(i === 0 ? [] : [i === pieces.length - 1 ? ` ${and} ` : ', ']),
    piece,
  ])
}

/**
 * Fills a translated template with terms — "Prática {{tier}}, {{reminder}}."
 * — so each slot can be a link while the sentence stays one translation.
 */
export function templatePieces(template: string, terms: Record<string, ProseTerm>): ProsePiece[] {
  return template.split(//).map((part, i) => (i % 2 === 1 ? terms[part] : part))
}

/** Values that mark where `templatePieces` puts each term. */
export function nodeMarkers<K extends string>(...keys: K[]): Record<K, string> {
  return Object.fromEntries(keys.map((k) => [k, `${k}`])) as Record<K, string>
}
