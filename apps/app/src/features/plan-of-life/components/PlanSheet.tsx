import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle, Path } from 'react-native-svg'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { createSheet, NativeSheet } from '@/components/NativeSheet'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { CardRow } from '@/features/explore/CardRow'
import { TemplateCard, useTemplateList } from '@/features/templates'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { enrichSlot } from '../getPracticeName'
import { useArchivedPractices, usePinnedFlows } from '../hooks'
import { beadRadius, formatSlotTime, hourHue, slotDaysLabel } from '../ruleString'
import { getActiveBlocks } from '../timeBlocks'

const sheet = createSheet()

export const openPlanSheet = sheet.open

const rowHeight = 50
const railWidth = 52
const sway = 12
// The string winds gently as it descends; each row draws its own stretch of it.
const beadX = (i: number) => railWidth / 2 + sway * Math.sin(i * 1.1)

/**
 * The whole rule, drawn up over the You page: the bead string stood upright
 * with each time named, a bead at its foot to add a practice, and the
 * traditions to draw from.
 */
export function PlanSheet({ slots }: { slots: SlotState[] }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <NativeSheet sheet={sheet}>
      {({ expanded, height, bodyShown }) => (
        <YStack paddingTop="$xl" gap="$sm" height={height}>
          <Typography variant="screen-title" fontSize="$5" paddingHorizontal="$lg">
            {t('plan.title')}
          </Typography>
          {/* As on Today's sheet, the list scrolls only once the sheet is at
              the top: the native sheet can't hand an RN scroll to itself. */}
          <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={expanded}>
            <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48} gap="$xl">
              {bodyShown && (
                <>
                  <HueKey />
                  <UprightString slots={slots} />
                  <Traditions />
                  <Archived />
                </>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      )}
    </NativeSheet>
  )
}

function HueKey() {
  const { t } = useTranslation()
  const dark = useThemeName().startsWith('dark')
  const keys = [
    ['06:00', 'plan.hueDawn'],
    ['12:00', 'plan.hueDay'],
    ['18:00', 'plan.hueDusk'],
    ['22:00', 'plan.hueNight'],
  ] as const
  return (
    <XStack gap="$md" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {keys.map(([time, key]) => (
        <XStack key={key} alignItems="center" gap={5}>
          <YStack width={8} height={8} borderRadius={4} backgroundColor={hourHue(time, dark)} />
          <Typography tone="muted" fontSize="$1">
            {t(key)}
          </Typography>
        </XStack>
      ))}
    </XStack>
  )
}

function UprightString({ slots }: { slots: SlotState[] }) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
  usePinnedFlows(slots)
  const ordered = getActiveBlocks(slots).flatMap(({ def }) => def.slots)

  return (
    <YStack>
      {ordered.map((slot, i) => {
        const hue = hourHue(slot.time, dark)
        const days = slotDaysLabel(slot, t)
        const name = enrichSlot(slot, t).name
        const when = [days, slot.time && formatSlotTime(slot.time, i18n.language)]
          .filter(Boolean)
          .join(' ')
        return (
          <AnimatedPressable
            key={slot.id}
            onPress={() => {
              lightTap()
              sheet.close()
              router.push({
                pathname: '/plan/[practiceId]',
                params: { practiceId: slot.practice_id },
              })
            }}
            accessibilityRole="link"
            accessibilityLabel={`${name} ${when}`}
          >
            <XStack height={rowHeight} alignItems="center" gap="$sm">
              <Svg width={railWidth} height={rowHeight}>
                <Path
                  d={thread(i, ordered.length)}
                  stroke={hue}
                  strokeOpacity={0.55}
                  strokeWidth={1.3}
                  fill="none"
                />
                {days ? (
                  <Circle
                    cx={beadX(i)}
                    cy={rowHeight / 2}
                    r={beadRadius[slot.tier]}
                    fill={theme.background.val}
                    stroke={hue}
                    strokeWidth={1.6}
                  />
                ) : (
                  <Circle cx={beadX(i)} cy={rowHeight / 2} r={beadRadius[slot.tier]} fill={hue} />
                )}
              </Svg>
              <Typography flex={1} fontSize="$3" numberOfLines={1}>
                {name}
              </Typography>
              <Typography tone="muted" fontSize="$1">
                {when}
              </Typography>
            </XStack>
          </AnimatedPressable>
        )
      })}
    </YStack>
  )
}

// Row i's stretch of the string: from halfway to the bead above, through its
// own bead, to halfway to the one below.
function thread(i: number, count: number): string {
  const mid = rowHeight / 2
  const from = i > 0 ? `M${(beadX(i - 1) + beadX(i)) / 2},0 L` : 'M'
  const to = i < count - 1 ? ` L${(beadX(i) + beadX(i + 1)) / 2},${rowHeight}` : ''
  return `${from}${beadX(i)},${mid}${to}`
}

function Traditions() {
  const { t } = useTranslation()
  const router = useRouter()
  const templates = useTemplateList()

  return (
    <YStack gap="$md">
      <AnimatedPressable
        onPress={() => {
          sheet.close()
          router.push('/templates' as never)
        }}
        accessibilityRole="link"
        accessibilityLabel={t('a11y.openTraditions')}
      >
        <XStack gap="$sm" alignItems="center">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('plan.traditions')}
          </Typography>
          <Typography variant="label" color="$accent">
            →
          </Typography>
        </XStack>
      </AnimatedPressable>
      <CardRow>
        {templates.map((item) => (
          <TemplateCard
            key={item.id}
            item={item}
            width={164}
            onPress={(templateId) => {
              sheet.close()
              router.push({ pathname: '/templates/[templateId]', params: { templateId } })
            }}
          />
        ))}
      </CardRow>
    </YStack>
  )
}

// Practices taken out of the rule wait here, to be opened and put back.
function Archived() {
  const { t } = useTranslation()
  const router = useRouter()
  const archived = useArchivedPractices()
  const [open, setOpen] = useState(false)
  if (archived.length === 0) return undefined

  return (
    <YStack gap="$sm">
      <AnimatedPressable
        onPress={() => {
          lightTap()
          setOpen((o) => !o)
        }}
        accessibilityRole="button"
        accessibilityLabel={t('plan.archivedCount', { count: archived.length })}
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
      >
        <Typography tone="muted" fontSize="$2" minHeight={44} paddingTop="$sm">
          {t('plan.archivedCount', { count: archived.length })} {open ? '⌄' : '›'}
        </Typography>
      </AnimatedPressable>
      {open &&
        archived.map((p) => {
          const manifest = getManifest(p.practice_id)
          const name = manifest ? localizeContent(manifest.name) : (p.custom_name ?? p.practice_id)
          return (
            <AnimatedPressable
              key={p.practice_id}
              onPress={() => {
                sheet.close()
                router.push({
                  pathname: '/plan/[practiceId]',
                  params: { practiceId: p.practice_id },
                })
              }}
              accessibilityRole="link"
              accessibilityLabel={name}
            >
              <XStack alignItems="center" gap="$md" minHeight={44} opacity={0.6}>
                <PracticeIcon name={p.custom_icon ?? 'prayer'} size={20} />
                <Typography flex={1} fontSize="$3" numberOfLines={1}>
                  {name}
                </Typography>
                <Typography tone="muted">›</Typography>
              </XStack>
            </AnimatedPressable>
          )
        })}
    </YStack>
  )
}
