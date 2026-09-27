// PROTOTYPE — throwaway. Four structurally different "Pray now" cards for the
// head of Today's featured carousel, switchable from a dev-only floating bar
// (variant A–D × plan state live / all done / empty). Pick one, then rewrite it
// properly and delete this file.

import { useQueries } from '@tanstack/react-query'
import { format } from 'date-fns'
import type { ImageSource } from 'expo-image'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type LayoutChangeEvent, Pressable, StyleSheet } from 'react-native'
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'
import { Text, View, XStack, YStack } from 'tamagui'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { AnimatedPressable, PracticeIcon } from '@/components'
import { Typography } from '@/components/typography'
import { bareId, getEntry } from '@/content/contentIndex'
import { isTemplatePlaceholder, type PlanOfLifeTemplateManifest } from '@/content/manifestTypes'
import { getLoadedFlow, getManifest, loadFlow } from '@/content/resolver'
import type { FlowDefinition } from '@/content/types'
import { useCatalogVersion } from '@/content/useCatalogVersion'
import { resolveCompletions, type SlotState, useEventStore } from '@/db/events'
import type { TimeBlock } from '@/db/schema'
import { coverFor, GeneratedCover } from '@/features/covers'
import {
  CoverText,
  coverFonts,
  coverInk,
  Glyph,
  LaceRect,
  mixHex,
  ToneGradient,
} from '@/features/covers/parts'
import {
  deriveTimeBlock,
  enrichSlot,
  filterSlotsForDate,
  getCurrentTimeBlock,
} from '@/features/plan-of-life'
import type { ChecklistItem } from '@/features/plan-of-life/components/PracticeChecklist'
import { useTemplateManifest } from '@/features/templates'
import { useToday } from '@/hooks/useToday'
import { hearthUrl } from '@/lib/hearth'
import { localizeContent } from '@/lib/i18n'
import { artFor } from './artMap'
import { type BlockTone, blockInk, blockLabelInk, toneForKey } from './bgColor'
import { clockOf, dayMinutes, orderByWindow, type Timed } from './prayNowOrder'

const variants = ['M', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'A', 'B', 'C', 'D'] as const
const variantNames = {
  A: 'Painting',
  B: 'Litany',
  C: 'Time you have',
  D: 'Rosary ring',
  E: 'Sketch',
  F: 'Vigil',
  G: 'Holy card',
  H: 'Ordo',
  I: 'Illuminated leaf',
  J: 'Historiated initial',
  K: 'Book of Hours',
  L: 'Jewel leaf',
  M: 'Up next',
}
// Besides the live plan, every shipped template as a fresh, untouched plan.
const templateIds = [
  'beginner-minimum',
  'benedictine',
  'byzantine',
  'carmelite',
  'cursillo',
  'divine-mercy',
  'dominican',
  'franciscan',
  'ignatian',
  'legion-of-mary',
  'little-way',
  'marian-consecration',
  'opus-dei',
  'sacred-heart',
  'salesian',
  'sulpician',
] as const
const planStates = ['live', 'all done', 'empty', ...templateIds] as const
const artModes = ['hour+', 'by hour', 'by subject'] as const
// Clock override so every hour can be checked without waiting for it.
const clocks = ['live', 1, 7, 13, 18, 21] as const
type Variant = (typeof variants)[number]
type PlanState = (typeof planStates)[number]
type ArtMode = (typeof artModes)[number]
type Clock = (typeof clocks)[number]

const usePrototype = create<{
  variant: Variant
  plan: PlanState
  art: ArtMode
  clock: Clock
}>(() => ({
  variant: 'M',
  plan: 'live',
  art: 'hour+',
  clock: 'live',
}))

// ── Art ─────────────────────────────────────────────────────────────────────
// The three new hour paintings aren't on the published corpus yet, so the
// prototype bundles them straight from content/art. Dusk is Millet's Angelus.

type Hour = 'dawn' | 'day' | 'dusk' | 'night'
const hourArt: Record<Hour, ImageSource> = {
  dawn: require('../../../../../content/art/hour-dawn.jpg'),
  day: require('../../../../../content/art/hour-day.jpg'),
  // Getter: hearthUrl must resolve after initHearth, not at module load.
  get dusk() {
    return { uri: hearthUrl('art/tpl-opus-dei.jpg') }
  },
  night: require('../../../../../content/art/hour-night.jpg'),
}
const sameSource = (a: ImageSource, b: ImageSource) =>
  a === b || JSON.stringify(a) === JSON.stringify(b)
const uniqueSources = (sources: ImageSource[]) =>
  sources.filter((s, i) => sources.findIndex((o) => sameSource(o, s)) === i)
const hourOf = (h: number): Hour =>
  h >= 5 && h < 11 ? 'dawn' : h >= 11 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'dusk' : 'night'

// Keyword → painting, first match wins; unmatched practices take the hour's.
const subjectArt: Array<[RegExp, ImageSource | string]> = [
  [/offering|oferecimento|morning/, hourArt.dawn],
  [/angelus|regina-caeli/, 'tpl-opus-dei.jpg'],
  [/exam|compline|completas|night/, hourArt.night],
  [/rosary|rosario|terco|marian|mary|theotokos|hail/, 'litanies.jpg'],
  [/breviary|office|oficio|liturgy-of-the-hours|matins|prime|lauds|vespers/, 'tpl-benedictine.jpg'],
  [/mass|missa|eucharist|sacrament|communion/, 'eucharistic.jpg'],
  [/mercy|misericordia|three-oclock/, 'divine-mercy.jpg'],
  [/stations|via-crucis|way-of-the-cross/, 'way-of-the-cross.jpg'],
  [/mental|meditat|oracao-mental/, 'mental-prayer.jpg'],
  [/bible|scripture|lectio|gospel|catech/, 'spiritual-classics.jpg'],
  [/spirit|veni/, 'holy-spirit.jpg'],
  [/heart|coracao/, 'sacred-heart.jpg'],
]

// Only these practices override the hour's painting — each has one canonical
// image that says the practice better than the hour does.
const exceptionArt: Array<[RegExp, string]> = [
  [/angelus|regina-caeli/, 'tpl-opus-dei.jpg'],
  [/rosary|rosario|terco/, 'litanies.jpg'],
  [/(^|[/-])mass|missa|eucharist/, 'eucharistic.jpg'],
]

// A practice that isn't due yet takes the painting of the hour it belongs to.
const blockHour: Record<TimeBlock, Hour | undefined> = {
  morning: 'dawn',
  daytime: 'day',
  evening: 'dusk',
  flexible: undefined,
}

function artForPick(
  mode: ArtMode,
  item: Enriched | undefined,
  hour: number,
  comingUp: boolean,
): ImageSource {
  const ownHour = comingUp && item ? blockHour[item.time_block] : undefined
  const byHour = hourArt[ownHour ?? hourOf(hour)]
  if (mode === 'by hour' || !item) return byHour
  const table = mode === 'by subject' ? subjectArt : exceptionArt
  const hit = table.find(([re]) => re.test(item.practice_id))?.[1]
  if (!hit) return byHour
  return typeof hit === 'string' ? { uri: hearthUrl(`art/${hit}`) } : hit
}

// ── Office hours ────────────────────────────────────────────────────────────
// A practice whose flow picks its hour from the clock (the Breviary, the
// Little Offices, the Liturgy of the Hours…) is titled by that hour — "Prime",
// "Vespers" — with the practice as subtitle, exactly as the flow will resolve
// it when opened. A slot pinned to an hour already carries its own label.

type HourSelect = {
  map?: Record<string, string>
  options: { id: string; label: Parameters<typeof localizeContent>[0] }[]
}

function hourSelectOf(flow: FlowDefinition | undefined): HourSelect | undefined {
  return flow?.sections.find(
    (s) => s.type === 'select' && 'options' in s && s.pin === true && s.on === 'hour',
  ) as HourSelect | undefined
}

// Same rule as the engine's lookupMap: exact key, then "lo-hi" ranges in order.
function mapHour(map: Record<string, string>, hour: number): string | undefined {
  if (String(hour) in map) return map[String(hour)]
  for (const [k, v] of Object.entries(map)) {
    const [lo, hi] = k.split('-').map(Number)
    if (hi !== undefined && hour >= lo && hour <= hi) return v
  }
  return undefined
}

const flowIdOf = (practiceId: string) =>
  useEventStore.getState().practices.get(practiceId)?.active_variant ?? practiceId

function withHourTitle(item: Enriched, hour: number): Enriched {
  if (item.pinned) return item
  const select = hourSelectOf(getLoadedFlow(flowIdOf(item.practice_id)))
  const optionId = select?.map ? mapHour(select.map, hour) : undefined
  const option = select?.options.find((o) => o.id === optionId)
  if (!option) return item
  return { ...item, name: localizeContent(option.label), subtitle: item.name }
}

// Loads the flows behind the card's candidates so hour titles can resolve.
// Shares usePractice's query key, so opening the practice reuses the flow.
function useCandidateFlows(slots: SlotState[]): number {
  const ids = [...new Set(slots.map((s) => flowIdOf(s.practice_id)))]
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['flow', id, null],
      queryFn: async () => (await loadFlow(id)) ?? null,
      staleTime: Number.POSITIVE_INFINITY,
    })),
  })
  return results.filter((r) => r.data).length
}

function templateSlots(template: PlanOfLifeTemplateManifest | undefined): SlotState[] {
  if (!template) return []
  return template.practices.flatMap((p, i) => {
    if (isTemplatePlaceholder(p) || p.enabled === false) return []
    const id = p.ref.slice(p.ref.indexOf('/') + 1)
    return [
      {
        id: `prototype-template::${id}::${i}`,
        practice_id: id,
        enabled: 1,
        sort_order: i,
        tier: p.tier,
        time: p.time ?? null,
        time_block: deriveTimeBlock(p.time),
        notify: null,
        schedule: JSON.stringify(p.schedule),
      },
    ]
  })
}

// ── What should I pray next? ────────────────────────────────────────────────
// Only timed practices and hour-based offices are ever picked; untimed ones
// (Confession, spiritual reading) have no "now". The timing rules live in
// prayNowOrder.ts. A plan with nothing timed at all falls back to the
// backbone: a few short practices across the day, offered as suggestions.

// A few short practices (each under 10 minutes) spread over the day — what
// the card offers someone whose plan has nothing timed yet.
const backbone: Array<{ ref: string; time: string }> = [
  { ref: 'morning-offering', time: '07:00' },
  { ref: 'gospel-of-the-day', time: '07:30' },
  { ref: 'angelus', time: '12:00' },
  { ref: 'three-oclock-prayer', time: '15:00' },
  { ref: 'angelus', time: '18:00' },
  { ref: 'examination-of-conscience', time: '21:00' },
  { ref: 'night-prayer', time: '21:30' },
]

function backboneSlots(): SlotState[] {
  return backbone.map(({ ref, time }, i) => ({
    id: `prototype-backbone::${ref}::${i}`,
    practice_id: ref,
    enabled: 1,
    sort_order: i,
    tier: 'essential',
    time,
    time_block: deriveTimeBlock(time),
    notify: null,
    schedule: JSON.stringify({ type: 'daily' }),
  }))
}

/** The backbone slots already prayed today: the nth Angelus is done once two were prayed. */
function backboneDone(prayed: string[]): Set<string> {
  const count = new Map<string, number>()
  for (const id of prayed) count.set(bareId(id), (count.get(bareId(id)) ?? 0) + 1)
  const seen = new Map<string, number>()
  const done = new Set<string>()
  backboneSlots().forEach((s) => {
    const nth = (seen.get(s.practice_id) ?? 0) + 1
    seen.set(s.practice_id, nth)
    if ((count.get(s.practice_id) ?? 0) >= nth) done.add(s.id)
  })
  return done
}

type Pick = {
  // rest: nothing now or later today, but not everything was prayed.
  state: 'next' | 'done' | 'rest' | 'empty'
  next?: Enriched
  queue: Enriched[]
  comingUp: boolean
  /** Offered from the backbone, not the user's plan. */
  suggestion: boolean
  slots: Enriched[]
  completedIds: Set<string>
}
type Enriched = ReturnType<typeof enrichSlot> &
  Timed & {
    minutes?: number
  }

function pickPrayNow(
  slots: SlotState[],
  completedIds: Set<string>,
  now: number,
  t: Parameters<typeof enrichSlot>[1],
  suggestion = false,
): Pick {
  const hour = Math.floor(now / 60) % 24
  const isOffice = (s: SlotState) => {
    const pinned = !!s.pins
    return !pinned && !!hourSelectOf(getLoadedFlow(flowIdOf(s.practice_id)))?.map
  }
  const enriched: Enriched[] = slots.flatMap((s) => {
    const office = isOffice(s)
    if (!s.time && !office) return []
    const due = office ? now : dayMinutes(s.time ?? '00:00')
    return [
      {
        ...enrichSlot(s, t),
        minutes: getManifest(s.practice_id)?.estimatedMinutes,
        office,
        due,
      },
    ]
  })
  const base = { queue: [], comingUp: false, suggestion, completedIds }
  if (enriched.length === 0) return { ...base, state: 'empty', slots: [] }
  const remaining = enriched.filter((s) => !completedIds.has(s.id))
  if (remaining.length === 0) return { ...base, state: 'done', slots: enriched }

  const { queue: ordered, comingUp } = orderByWindow(
    remaining,
    now,
    enriched.filter((s) => !s.office).map((s) => s.due),
  )
  const queue = ordered.map((s) => withHourTitle(s, s.office ? hour : Math.floor(s.due / 60) % 24))
  if (queue.length === 0) return { ...base, state: 'rest', slots: enriched }
  return {
    ...base,
    state: 'next',
    next: queue[0],
    queue,
    comingUp,
    slots: enriched,
  }
}

const blockTones: Record<TimeBlock, BlockTone> = {
  morning: { from: '#8B6914', to: '#352608' },
  daytime: { from: '#1E4A32', to: '#0C2418' },
  evening: { from: '#1E3A5C', to: '#0A1626' },
  flexible: { from: '#2E3A4A', to: '#11161E' },
}

const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const dayArt = (): ImageSource => ({
  uri: hearthUrl(`art/dies-${weekdays[new Date().getDay()]}.jpg`),
})

// ── Entry ───────────────────────────────────────────────────────────────────

/**
 * What the "Pray now" card would show, or undefined when there is nothing to
 * pray: the card never rests on "all done" or "nothing now" — it just isn't
 * there, and the carousel starts with its next card.
 */
export function usePrayNow({
  slots,
  completedIds,
  onPray,
}: {
  slots: SlotState[]
  completedIds: Set<string>
  onPray: (item: ChecklistItem) => void
}): VariantProps | undefined {
  const { t } = useTranslation()
  const router = useRouter()
  const plan = usePrototype((st) => st.plan)
  const templateId = (templateIds as readonly string[]).includes(plan) ? plan : undefined
  const { data: template } = useTemplateManifest(templateId)
  const date = format(useToday(), 'yyyy-MM-dd')
  const fromTemplate = filterSlotsForDate(
    templateSlots(templateId ? (template ?? undefined) : undefined),
    date,
  )
  const effectiveSlots = templateId ? fromTemplate : plan === 'empty' ? [] : slots
  const effectiveDone = templateId
    ? new Set<string>()
    : plan === 'all done'
      ? new Set(slots.map((s) => s.id))
      : completedIds
  const prayedToday = useEventStore(
    useShallow((st) =>
      resolveCompletions(st.completionsByDate.get(date), st.completions).map((c) => c.practice_id),
    ),
  )
  useCandidateFlows(effectiveSlots)
  // Re-pick as deferred manifests (minutes) warm in.
  useCatalogVersion()
  const clock = usePrototype((st) => st.clock)
  const wall = new Date()
  const now =
    clock === 'live'
      ? dayMinutes(`${wall.getHours()}:${wall.getMinutes()}`)
      : dayMinutes(`${clock}:00`)
  const hour = Math.floor(now / 60) % 24
  const currentBlock = getCurrentTimeBlock(hour)
  const fromPlan = pickPrayNow(effectiveSlots, effectiveDone, now, t)
  // Nothing timed in the plan (or no plan): offer the backbone instead.
  const pick =
    fromPlan.state === 'empty'
      ? pickPrayNow(backboneSlots(), backboneDone(prayedToday), now, t, true)
      : fromPlan
  // A template's or the backbone's slot isn't the user's: open the practice
  // without a slot, so praying it never logs against a slot that isn't there.
  const pray = (item: ChecklistItem) =>
    templateId || pick.suggestion
      ? router.push({ pathname: '/pray/[practiceId]', params: { practiceId: item.practice_id } })
      : onPray(item)
  if (pick.state !== 'next') return undefined
  return { pick, currentBlock, hour, onPray: pray }
}

export function PrayNowPrototype(props: VariantProps) {
  const variant = usePrototype((st) => st.variant)
  if (variant === 'E') return <Sketch {...props} />
  if (variant === 'F') return <Vigil {...props} />
  if (variant === 'G') return <HolyCard {...props} />
  if (variant === 'H') return <Ordo {...props} />
  if (variant === 'I') return <Leaf {...props} />
  if (variant === 'J') return <Initial {...props} />
  if (variant === 'K') return <Hours {...props} />
  if (variant === 'L') return <JewelLeaf {...props} />
  if (variant === 'M') return <UpNext {...props} />
  if (variant === 'B') return <Litany {...props} />
  if (variant === 'C') return <TimeYouHave {...props} />
  if (variant === 'D') return <RosaryRing {...props} />
  return <Painting {...props} />
}

export type VariantProps = {
  pick: Pick
  currentBlock: TimeBlock
  hour: number
  onPray: (item: ChecklistItem) => void
}

function Frame({ tone, children }: { tone: BlockTone; children: React.ReactNode }) {
  return (
    <YStack height={340} borderRadius={18} overflow="hidden" backgroundColor={tone.from}>
      {children}
    </YStack>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="marker" textAlign="left" color={blockLabelInk} fontSize="$1">
      {children}
    </Typography>
  )
}

function useLabels(pick: Pick, currentBlock: TimeBlock) {
  const { t } = useTranslation()
  const block = pick.next?.time_block ?? currentBlock
  return {
    label: pick.comingUp
      ? `Coming up · ${t(`timeBlock.${block}`)}`
      : `Pray now · ${t(`timeBlock.${block}`)}`,
    tierLabel: pick.next ? t(`tier.${pick.next.tier}`) : '',
    progress: `${pick.slots.filter((s) => pick.completedIds.has(s.id)).length} of ${pick.slots.length} today`,
  }
}

function Resting({ pick, tone }: { pick: Pick; tone: BlockTone }) {
  return (
    <Frame tone={tone}>
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$lg" gap="$sm">
        <Text fontFamily="$heading" fontSize={28} color={blockLabelInk}>
          ✠
        </Text>
        <Typography variant="sacred-title" color={blockInk} fontSize={30} lineHeight={36}>
          {pick.state === 'done' ? 'Pax Christi.' : 'Pray now'}
        </Typography>
        <Typography variant="whisper" color="rgba(245,239,226,0.82)" textAlign="center">
          {pick.state === 'done'
            ? 'Your rule is kept for today. Rest in Him — or say one aspiration more.'
            : 'Build a rule of life and this card will always know what comes next.'}
        </Typography>
      </YStack>
    </Frame>
  )
}

// ── A · Painting ────────────────────────────────────────────────────────────
// Same body as the other feature blocks: art, lower-third caption. The one
// next practice; everything else is a whisper.

function Painting({ pick, currentBlock, onPray }: VariantProps) {
  const { label, tierLabel, progress } = useLabels(pick, currentBlock)
  const tone = blockTones[pick.next?.time_block ?? currentBlock]
  if (!pick.next) return <Resting pick={pick} tone={tone} />
  const next = pick.next
  const meta = [next.minutes ? `${next.minutes} min` : undefined, tierLabel, progress]
    .filter(Boolean)
    .join(' · ')
  return (
    <AnimatedPressable
      onPress={() => onPray(next)}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${next.name}`}
    >
      <Frame tone={tone}>
        <Image source={dayArt()} style={StyleSheet.absoluteFill} contentFit="cover" />
        <YStack flex={1} justifyContent="flex-end">
          <YStack padding="$lg" gap="$xs" backgroundColor="rgba(0,0,0,0.45)">
            <Label>{label}</Label>
            <Typography
              variant="sacred-title"
              textAlign="left"
              color={blockInk}
              fontSize={30}
              lineHeight={34}
              numberOfLines={2}
            >
              {next.name}
            </Typography>
            {next.subtitle && (
              <Typography variant="whisper" color="rgba(245,239,226,0.82)" numberOfLines={1}>
                {next.subtitle}
              </Typography>
            )}
            <Typography variant="whisper" color="rgba(245,239,226,0.7)" fontSize="$1">
              {meta}
            </Typography>
          </YStack>
        </YStack>
      </Frame>
    </AnimatedPressable>
  )
}

// ── B · Litany ──────────────────────────────────────────────────────────────
// No art. The hour's name as headline, then the queue as a short litany — the
// first line in gold with a cross, the rest tappable beneath it. You see what
// comes after, not just what's next.

function Litany({ pick, currentBlock, onPray }: VariantProps) {
  const { t } = useTranslation()
  const block = pick.next?.time_block ?? currentBlock
  const tone = blockTones[block]
  if (!pick.next) return <Resting pick={pick} tone={tone} />
  const done = pick.slots.filter((s) => pick.completedIds.has(s.id)).length
  return (
    <Frame tone={tone}>
      <YStack flex={1} padding="$lg" gap="$md">
        <Label>{pick.comingUp ? 'Coming up' : 'Pray now'}</Label>
        <Typography
          variant="screen-title"
          textAlign="left"
          color={blockInk}
          fontSize={40}
          lineHeight={46}
        >
          {t(`timeBlock.${block}`)}
        </Typography>
        <YStack gap="$sm" flex={1}>
          {pick.queue.slice(0, 4).map((item, i) => (
            <Pressable
              key={item.id}
              onPress={() => onPray(item)}
              accessibilityRole="button"
              accessibilityLabel={item.name}
            >
              <XStack alignItems="baseline" gap="$sm">
                <Text
                  width={18}
                  fontFamily="$heading"
                  fontSize={i === 0 ? 16 : 12}
                  color={i === 0 ? blockLabelInk : 'rgba(245,239,226,0.4)'}
                >
                  {i === 0 ? '✠' : '·'}
                </Text>
                <Typography
                  variant={i === 0 ? 'sacred-title' : 'interface'}
                  textAlign="left"
                  color={i === 0 ? blockInk : 'rgba(245,239,226,0.72)'}
                  fontSize={i === 0 ? 24 : 17}
                  numberOfLines={1}
                  flex={1}
                >
                  {item.name}
                </Typography>
                {item.minutes && (
                  <Typography color="rgba(245,239,226,0.55)" fontSize="$1">
                    {item.minutes}′
                  </Typography>
                )}
              </XStack>
            </Pressable>
          ))}
        </YStack>
        <XStack gap={6} aria-hidden importantForAccessibility="no-hide-descendants">
          {pick.slots.map((s, i) => (
            <Text
              key={s.id}
              fontFamily="$heading"
              fontSize={11}
              color={i < done ? blockLabelInk : 'rgba(245,239,226,0.25)'}
            >
              ✠
            </Text>
          ))}
        </XStack>
      </YStack>
    </Frame>
  )
}

// ── C · The time you have ───────────────────────────────────────────────────
// Answers a different question: not "what's next" but "what fits". Three
// rows — a moment, a while, the long one — each the best owed practice that
// fits in it. Big numerals carry the choice; no buttons.

function TimeYouHave({ pick, currentBlock, onPray }: VariantProps) {
  const tone = blockTones[pick.next?.time_block ?? currentBlock]
  if (!pick.next) return <Resting pick={pick} tone={tone} />
  const buckets = [
    { max: 5, label: 'a moment' },
    { max: 15, label: 'a while' },
    { max: Number.POSITIVE_INFINITY, label: 'unhurried' },
  ]
  const used = new Set<string>()
  const rows = buckets.flatMap(({ max, label }) => {
    const fit = pick.queue.find((s) => !used.has(s.id) && (s.minutes ?? 10) <= max)
    if (!fit) return []
    used.add(fit.id)
    return [{ label, item: fit, minutes: fit.minutes }]
  })
  return (
    <Frame tone={tone}>
      <YStack flex={1} padding="$lg" gap="$md">
        <Label>Pray now</Label>
        <Typography
          variant="section-title"
          textAlign="left"
          color={blockInk}
          fontSize={28}
          lineHeight={34}
        >
          How long do you have?
        </Typography>
        <YStack flex={1} justifyContent="space-evenly">
          {rows.map(({ label, item, minutes }) => (
            <Pressable
              key={item.id}
              onPress={() => onPray(item)}
              accessibilityRole="button"
              accessibilityLabel={`${label}: ${item.name}`}
            >
              <XStack alignItems="center" gap="$md">
                <YStack width={64} alignItems="flex-end">
                  <Text fontFamily="$title" fontSize={34} lineHeight={46} color={blockLabelInk}>
                    {minutes ?? '–'}
                  </Text>
                </YStack>
                <YStack flex={1}>
                  <Typography color="rgba(245,239,226,0.6)" fontSize="$1" letterSpacing={1}>
                    {minutes ? 'min · ' : ''}
                    {label}
                  </Typography>
                  <Typography
                    variant="sacred-title"
                    textAlign="left"
                    color={blockInk}
                    fontSize={21}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Typography>
                </YStack>
              </XStack>
            </Pressable>
          ))}
        </YStack>
      </YStack>
    </Frame>
  )
}

// ── D · Rosary ring ─────────────────────────────────────────────────────────
// The whole day as a chaplet: one bead per practice, gold when prayed, the
// next one lit. The practice sits in the middle of the ring.

function RosaryRing({ pick, currentBlock, onPray }: VariantProps) {
  const { label } = useLabels(pick, currentBlock)
  const tone = blockTones[pick.next?.time_block ?? currentBlock]
  if (!pick.next) return <Resting pick={pick} tone={tone} />
  const next = pick.next
  const size = 220
  const r = 96
  const n = pick.slots.length
  const done = pick.slots.filter((s) => pick.completedIds.has(s.id)).length
  return (
    <AnimatedPressable
      onPress={() => onPray(next)}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${next.name}`}
    >
      <Frame tone={tone}>
        <YStack flex={1} padding="$lg" alignItems="center">
          <Label>{label}</Label>
          <View width={size} height={size} marginTop="$sm">
            <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="rgba(245,239,226,0.18)"
                strokeWidth={1}
                fill="none"
              />
              {pick.slots.map((s, i) => {
                const a = -Math.PI / 2 + (i / n) * Math.PI * 2
                const isDone = pick.completedIds.has(s.id)
                const isNext = s.id === next.id
                return (
                  <Circle
                    key={s.id}
                    cx={size / 2 + r * Math.cos(a)}
                    cy={size / 2 + r * Math.sin(a)}
                    r={isNext ? 9 : 6}
                    fill={isDone ? blockLabelInk : isNext ? blockInk : tone.to}
                    stroke={isNext ? blockLabelInk : 'rgba(245,239,226,0.5)'}
                    strokeWidth={isNext ? 3 : 1}
                  />
                )
              })}
            </Svg>
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingHorizontal={40}
              gap={4}
            >
              <PracticeIcon name={next.icon} size={26} />
              <Typography
                variant="sacred-title"
                color={blockInk}
                fontSize={22}
                lineHeight={26}
                numberOfLines={3}
              >
                {next.name}
              </Typography>
              {next.minutes && (
                <Typography color="rgba(245,239,226,0.6)" fontSize="$1">
                  {next.minutes} min
                </Typography>
              )}
            </YStack>
          </View>
          <Typography color="rgba(245,239,226,0.7)" fontSize="$1" marginTop="$sm">
            {done} of {n} beads today
          </Typography>
        </YStack>
      </Frame>
    </AnimatedPressable>
  )
}

// ── E · Sketch ──────────────────────────────────────────────────────────────
// Gustavo's sketch: PRAY NOW, the best next practice large, a rule, then the
// runner-up on the left and the day plan on the right — over a painting chosen
// by the hour (or by the practice's subject).

function Sketch({ pick, currentBlock, hour, onPray }: VariantProps) {
  const { t } = useTranslation()
  const art = usePrototype((st) => st.art)
  const next = pick.next
  const image = artForPick(art, next, hour, pick.comingUp)
  const meta = next
    ? [
        next.minutes ? t('explore.prayNow.minutes', { count: next.minutes }) : undefined,
        t(`tier.${next.tier}`),
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined
  const block = t(
    // An office's own time is just its default slot; it belongs to the hour now.
    `timeBlock.${next && !next.office && next.time_block !== 'flexible' ? next.time_block : currentBlock}`,
  )
  const hero = (
    <YStack height={340} borderRadius={18} overflow="hidden" backgroundColor="#1a1410">
      {/* Every painting stays mounted and only the chosen one is opaque: expo-image
          never painted a bundled source requested for the first time mid-session
          (a swap left the old painting up, a remount left the card blank). */}
      {uniqueSources([...Object.values(hourArt), image]).map((source) => (
        <Image
          key={typeof source === 'number' ? source : JSON.stringify(source)}
          source={source}
          style={[StyleSheet.absoluteFill, { opacity: sameSource(source, image) ? 1 : 0 }]}
          contentFit="cover"
        />
      ))}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0.55" />
            <Stop offset="0.28" stopColor="#000" stopOpacity="0.05" />
            <Stop offset="0.55" stopColor="#000" stopOpacity="0.25" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#scrim)" />
      </Svg>

      <XStack padding="$lg" paddingBottom={0} justifyContent="space-between" alignItems="baseline">
        <YStack>
          <Typography variant="marker" textAlign="left" color={blockLabelInk} fontSize="$1">
            {t(pick.comingUp ? 'explore.prayNow.comingUp' : 'explore.prayNow.label')}
          </Typography>
          <View height={1} marginTop={4} backgroundColor={blockLabelInk} opacity={0.7} />
        </YStack>
        <Typography variant="marker" color="rgba(245,239,226,0.7)" fontSize="$1">
          {block}
        </Typography>
      </XStack>

      {/* The whole upper field is the primary target, not just the title. */}
      {next ? (
        <AnimatedPressable
          style={{ flex: 1 }}
          onPress={() => onPray(next)}
          accessibilityRole="button"
          accessibilityLabel={`${t('explore.prayNow.label')}: ${next.name}`}
        >
          <YStack flex={1} justifyContent="flex-end" paddingHorizontal="$lg" paddingBottom="$md">
            <XStack alignItems="flex-end" gap="$md">
              <YStack flex={1} flexShrink={1} minWidth={0} gap={2}>
                <Typography
                  variant="sacred-title"
                  textAlign="left"
                  color={blockInk}
                  // Long names ("Oferecimento Matinal — Renovação…") step down
                  // a size rather than lose their ending.
                  fontSize={next.name.length > 24 ? 29 : 36}
                  lineHeight={next.name.length > 24 ? 34 : 42}
                  numberOfLines={3}
                >
                  {next.name}
                </Typography>
                <Typography color="rgba(245,239,226,0.78)" fontSize="$2">
                  {[next.subtitle, meta].filter(Boolean).join(' · ')}
                </Typography>
              </YStack>
            </XStack>
          </YStack>
        </AnimatedPressable>
      ) : (
        <YStack
          flex={1}
          justifyContent="flex-end"
          paddingHorizontal="$lg"
          paddingBottom="$md"
          gap={2}
        >
          <Typography
            variant="sacred-title"
            textAlign="left"
            color={blockInk}
            fontSize={36}
            lineHeight={42}
          >
            {t(pick.state === 'done' ? 'explore.prayNow.doneTitle' : 'explore.prayNow.emptyTitle')}
          </Typography>
          <Typography color="rgba(245,239,226,0.78)" fontSize="$2">
            {t(pick.state === 'done' ? 'explore.prayNow.doneBody' : 'explore.prayNow.emptyBody')}
          </Typography>
        </YStack>
      )}
    </YStack>
  )

  return hero
}

// ── F–I · The cover idiom ───────────────────────────────────────────────────
// The generated practice covers (features/covers, docs/design/cover-sketches)
// at hero size: the practice due now in its own tone and icon, so the card is
// the same object as its tile in the library.

function useCoverCopy({ pick, currentBlock }: VariantProps) {
  const { t } = useTranslation()
  const next = pick.next
  const marker = t(
    pick.suggestion
      ? 'explore.prayNow.suggestion'
      : pick.comingUp
        ? 'explore.prayNow.comingUp'
        : 'explore.prayNow.label',
  )
  const resting = pick.state === 'next' ? 'empty' : pick.state
  return {
    next,
    // Keyed like the library tile (full catalog id), so it's the same color.
    tone: next
      ? toneForKey(
          next.practice_id.includes('/') ? next.practice_id : `practice/${next.practice_id}`,
        )
      : blockTones[currentBlock],
    icon: next?.icon ?? 'prayer',
    marker,
    // Coming up says when; otherwise the part of the day it belongs to (a
    // missed Morning Offering at 13h still reads "Manhã").
    block:
      pick.comingUp && next
        ? clockOf(next.due)
        : t(
            `timeBlock.${next && !next.office && next.time_block !== 'flexible' ? next.time_block : currentBlock}`,
          ),
    title: next ? next.name : t(`explore.prayNow.${resting}Title`),
    subtitle: next ? next.subtitle : t(`explore.prayNow.${resting}Body`),
    cadence: next
      ? [
          next.minutes ? t('explore.prayNow.minutes', { count: next.minutes }) : undefined,
          pick.suggestion ? undefined : t(`tier.${next.tier}`),
        ]
          .filter(Boolean)
          .join(' · ')
      : undefined,
    a11y: next ? `${marker}: ${next.name}` : marker,
  }
}

const heroHeight = 340
const titleSize = (title: string) => (title.length > 24 ? 28 : 34)

/** The whole card is one target; resting states aren't pressable. */
function Tap({
  next,
  onPray,
  a11y,
  children,
  height = heroHeight,
}: {
  next: Enriched | undefined
  onPray: (item: ChecklistItem) => void
  a11y: string
  children: React.ReactNode
  height?: number | '100%'
}) {
  if (!next) return <View height={height}>{children}</View>
  return (
    <AnimatedPressable
      style={{ height }}
      onPress={() => onPray(next)}
      accessibilityRole="button"
      accessibilityLabel={a11y}
    >
      {children}
    </AnimatedPressable>
  )
}

function Caps({
  children,
  color,
  size = 11,
  opacity = 1,
}: {
  children: React.ReactNode
  color: string
  size?: number
  opacity?: number
}) {
  return (
    <CoverText
      lines={1}
      style={{
        fontFamily: coverFonts.caps,
        fontSize: size,
        letterSpacing: size * 0.2,
        color,
        opacity,
      }}
    >
      {String(children).toUpperCase()}
    </CoverText>
  )
}

function useWidth() {
  const [width, setWidth] = useState(0)
  return [width, (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)] as const
}

// ── F · Vigil ───────────────────────────────────────────────────────────────
// The sketch the README kept for "the practice due now": the tone's field with
// an ember glow behind the icon, a lamp kept burning.

function Vigil(props: VariantProps) {
  const c = useCoverCopy(props)
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} borderRadius={18} overflow="hidden">
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <ToneGradient id="vigil-tone" tone={c.tone} />
            <RadialGradient id="vigil-glow" cx="50%" cy="38%" rx="42%" ry="42%">
              <Stop offset="0" stopColor="#F2B84B" stopOpacity={0.55} />
              <Stop offset="0.45" stopColor="#E08A2E" stopOpacity={0.18} />
              <Stop offset="1" stopColor="#E08A2E" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#vigil-tone)" />
        </Svg>
        <XStack padding="$lg" justifyContent="space-between">
          <Caps color={coverInk.gold}>{c.marker}</Caps>
          <Caps color={coverInk.cream} opacity={0.7}>
            {c.block}
          </Caps>
        </XStack>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={14} paddingBottom={28}>
          <PracticeIcon name={c.icon} size={64} />
          <YStack alignItems="center" gap={8} paddingHorizontal="$xl">
            <CoverText
              lines={3}
              style={{
                fontFamily: coverFonts.title,
                fontSize: titleSize(c.title),
                lineHeight: titleSize(c.title) * 1.15,
                color: coverInk.cream,
                textAlign: 'center',
              }}
            >
              {c.title}
            </CoverText>
            {c.subtitle && !c.cadence && (
              <Typography color="rgba(245,239,226,0.8)" fontSize="$2" textAlign="center">
                {c.subtitle}
              </Typography>
            )}
            {c.cadence && (
              <Caps color={coverInk.cream} opacity={0.72}>
                {[c.subtitle, c.cadence].filter(Boolean).join(' · ')}
              </Caps>
            )}
          </YStack>
        </YStack>
      </View>
    </Tap>
  )
}

// ── G · Colored holy card ───────────────────────────────────────────────────
// The practice tile itself, grown to the carousel: lace edge, colored stock,
// the double cream rule.

function HolyCard(props: VariantProps) {
  const c = useCoverCopy(props)
  const [w, onLayout] = useWidth()
  const h = heroHeight
  // LaceRect draws in viewBox units (a dot every ~5.6); halve the card so the
  // scallops are ~11pt, like the tile's at its usual size.
  const k = 2
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} onLayout={onLayout}>
        {w > 0 && (
          <Svg
            width={w}
            height={h}
            viewBox={`0 0 ${w / k} ${h / k}`}
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <ToneGradient id="holy-tone" tone={c.tone} />
            </Defs>
            <LaceRect x={0} y={0} w={w / k} h={h / k} color={c.tone.from} />
            <Rect
              x={5}
              y={5}
              width={w / k - 10}
              height={h / k - 10}
              rx={1.5}
              fill="url(#holy-tone)"
            />
            <Rect
              x={12}
              y={12}
              width={w / k - 24}
              height={h / k - 24}
              rx={2}
              fill="none"
              stroke="rgba(245,239,226,0.7)"
              strokeWidth={0.6}
            />
            <Rect
              x={15}
              y={15}
              width={w / k - 30}
              height={h / k - 30}
              rx={1.5}
              fill="none"
              stroke="rgba(245,239,226,0.28)"
              strokeWidth={0.5}
            />
          </Svg>
        )}
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap={12}
          paddingHorizontal={52}
        >
          <Caps color={coverInk.gold}>{`${c.marker} · ${c.block}`}</Caps>
          <PracticeIcon name={c.icon} size={40} />
          <CoverText
            lines={3}
            style={{
              fontFamily: coverFonts.title,
              fontSize: titleSize(c.title),
              lineHeight: titleSize(c.title) * 1.15,
              color: coverInk.cream,
              textAlign: 'center',
            }}
          >
            {c.title}
          </CoverText>
          <Caps color={coverInk.cream} opacity={0.72} size={10}>
            {[c.subtitle, c.cadence].filter(Boolean).join(' · ')}
          </Caps>
        </YStack>
      </View>
    </Tap>
  )
}

// ── H · Ordo ────────────────────────────────────────────────────────────────
// A page of the Ordo: the hour in a colored heading, the practice in black on
// cream, the time in rubric red. The README's "the day's schedule" object.

function Ordo(props: VariantProps) {
  const c = useCoverCopy(props)
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} borderRadius={10} overflow="hidden" backgroundColor={coverInk.paper}>
        <View height={96}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <ToneGradient id="ordo-tone" tone={c.tone} />
            </Defs>
            <Rect width="100%" height="100%" fill="url(#ordo-tone)" />
          </Svg>
          <XStack flex={1} alignItems="center" paddingHorizontal="$lg" gap={14}>
            <PracticeIcon name={c.icon} size={34} />
            <YStack gap={4} flex={1}>
              <Caps color={coverInk.gold} size={12}>
                {c.marker}
              </Caps>
              <Caps color={coverInk.cream} opacity={0.8}>
                {c.block}
              </Caps>
            </YStack>
          </XStack>
          <View height={2} backgroundColor={coverInk.gold} opacity={0.8} />
        </View>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
          <Defs>
            <LinearGradient id="ordo-page" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={coverInk.paper} stopOpacity={0} />
              <Stop offset="1" stopColor={coverInk.paperDeep} stopOpacity={0.9} />
            </LinearGradient>
          </Defs>
          <Rect y={98} width="100%" height="100%" fill="url(#ordo-page)" />
        </Svg>
        <YStack flex={1} padding="$lg" justifyContent="space-between">
          <YStack gap={6}>
            <CoverText
              lines={3}
              style={{
                fontFamily: coverFonts.title,
                fontSize: titleSize(c.title),
                lineHeight: titleSize(c.title) * 1.15,
                color: coverInk.text,
              }}
            >
              {c.title}
            </CoverText>
            {c.subtitle && (
              <CoverText
                lines={2}
                style={{ fontFamily: coverFonts.italic, fontSize: 17, color: coverInk.textSoft }}
              >
                {c.subtitle}
              </CoverText>
            )}
          </YStack>
          <XStack justifyContent="space-between" alignItems="center">
            <Caps color={coverInk.rubric}>{c.cadence ?? ''}</Caps>
            <Glyph kind="pattee" size={18} color={coverInk.rubric} />
          </XStack>
        </YStack>
      </View>
    </Tap>
  )
}

// ── I · Illuminated leaf ────────────────────────────────────────────────────
// A vellum page with a miniature — here the hour's painting, framed in gold —
// the title in ink below and the time in rubric. Joins the painted card (E)
// to the paper covers.

function Leaf(props: VariantProps) {
  const c = useCoverCopy(props)
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} borderRadius={10} overflow="hidden">
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="leaf-vellum" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={coverInk.vellum} />
              <Stop offset="1" stopColor="#EFE3C9" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#leaf-vellum)" />
        </Svg>
        <View
          margin={16}
          marginBottom={0}
          height={176}
          borderWidth={2}
          borderColor="#B8913A"
          padding={3}
          backgroundColor={c.tone.to}
        >
          <View flex={1} borderWidth={1} borderColor="rgba(184,145,58,0.6)" overflow="hidden">
            <Field id="leaf" tone={c.tone} icon={c.icon} />
          </View>
        </View>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap={6}
          paddingHorizontal="$lg"
        >
          <Caps color={coverInk.rubric} size={10}>
            {`${c.marker} · ${c.block}`}
          </Caps>
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.title,
              fontSize: titleSize(c.title) - 4,
              lineHeight: (titleSize(c.title) - 4) * 1.15,
              color: coverInk.text,
              textAlign: 'center',
            }}
          >
            {c.title}
          </CoverText>
          <Caps color={coverInk.rubric} size={10} opacity={0.85}>
            {[c.subtitle, c.cadence].filter(Boolean).join(' · ')}
          </Caps>
        </YStack>
      </View>
    </Tap>
  )
}

/**
 * The miniature without a picture: the practice's jewel tone diapered in gold
 * — the lattice illuminators laid behind a figure or an initial — with the
 * icon set flat in the middle — no glow.
 */
function Field({
  id,
  tone,
  icon,
  iconSize = 52,
}: {
  id: string
  tone: BlockTone
  icon?: string
  iconSize?: number
}) {
  return (
    <>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <ToneGradient id={`${id}-tone`} tone={tone} />
          <Pattern id={`${id}-diaper`} width={16} height={16} patternUnits="userSpaceOnUse">
            <Path
              d="M8 0 L16 8 L8 16 L0 8 Z"
              fill="none"
              stroke={leafGold}
              strokeOpacity={0.3}
              strokeWidth={0.7}
            />
            <Circle cx={8} cy={8} r={1.1} fill={leafGold} fillOpacity={0.5} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id}-tone)`} />
        <Rect width="100%" height="100%" fill={`url(#${id}-diaper)`} />
      </Svg>
      {icon && (
        <View style={StyleSheet.absoluteFill} alignItems="center" justifyContent="center">
          <PracticeIcon name={icon} size={iconSize} />
        </View>
      )}
    </>
  )
}

const leafGold = '#B8913A'

function Vellum({ id }: { id: string }) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={coverInk.vellum} />
          <Stop offset="1" stopColor="#EFE3C9" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  )
}

// ── J · Historiated initial ─────────────────────────────────────────────────
// The opening of an office in a Book of Hours: a gilt square holding the
// scene, the title's initial drawn over it, the text set beside and a few
// ruled lines of the page running on below.

function Initial(props: VariantProps) {
  const c = useCoverCopy(props)
  const initial = Array.from(c.title.trim())[0] ?? 'O'
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} borderRadius={10} overflow="hidden">
        <Vellum id="initial-vellum" />
        <YStack flex={1} padding={20} gap={14}>
          <YStack gap={6}>
            <Caps color={coverInk.rubric} size={10}>{`${c.marker} · ${c.block}`}</Caps>
            <View height={1} backgroundColor={coverInk.rubric} opacity={0.6} />
          </YStack>
          <XStack gap={16}>
            <View
              width={112}
              height={112}
              borderWidth={2}
              borderColor={leafGold}
              padding={3}
              backgroundColor={c.tone.to}
            >
              <View flex={1} overflow="hidden" borderWidth={1} borderColor="rgba(184,145,58,0.6)">
                <Field id="initial" tone={c.tone} />
                <View style={StyleSheet.absoluteFill} alignItems="center" justifyContent="center">
                  <CoverText
                    style={{
                      fontFamily: coverFonts.blackletter,
                      fontSize: 78,
                      lineHeight: 88,
                      color: '#F2D27A',
                      textShadowColor: 'rgba(0,0,0,0.7)',
                      textShadowRadius: 6,
                    }}
                  >
                    {initial}
                  </CoverText>
                </View>
              </View>
            </View>
            <YStack flex={1} gap={6} justifyContent="center">
              <CoverText
                lines={4}
                style={{
                  fontFamily: coverFonts.title,
                  fontSize: c.title.length > 24 ? 20 : 25,
                  lineHeight: (c.title.length > 24 ? 20 : 25) * 1.18,
                  color: coverInk.text,
                }}
              >
                {c.title}
              </CoverText>
              {c.subtitle && (
                <CoverText
                  lines={2}
                  style={{ fontFamily: coverFonts.italic, fontSize: 16, color: coverInk.textSoft }}
                >
                  {c.subtitle}
                </CoverText>
              )}
            </YStack>
          </XStack>
          <YStack gap={9} marginTop={4}>
            {[1, 0.94, 0.62].map((f) => (
              <View
                key={f}
                height={5}
                width={`${f * 100}%`}
                borderRadius={3}
                backgroundColor={coverInk.text}
                opacity={0.12}
              />
            ))}
          </YStack>
          <XStack flex={1} alignItems="flex-end" justifyContent="space-between">
            <Caps color={coverInk.rubric}>{c.cadence ?? ''}</Caps>
            <Glyph kind="pattee" size={16} color={coverInk.rubric} />
          </XStack>
        </YStack>
      </View>
    </Tap>
  )
}

// ── K · Book of Hours page ──────────────────────────────────────────────────
// A full-page miniature under a round arch, inside a ruled margin with gilt
// stars at the corners; the title below like the rubric under the picture.

function Hours(props: VariantProps) {
  const c = useCoverCopy(props)
  const archWidth = 210
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} borderRadius={10} overflow="hidden">
        <Vellum id="hours-vellum" />
        <View
          style={StyleSheet.absoluteFill}
          margin={10}
          borderWidth={1.5}
          borderColor={leafGold}
        />
        <View
          style={StyleSheet.absoluteFill}
          margin={15}
          borderWidth={1}
          borderColor={c.tone.from}
          opacity={0.55}
        />
        {(
          [
            { top: 4, left: 4 },
            { top: 4, right: 4 },
            { bottom: 4, left: 4 },
            { bottom: 4, right: 4 },
          ] as const
        ).map((pos) => (
          <View key={JSON.stringify(pos)} position="absolute" {...pos}>
            <Glyph kind="star" size={13} color={leafGold} />
          </View>
        ))}
        <YStack flex={1} alignItems="center" paddingTop={26} paddingHorizontal={30} gap={10}>
          <View
            width={archWidth}
            height={180}
            borderTopLeftRadius={archWidth / 2}
            borderTopRightRadius={archWidth / 2}
            borderWidth={2}
            borderColor={leafGold}
            padding={3}
            backgroundColor={c.tone.to}
          >
            <View
              flex={1}
              overflow="hidden"
              borderTopLeftRadius={archWidth / 2 - 4}
              borderTopRightRadius={archWidth / 2 - 4}
            >
              <Field id="hours" tone={c.tone} icon={c.icon} iconSize={60} />
            </View>
          </View>
          <YStack alignItems="center" gap={4}>
            <CoverText
              lines={2}
              style={{
                fontFamily: coverFonts.title,
                fontSize: titleSize(c.title) - 6,
                lineHeight: (titleSize(c.title) - 6) * 1.15,
                color: coverInk.text,
                textAlign: 'center',
              }}
            >
              {c.title}
            </CoverText>
            <Caps color={coverInk.rubric} size={10}>{`${c.marker} · ${c.block}`}</Caps>
            <Caps color={coverInk.textSoft} size={9} opacity={0.85}>
              {[c.subtitle, c.cadence].filter(Boolean).join(' · ')}
            </Caps>
          </YStack>
        </YStack>
      </View>
    </Tap>
  )
}

// ── L · Jewel leaf ──────────────────────────────────────────────────────────
// I on the practice's colored stock instead of vellum — the leaf as the
// practice tile's sibling rather than the prayer card's.

function JewelLeaf(props: VariantProps) {
  const c = useCoverCopy(props)
  return (
    <Tap next={c.next} onPray={props.onPray} a11y={c.a11y}>
      <View flex={1} borderRadius={10} overflow="hidden">
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <ToneGradient id="jewel-tone" tone={c.tone} />
          </Defs>
          <Rect width="100%" height="100%" fill="url(#jewel-tone)" />
        </Svg>
        <View
          style={StyleSheet.absoluteFill}
          margin={8}
          borderWidth={1}
          borderColor="rgba(245,239,226,0.28)"
          borderRadius={6}
        />
        <View
          margin={18}
          marginBottom={0}
          height={176}
          borderWidth={2}
          borderColor={leafGold}
          padding={3}
          backgroundColor={c.tone.to}
        >
          <View flex={1} borderWidth={1} borderColor="rgba(184,145,58,0.6)" overflow="hidden">
            {/* A shade deeper than the stock, so the miniature reads as set in. */}
            <Field
              id="jewel"
              tone={{ from: c.tone.to, to: mixHex(c.tone.to, '#000000', 0.55) }}
              icon={c.icon}
            />
          </View>
        </View>
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap={6}
          paddingHorizontal="$lg"
        >
          <Caps color={coverInk.gold} size={10}>{`${c.marker} · ${c.block}`}</Caps>
          <CoverText
            lines={2}
            style={{
              fontFamily: coverFonts.title,
              fontSize: titleSize(c.title) - 4,
              lineHeight: (titleSize(c.title) - 4) * 1.15,
              color: coverInk.cream,
              textAlign: 'center',
            }}
          >
            {c.title}
          </CoverText>
          <Caps color={coverInk.cream} size={10} opacity={0.72}>
            {[c.subtitle, c.cadence].filter(Boolean).join(' · ')}
          </Caps>
        </YStack>
      </View>
    </Tap>
  )
}

// ── M · Up next ─────────────────────────────────────────────────────────────
// After Apple Podcasts' Up Next: a card tinted from the item's own color, the
// item's real cover centered on top (its painting, or the holy card / book it
// draws in the library), then a quiet label, the title, a few lines of what it
// is, and the time it takes.

const crossNudge = 2

function UpNext(props: VariantProps) {
  const { t } = useTranslation()
  const c = useCoverCopy(props)
  const next = c.next
  const ref = next
    ? next.practice_id.includes('/')
      ? next.practice_id
      : `practice/${next.practice_id}`
    : undefined
  const manifest = next ? getManifest(next.practice_id) : undefined
  const entry = ref ? getEntry(ref) : undefined
  // The cover names the practice; an office's card title is the hour.
  const coverTitle = manifest ? localizeContent(manifest.name) : (next?.subtitle ?? c.title)
  const image = artFor(ref)
  const cover = entry ? coverFor(entry) : undefined
  const description = manifest?.description ? localizeContent(manifest.description) : undefined
  const [w, onLayout] = useWidth()
  // Everything scales off the card's width, which the carousel sets.
  const coverSize = Math.round(w * 0.6)
  return (
    <Tap next={next} onPray={props.onPray} a11y={c.a11y} height="100%">
      <YStack
        flex={1}
        onLayout={onLayout}
        borderRadius={16}
        overflow="hidden"
        backgroundColor={mixHex(c.tone.from, '#0B0908', 0.72)}
        paddingHorizontal={16}
        paddingTop={20}
        paddingBottom={16}
      >
        {/* Resting states have no cover: the card is just its words, set low. */}
        {w > 0 && next && (
          <View alignSelf="center" width={coverSize} height={coverSize} justifyContent="center">
            {image ? (
              <Image
                source={image}
                style={{ width: coverSize, height: coverSize, borderRadius: 6 }}
                contentFit="cover"
              />
            ) : cover ? (
              <View alignItems="center">
                <GeneratedCover
                  cover={cover}
                  title={coverTitle}
                  tone={c.tone}
                  width={cover.kind === 'book' ? coverSize / 1.5 : coverSize}
                />
              </View>
            ) : undefined}
          </View>
        )}

        <YStack
          flex={1}
          marginTop={next ? 16 : 0}
          gap={2}
          justifyContent={next ? 'flex-start' : 'flex-end'}
        >
          {/* Resting states have nothing to pray, so no "Reze agora" over them. */}
          {next && (
            <Typography color="rgba(245,239,226,0.55)" fontSize={13}>
              {`${c.marker} · ${c.block}`}
            </Typography>
          )}
          <Typography
            fontFamily="$body"
            fontWeight="600"
            color={blockInk}
            fontSize={18}
            lineHeight={22}
            numberOfLines={2}
          >
            {c.title}
          </Typography>
          <Typography
            color="rgba(245,239,226,0.72)"
            fontSize={14}
            lineHeight={18}
            numberOfLines={next ? 2 : 3}
          >
            {[c.subtitle, description].filter(Boolean).join(' — ')}
          </Typography>
        </YStack>

        {next && (
          <XStack alignItems="center" justifyContent="space-between" marginTop={10}>
            {/* Not audio, so no play triangle: the cross is the "pray" mark. */}
            <XStack
              backgroundColor="rgba(245,239,226,0.14)"
              borderRadius={999}
              paddingHorizontal={12}
              paddingVertical={6}
            >
              {/* ✠ is the carousel fleurons' glyph and face; nudged down by a
                  measured offset so its centre meets the lowercase's. */}
              <XStack alignItems="center" gap={7}>
                <Text
                  fontFamily="$heading"
                  fontSize={15}
                  lineHeight={18}
                  color={blockInk}
                  top={crossNudge}
                >
                  ✠
                </Text>
                {next.minutes !== undefined && next.minutes > 0 && (
                  <Typography color={blockInk} fontSize={14} lineHeight={18} fontWeight="600">
                    {t('explore.prayNow.minutes', { count: next.minutes })}
                  </Typography>
                )}
              </XStack>
            </XStack>
            <Typography color="rgba(245,239,226,0.55)" fontSize={13}>
              {props.pick.suggestion ? '' : t(`tier.${next.tier}`)}
            </Typography>
          </XStack>
        )}
      </YStack>
    </Tap>
  )
}

// ── Dev-only switcher ───────────────────────────────────────────────────────

export function PrayNowSwitcher() {
  const { variant, plan, art, clock } = usePrototype()
  if (!__DEV__) return null
  const cycle = <T,>(list: readonly T[], cur: T, d: number) =>
    list[(list.indexOf(cur) + d + list.length) % list.length]
  const btn = (text: string, onPress: () => void, a11y: string) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} hitSlop={10}>
      <Text color="white" fontSize={15} paddingHorizontal={8}>
        {text}
      </Text>
    </Pressable>
  )
  const sep = <Text color="rgba(255,255,255,0.4)">|</Text>
  return (
    <YStack
      position="absolute"
      top={56}
      alignSelf="center"
      maxWidth="96%"
      backgroundColor="rgba(20,20,20,0.92)"
      borderRadius={18}
      paddingHorizontal={10}
      paddingVertical={6}
      gap={4}
      alignItems="center"
      zIndex={1000}
    >
      <XStack gap={6} alignItems="center">
        {btn(
          '‹',
          () => usePrototype.setState({ variant: cycle(variants, variant, -1) }),
          'Previous variant',
        )}
        <Text color="white" fontSize={13} fontWeight="600">
          {variant} · {variantNames[variant]}
        </Text>
        {btn(
          '›',
          () => usePrototype.setState({ variant: cycle(variants, variant, 1) }),
          'Next variant',
        )}
      </XStack>
      <XStack gap={4} alignItems="center">
        {btn(
          plan,
          () => usePrototype.setState({ plan: cycle(planStates, plan, 1) }),
          'Cycle plan state',
        )}
        {'EFGHIJKLM'.includes(variant) && (
          <>
            {sep}
            {btn(art, () => usePrototype.setState({ art: cycle(artModes, art, 1) }), 'Cycle art')}
            {sep}
            {btn(
              clock === 'live' ? 'now' : `${clock}h`,
              () => usePrototype.setState({ clock: cycle(clocks, clock, 1) }),
              'Cycle clock',
            )}
          </>
        )}
      </XStack>
    </YStack>
  )
}
