import { Image, type ImageSource } from 'expo-image'
import { useRouter } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle, Path } from 'react-native-svg'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import { createSheet, NativeSheet } from '@/components/NativeSheet'
import { PracticeIcon } from '@/components/PracticeIcon'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import { artFor } from '@/features/explore/artMap'
import { useTemplateList } from '@/features/templates'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { enrichSlot } from '../getPracticeName'
import { useArchivedPractices, usePinnedFlows } from '../hooks'
import { beadRadius, dayPartHue, formatSlotTime, hourHue, slotDaysLabel } from '../ruleString'
import { dayPartOrder, getActiveBlocks } from '../timeBlocks'
import { BeadRow, beadRowHeight, beadX, threadPath } from './BeadRow'
import { keptOffices, OfficeStep } from './OfficeStep'

const sheet = createSheet()

export const openPlanSheet = sheet.open

/**
 * The whole rule, drawn up over the You page: the bead string stood upright
 * with each time named, an open bead at its foot that opens the page for
 * adding a practice (plan/add), and the two whole plans and the Divine Office
 * to begin from, the Office's book and hours chosen here in the sheet.
 */
export function PlanSheet({ slots }: { slots: SlotState[] }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)

  return (
    <NativeSheet sheet={sheet}>
      {({ scroll, height, bodyShown }) => (
        <YStack paddingTop="$xl" gap="$sm" height={height}>
          <Typography variant="screen-title" fontSize="$5" paddingHorizontal="$lg">
            {t('plan.title')}
          </Typography>
          {/* As on Today's sheet, the list scrolls only once the sheet is at
              the top: the native sheet can't hand an RN scroll to itself. */}
          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} {...scroll}>
            <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48} gap="$xl">
              {bodyShown && (
                <SheetBody
                  slots={slots}
                  toTop={() => scrollRef.current?.scrollTo({ y: 0, animated: false })}
                />
              )}
            </YStack>
          </ScrollView>
        </YStack>
      )}
    </NativeSheet>
  )
}

// Mounted only while the sheet is up, so it opens on the string again each time.
// The Office opens from low on the sheet, so it starts at the top to show its title.
function SheetBody({ slots, toTop }: { slots: SlotState[]; toTop: () => void }) {
  const [office, setOffice] = useState(false)
  if (office) return <OfficeStep slots={slots} onDone={() => setOffice(false)} />
  return (
    <>
      <HueKey />
      <UprightString slots={slots} />
      <BeginSection
        slots={slots}
        onOffice={() => {
          setOffice(true)
          toTop()
        }}
      />
      <Archived />
    </>
  )
}

function HueKey() {
  const { t } = useTranslation()
  const dark = useThemeName().startsWith('dark')
  return (
    <XStack
      columnGap="$md"
      rowGap="$xs"
      flexWrap="wrap"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {dayPartOrder
        .filter((part) => part !== 'flexible')
        .map((part) => (
          <XStack key={part} alignItems="center" gap={5}>
            <YStack
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={dayPartHue(part, dark)}
            />
            <Typography tone="muted" fontSize="$1">
              {t(`dayPart.${part}`).toLowerCase()}
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
            <BeadRow
              index={i}
              count={ordered.length + 1}
              hue={hue}
              radius={beadRadius[slot.tier]}
              hollow={!!days}
              background={theme.background.val}
              name={name}
              when={when}
            />
          </AnimatedPressable>
        )
      })}
      <AnimatedPressable
        onPress={() => {
          lightTap()
          sheet.close()
          router.push('/plan/add')
        }}
        accessibilityRole="link"
        accessibilityLabel={t('a11y.openAddToRule')}
      >
        <XStack height={beadRowHeight} alignItems="center" gap="$sm">
          <Svg width={52} height={beadRowHeight}>
            <Path
              d={threadPath(ordered.length, ordered.length + 1)}
              stroke={theme.accent.val}
              strokeOpacity={0.4}
              strokeWidth={1.3}
              strokeDasharray="3 4"
              fill="none"
            />
            <Circle
              cx={beadX(ordered.length)}
              cy={beadRowHeight / 2}
              r={11}
              fill={theme.background.val}
              stroke={theme.accent.val}
              strokeWidth={1.2}
              strokeDasharray="3 3"
            />
            <Path
              d={`M${beadX(ordered.length) - 4},${beadRowHeight / 2}h8M${beadX(ordered.length)},${beadRowHeight / 2 - 4}v8`}
              stroke={theme.accent.val}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          </Svg>
          <Typography flex={1} fontSize="$3" color="$accent">
            {t('plan.addPractice')}
          </Typography>
        </XStack>
      </AnimatedPressable>
    </YStack>
  )
}

// The two whole plans and the Divine Office, one row each: a plan opens its
// page to adopt, the Office opens its book and hours here in the sheet.
function BeginSection({ slots, onOffice }: { slots: SlotState[]; onOffice: () => void }) {
  const { t } = useTranslation()
  const router = useRouter()
  const templates = useTemplateList()
  const kept = keptOffices(slots, t)

  return (
    <YStack gap="$xs">
      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
        {t('plan.begin')}
      </Typography>
      <Typography variant="caption">{t('plan.beginLede')}</Typography>
      <YStack paddingTop="$xs">
        {templates.map((item) => {
          const templateId = item.id.slice(item.id.indexOf('/') + 1)
          return (
            <PlanRow
              key={item.id}
              testID={`plan-whole-${templateId}`}
              art={artFor(item.id)}
              title={item.entry.name ? localizeContent(item.entry.name) : item.id}
              sub={item.entry.description && localizeContent(item.entry.description)}
              onPress={() => {
                sheet.close()
                router.push({ pathname: '/templates/[templateId]', params: { templateId } })
              }}
            />
          )
        })}
        <PlanRow
          testID="plan-office"
          art={artFor('rule/office')}
          title={t(kept.length ? 'plan.officeRowKept' : 'plan.officeRow')}
          sub={kept.length ? kept.join('; ') : t('plan.officeRowHint')}
          onPress={onOffice}
        />
      </YStack>
    </YStack>
  )
}

function PlanRow({
  testID,
  art,
  title,
  sub,
  onPress,
}: {
  testID: string
  art: ImageSource | undefined
  title: string
  sub: string | undefined
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      testID={testID}
      onPress={() => {
        lightTap()
        onPress()
      }}
      accessibilityRole="link"
      accessibilityLabel={title}
    >
      <XStack alignItems="center" gap="$md" paddingVertical="$sm">
        <YStack
          width={64}
          height={64}
          borderRadius="$md"
          overflow="hidden"
          backgroundColor="$backgroundStrong"
        >
          {art && (
            <Image
              source={art}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          )}
        </YStack>
        <YStack flex={1} gap={2}>
          <Typography fontSize="$4">{title}</Typography>
          {sub && (
            <Typography variant="caption" fontStyle="italic">
              {sub}
            </Typography>
          )}
        </YStack>
        <ChevronRight size={20} strokeWidth={1.75} color={theme.accent.val} />
      </XStack>
    </AnimatedPressable>
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
