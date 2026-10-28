import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import {
  ArrowDownToLine,
  CalendarPlus,
  CirclePlus,
  FolderPlus,
  Share as ShareIcon,
  Star,
  Type,
} from 'lucide-react-native'
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, Typography } from '@/components'
import { dockedTabBarLift } from '@/components/tabAccessory'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import type { Tier } from '@/db/schema'
import { ToneGradient } from '@/features/covers/parts'
import { artFor } from '@/features/explore/artMap'
import { blockInk, blockLabelInk, jewelTones } from '@/features/explore/bgColor'
import { PracticeHeader } from '@/features/practices/components/PracticeHeader'
import { PracticePlanEditor, usePracticePlan } from '@/features/practices/components/PracticePlan'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { pageGutter } from '@/lib/layout'

import { useAddSlot, useCreatePractice, usePractice, useSlotsForPractice } from '../hooks'
import { type GuideEntry, type GuideTier, keepsDays, ruleGuide } from '../ruleGuide'
import { beadRadius, formatSlotTime, hourHue, slotDaysLabel } from '../ruleString'
import { openPlanSheet } from './PlanSheet'
import { WhenSheet } from './RuleSheets'

type Report = (key: string, added: boolean) => void

/**
 * Builds a rule from the top down: five chapters, the sacraments first and
 * what some are called to last, each practice with a line on why it belongs;
 * then how any other prayer joins the rule from its own page.
 */
export function RuleGuide() {
  const { t } = useTranslation()
  const router = useRouter()
  const [added, setAdded] = useState<ReadonlySet<string>>(new Set())
  const report: Report = (key, now) =>
    setAdded((prev) => {
      if (prev.has(key) === now) return prev
      const next = new Set(prev)
      if (now) next.add(key)
      else next.delete(key)
      return next
    })

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout>
        <YStack paddingVertical="$lg">
          <PracticeHeader
            onBack={() => router.back()}
            name={t('ruleGuide.title')}
            caption={t('ruleGuide.lede')}
          />
          {ruleGuide.map((tier) => (
            <Chapter key={tier.key} tier={tier} report={report} />
          ))}
          <Lesson />
          {/* Room for the bar, so it never covers the lesson's button. */}
          {added.size > 0 && <YStack height={64} />}
        </YStack>
      </ScreenLayout>
      {added.size > 0 && <AddedBar count={added.size} />}
    </View>
  )
}

function Chapter({ tier, report }: { tier: GuideTier; report: Report }) {
  const { t } = useTranslation()
  return (
    <YStack>
      <ChapterTitle
        art={tier.art}
        numeral={tier.numeral}
        title={t(`ruleGuide.tiers.${tier.key}.title`)}
        line={t(`ruleGuide.tiers.${tier.key}.line`)}
      />
      {tier.entries.map((entry, i) => {
        const last = i === tier.entries.length - 1
        return entry.massDays ? (
          <MassRow
            key={entry.key}
            entry={entry}
            days={entry.massDays}
            last={last}
            report={report}
          />
        ) : (
          <PracticeRow key={entry.key} entry={entry} last={last} report={report} />
        )
      })}
    </YStack>
  )
}

// The tier's painting, faint, dissolving into the page above and below, so the
// title still reads as type on paper.
function ChapterTitle({
  art,
  numeral,
  title,
  line,
}: {
  art: string
  numeral: string
  title: string
  line: string
}) {
  const theme = useTheme()
  const paper = theme.background.val
  // Measured, not "100%": on Android a percent-sized Svg took the width the
  // band had before its negative margins, leaving the painting unveiled at the
  // right and cut off hard at the foot.
  const [size, setSize] = useState({ width: 0, height: 0 })
  return (
    <YStack
      marginTop="$xl"
      marginHorizontal={-pageGutter}
      paddingVertical={36}
      paddingHorizontal={36}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout
        setSize({ width, height })
      }}
    >
      <Image
        source={artFor(art)}
        style={[StyleSheet.absoluteFill, { opacity: 0.25 }]}
        contentFit="cover"
        contentPosition={{ top: '30%' }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      {/* A pixel past each edge: flush, the painting showed a hairline at the foot. */}
      <Svg
        style={{ position: 'absolute', left: 0, top: -1 }}
        width={size.width}
        height={size.height + 2}
      >
        <Defs>
          <LinearGradient id={`veil-${art}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={paper} stopOpacity={1} />
            <Stop offset="0.32" stopColor={paper} stopOpacity={0} />
            <Stop offset="0.58" stopColor={paper} stopOpacity={0} />
            <Stop offset="1" stopColor={paper} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width={size.width} height={size.height + 2} fill={`url(#veil-${art})`} />
      </Svg>
      <YStack alignItems="center" gap={4}>
        <Typography variant="label" color="$colorBurgundy" letterSpacing={4}>
          {numeral}
        </Typography>
        {/* Stretched, not shrink-wrapped: Android measures a centred italic
            line a hair too narrow and drops its last word. */}
        <Typography
          variant="sacred-title"
          fontSize={30}
          lineHeight={38}
          fontStyle="italic"
          alignSelf="stretch"
          textAlign="center"
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          fontSize={16}
          lineHeight={22}
          alignSelf="stretch"
          textAlign="center"
        >
          {line}
        </Typography>
        <Typography
          tone="muted"
          fontSize={13}
          letterSpacing={8}
          paddingTop={6}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          · ✠ ·
        </Typography>
      </YStack>
    </YStack>
  )
}

function PracticeRow({
  entry,
  last,
  report,
}: {
  entry: GuideEntry
  last: boolean
  report: Report
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const manifest = getManifest(entry.practiceId)
  const plan = usePracticePlan(manifest, { openOnBegin: false })
  const slot = useSlotsForPractice(plan.planPracticeId).find((s) => s.enabled === 1)
  useReport(entry.key, plan.isInPlan, report)
  // The days-and-hour sheet mounts on first asking and stays, so it can close.
  const asked = useStays(!!plan.asking)
  if (!manifest) return undefined
  const name = localizeContent(manifest.name)

  return (
    <>
      <GuideRowView
        name={name}
        entryKey={entry.key}
        slot={plan.isInPlan ? slot : undefined}
        last={last}
        onAdd={() => plan.addToPlan()}
        onOpen={() =>
          router.push({
            pathname: '/plan/[practiceId]',
            params: { practiceId: plan.planPracticeId },
          })
        }
        addLabel={t('a11y.addToRule', { name })}
      />
      {asked && <PracticePlanEditor plan={plan} />}
    </>
  )
}

// Sunday's Mass and the weekdays' are two times of the one Mass practice: each
// row adds its own time beside the other's, and is in the rule only by it.
function MassRow({
  entry,
  days,
  last,
  report,
}: {
  entry: GuideEntry
  days: number[]
  last: boolean
  report: Report
}) {
  const { t } = useTranslation()
  const router = useRouter()
  const practice = usePractice(entry.practiceId)
  const slot = useSlotsForPractice(entry.practiceId).find((s) => keepsDays(s, days))
  const addSlot = useAddSlot()
  const createPractice = useCreatePractice()
  const [asking, setAsking] = useState(false)
  const asked = useStays(asking)
  useReport(entry.key, !!slot, report)
  const manifest = getManifest(entry.practiceId)
  const name = t(`ruleGuide.practices.${entry.key}.name`, {
    defaultValue: manifest ? localizeContent(manifest.name) : '',
  })

  return (
    <>
      <GuideRowView
        name={name}
        entryKey={entry.key}
        slot={slot}
        last={last}
        onAdd={() => setAsking(true)}
        onOpen={() =>
          router.push({ pathname: '/plan/[practiceId]', params: { practiceId: entry.practiceId } })
        }
        addLabel={t('a11y.addToRule', { name })}
      />
      {asked && (
        <WhenSheet
          open={asking}
          onClose={() => setAsking(false)}
          title={t('rule.addToRule')}
          schedule={{ type: 'days-of-week', days }}
          time={days.includes(0) ? '10:00' : '07:00'}
          confirmLabel={t('rule.add')}
          onConfirm={({ schedule, time }) => {
            const tier: Tier = days.includes(0) ? 'essential' : 'ideal'
            const data = { tier, time, schedule: JSON.stringify(schedule) }
            if (practice && !practice.archived)
              addSlot.mutate({ practiceId: entry.practiceId, data })
            else
              createPractice.mutate({
                id: entry.practiceId,
                activeVariant: entry.practiceId,
                slot: data,
              })
            setAsking(false)
          }}
        />
      )}
    </>
  )
}

function GuideRowView({
  name,
  entryKey,
  slot,
  last,
  onAdd,
  onOpen,
  addLabel,
}: {
  name: string
  entryKey: string
  slot: SlotState | undefined
  last: boolean
  onAdd: () => void
  onOpen: () => void
  addLabel: string
}) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
  const when = slot
    ? [slotDaysLabel(slot, t), slot.time && formatSlotTime(slot.time, i18n.language)]
        .filter(Boolean)
        .join(' ')
    : ''
  const meta = slot
    ? t('ruleGuide.inRule', { when: when || t(`ruleGuide.practices.${entryKey}.meta`) })
    : t(`ruleGuide.practices.${entryKey}.meta`)

  return (
    <XStack
      gap="$sm"
      paddingVertical={14}
      alignItems="flex-start"
      borderBottomWidth={last ? 0 : 0.5}
      borderColor="$borderColor"
    >
      <YStack flex={1} gap={2}>
        <Typography fontSize={21} lineHeight={26}>
          {name}
        </Typography>
        <Typography
          variant="label"
          fontSize={11.5}
          lineHeight={16}
          letterSpacing={1.8}
          color="$accent"
        >
          {meta.toUpperCase()}
        </Typography>
        <Typography variant="caption" fontSize={15.5} lineHeight={21} paddingTop={2}>
          {t(`ruleGuide.practices.${entryKey}.why`)}
        </Typography>
      </YStack>
      {slot ? (
        <AnimatedPressable
          onPress={() => {
            lightTap()
            onOpen()
          }}
          accessibilityRole="link"
          accessibilityLabel={t('a11y.inRule', { name })}
          hitSlop={4}
        >
          <Svg width={40} height={40}>
            <Circle cx={20} cy={20} r={beadRadius[slot.tier]} fill={hourHue(slot.time, dark)} />
          </Svg>
        </AnimatedPressable>
      ) : (
        <AnimatedPressable
          onPress={() => {
            lightTap()
            onAdd()
          }}
          accessibilityRole="button"
          accessibilityLabel={addLabel}
          hitSlop={4}
        >
          <OpenBead color={theme.accent.val} />
        </AnimatedPressable>
      )}
    </XStack>
  )
}

/** The bead not yet on the string: dashed, with a plus. */
export function OpenBead({ color, size = 40 }: { color: string; size?: number }) {
  const c = size / 2
  return (
    <Svg width={size} height={size}>
      <Circle
        cx={c}
        cy={c}
        r={11}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <Path
        d={`M${c - 4},${c}h8M${c},${c - 4}v8`}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  )
}

// Every other prayer joins the rule from its own page: the ⊕ beside its title,
// then "Add to plan" in the sheet it opens. Drawn with the page's own glyphs.
function Lesson() {
  const { t } = useTranslation()
  const router = useRouter()
  const tone = jewelTones.marian
  // Measured for the same reason as a chapter's veil.
  const [size, setSize] = useState({ width: 0, height: 0 })
  return (
    <YStack
      marginTop="$xl"
      borderRadius={18}
      overflow="hidden"
      padding="$md"
      gap="$sm"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout
        setSize({ width, height })
      }}
    >
      <Svg style={StyleSheet.absoluteFill} width={size.width} height={size.height}>
        <Defs>
          <ToneGradient id="lesson-ground" tone={tone} />
        </Defs>
        <Rect width={size.width} height={size.height} fill="url(#lesson-ground)" />
      </Svg>
      <Typography variant="label" fontSize={11.5} letterSpacing={2.5} color={blockLabelInk}>
        {t('ruleGuide.lesson.kicker').toUpperCase()}
      </Typography>
      <Typography
        variant="sacred-title"
        textAlign="left"
        fontSize={24}
        lineHeight={30}
        fontStyle="italic"
        color={blockInk}
      >
        {t('ruleGuide.lesson.title')}
      </Typography>

      <Mini>
        <XStack
          alignItems="center"
          gap="$md"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Hairline />
          <Typography fontSize="$2" color="$colorBurgundy">
            ✠
          </Typography>
          <Hairline />
        </XStack>
        <Typography variant="sacred-title" fontSize={24} lineHeight={32} paddingTop="$sm">
          {t('ruleGuide.lesson.example')}
        </Typography>
        <XStack alignItems="center" gap="$md" paddingTop="$sm">
          <Hairline />
          <XStack gap={20} alignItems="center">
            <Glyph icon={Type} />
            <Glyph icon={ShareIcon} />
            <Pulse>
              <Glyph icon={CirclePlus} />
            </Pulse>
          </XStack>
        </XStack>
      </Mini>

      <Mini>
        <XStack justifyContent="space-around">
          <Labeled icon={CalendarPlus} label={t('catalog.addToPlan')} pulse />
          <Labeled icon={Star} label={t('library.favorite')} />
          <Labeled icon={FolderPlus} label={t('library.collection')} />
          <Labeled icon={ArrowDownToLine} label={t('library.offline')} />
        </XStack>
      </Mini>

      <YStack gap={4} paddingTop="$xs">
        <Step n={1}>{t('ruleGuide.lesson.step1')}</Step>
        <Step n={2}>
          {t('ruleGuide.lesson.step2Before')}
          <InlineGlyph />
          {t('ruleGuide.lesson.step2After')}
        </Step>
        <Step n={3}>{t('ruleGuide.lesson.step3')}</Step>
      </YStack>

      <AnimatedPressable
        onPress={() => {
          lightTap()
          router.push('/browse/prayers')
        }}
        accessibilityRole="link"
        accessibilityLabel={t('ruleGuide.lesson.open')}
      >
        <YStack
          marginTop="$xs"
          minHeight={48}
          borderRadius={8}
          alignItems="center"
          justifyContent="center"
          backgroundColor={blockLabelInk}
        >
          <Typography variant="label" fontSize={15} letterSpacing={1.5} color="#0E0D0C">
            {t('ruleGuide.lesson.open').toUpperCase()}
          </Typography>
        </YStack>
      </AnimatedPressable>
    </YStack>
  )
}

function Mini({ children }: { children: ReactNode }) {
  return (
    <YStack
      borderRadius={12}
      backgroundColor="$background"
      paddingHorizontal="$md"
      paddingVertical="$sm"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </YStack>
  )
}

function Hairline() {
  return <YStack flex={1} height={0.5} backgroundColor="$borderColor" />
}

type Icon = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>

// As the practice page draws its actions: 22pt, stroke 1.5, secondary ink.
function Glyph({ icon: Icon }: { icon: Icon }) {
  const theme = useTheme()
  return <Icon size={22} strokeWidth={1.5} color={theme.colorSecondary.val} />
}

function Labeled({ icon, label, pulse }: { icon: Icon; label: string; pulse?: boolean }) {
  return (
    <YStack flex={1} alignItems="center" gap={6}>
      {pulse ? (
        <Pulse>
          <Glyph icon={icon} />
        </Pulse>
      ) : (
        <View style={{ height: 40, justifyContent: 'center' }}>
          <Glyph icon={icon} />
        </View>
      )}
      <Typography fontSize={13} lineHeight={17} tone="muted" textAlign="center">
        {label}
      </Typography>
    </YStack>
  )
}

function InlineGlyph() {
  return (
    <View style={{ paddingHorizontal: 2, transform: [{ translateY: 4 }] }}>
      <CirclePlus size={18} strokeWidth={1.5} color="#DACAB2" />
    </View>
  )
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <XStack gap="$sm">
      <Typography fontSize={16.5} lineHeight={22} color="#DACAB2">
        {n}.
      </Typography>
      <Typography flex={1} fontSize={16.5} lineHeight={22} color="#DACAB2">
        {children}
      </Typography>
    </XStack>
  )
}

// A gold ring growing out of the glyph and fading: where to tap.
function Pulse({ children }: { children: ReactNode }) {
  const theme = useTheme()
  const reduced = useReducedMotion()
  const progress = useSharedValue(0)
  useEffect(() => {
    if (reduced) return
    progress.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
    )
  }, [reduced, progress])
  const ring = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ scale: 0.7 + 0.8 * progress.value }],
  }))
  return (
    <View style={styles.pulse}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { borderColor: theme.accent.val }, reduced ? { opacity: 0.6 } : ring]}
      />
      {children}
    </View>
  )
}

function AddedBar({ count }: { count: number }) {
  const { t } = useTranslation()
  const router = useRouter()
  const bottom = useSafeAreaInsets().bottom + dockedTabBarLift
  return (
    <XStack
      position="absolute"
      left={0}
      right={0}
      bottom={bottom}
      paddingHorizontal={pageGutter}
      paddingVertical="$md"
      backgroundColor="$background"
      borderTopWidth={0.5}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography tone="muted" fontSize={17}>
        {t('ruleGuide.added', { count })}
      </Typography>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          router.back()
          openPlanSheet()
        }}
        accessibilityRole="link"
        accessibilityLabel={t('ruleGuide.seeRule')}
        hitSlop={12}
      >
        <Typography variant="label" fontSize={14} letterSpacing={1.5} color="$accent">
          {t('ruleGuide.seeRule').toUpperCase()} ›
        </Typography>
      </AnimatedPressable>
    </XStack>
  )
}

// Tells the page what came into the rule while it was open.
function useReport(key: string, inRule: boolean, report: Report) {
  const before = useRef(inRule)
  // biome-ignore lint/correctness/useExhaustiveDependencies: report is recreated each render
  useEffect(() => {
    report(key, inRule && !before.current)
  }, [key, inRule])
}

// True from the first time `now` is true.
function useStays(now: boolean) {
  const [stays, setStays] = useState(now)
  if (now && !stays) setStays(true)
  return stays
}

const styles = StyleSheet.create({
  pulse: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 1.5 },
})
