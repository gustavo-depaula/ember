import { Plus, Star, X } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput, Typography } from '@/components'
import type { Cadence, Movement } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { groupBySubject } from '../groupBySubject'
import {
  useActiveIntentions,
  useActiveThanksgivings,
  useOfferThanksgiving,
  usePinMovement,
  usePinnedFor,
  useRaiseIntention,
  useUnpinMovement,
} from '../hooks'

import { BoundedUntilPicker, defaultBoundedUntil } from './BoundedUntilPicker'
import { CadenceToggle } from './CadenceToggle'
import { OfferingPickerSheet } from './OfferingPickerSheet'

export type OfferingMode = 'intercessory' | 'thanksgiving' | 'both'
export type OfferingDefault = 'pinned' | 'all-active' | 'user-pick'
type OfferingShow = 'list' | 'count' | 'silent'

/**
 * What this prayer is carrying.
 *
 * Everything rendered here is being offered — there is no checkbox, because a
 * per-sitting selection would have nowhere to live. The list is shaped by two
 * real gestures instead: the star makes an intention *standing* for this
 * practice (a persisted pin, so it returns tomorrow), and "carry more" adds one
 * for this sitting only. That keeps a perpetual register out of the morning
 * prayer without pretending a tap means more than it does.
 */
export function RenderedOfferingBlock({
  practiceId,
  mode,
  show,
  default: defaultMode,
  label,
}: {
  practiceId?: string
  mode: OfferingMode
  show: OfferingShow
  default: OfferingDefault
  label?: string
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const wantsIntentions = mode !== 'thanksgiving'
  const wantsThanksgivings = mode !== 'intercessory'

  const intentions = useActiveIntentions()
  const thanksgivings = useActiveThanksgivings()
  const pinnedIntentions = usePinnedFor(practiceId ?? '', 'intention')
  const pinnedThanksgivings = usePinnedFor(practiceId ?? '', 'thanksgiving')

  const active = useMemo(() => {
    const out: Movement[] = []
    if (wantsIntentions) out.push(...intentions)
    if (wantsThanksgivings) out.push(...thanksgivings)
    return out
  }, [wantsIntentions, wantsThanksgivings, intentions, thanksgivings])

  const standing = useMemo(() => {
    const out: Movement[] = []
    if (wantsIntentions) out.push(...pinnedIntentions)
    if (wantsThanksgivings) out.push(...pinnedThanksgivings)
    return out
  }, [wantsIntentions, wantsThanksgivings, pinnedIntentions, pinnedThanksgivings])

  // Carried for this sitting only — added via "carry more" or raised inline.
  // Deliberately not persisted: the durable form of "I pray for this every
  // morning" is the star, one tap away on every row.
  const [carriedIds, setCarriedIds] = useState<Set<string>>(new Set())

  const [draft, setDraft] = useState('')
  const [cadence, setCadence] = useState<Cadence>('perpetual')
  const [boundedUntil, setBoundedUntil] = useState<Date>(defaultBoundedUntil)
  const [adding, setAdding] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const raiseIntention = useRaiseIntention()
  const offerThanksgiving = useOfferThanksgiving()
  const pinMovement = usePinMovement()
  const unpinMovement = useUnpinMovement()
  const submitting = raiseIntention.isPending || offerThanksgiving.isPending

  const base = useMemo(() => {
    if (defaultMode === 'all-active') return active
    if (defaultMode === 'pinned') return standing
    return []
  }, [defaultMode, active, standing])

  const offered = useMemo(() => {
    const baseIds = new Set(base.map((m) => m.id))
    const extra = active.filter((m) => carriedIds.has(m.id) && !baseIds.has(m.id))
    return [...base, ...extra]
  }, [base, active, carriedIds])

  if (show === 'silent') return null

  if (show === 'count') {
    return (
      <YStack gap="$xs">
        {label ? <OfferingLabel>{label}</OfferingLabel> : undefined}
        <Typography fontStyle="italic">
          {offered.length === 0
            ? t('movements.offering.summaryEmpty')
            : t('movements.offering.summary', { count: offered.length })}
        </Typography>
      </YStack>
    )
  }

  const captureKind: 'intention' | 'thanksgiving' =
    mode === 'thanksgiving' ? 'thanksgiving' : 'intention'

  async function captureNew() {
    const trimmed = draft.trim()
    if (!trimmed || submitting) return
    lightTap()
    Keyboard.dismiss()
    // A failed write already surfaces through the global mutation-error host;
    // bail without clearing so the user's words survive the retry.
    try {
      const id =
        captureKind === 'intention'
          ? await raiseIntention.mutateAsync({
              text: trimmed,
              cadence,
              bounded_until: cadence === 'bounded' ? boundedUntil.getTime() : undefined,
            })
          : await offerThanksgiving.mutateAsync({ text: trimmed })
      // Newly raised movements aren't standing yet, so carry them explicitly or
      // they'd vanish from the block the moment they were written.
      setCarriedIds((prev) => new Set(prev).add(id))
    } catch {
      return
    }
    successBuzz()
    setDraft('')
    setCadence('perpetual')
    setBoundedUntil(defaultBoundedUntil())
    setAdding(false)
  }

  function toggleStanding(movement: Movement) {
    if (!practiceId) return
    lightTap()
    const isStanding = standing.some((m) => m.id === movement.id)
    if (isStanding) {
      unpinMovement.mutate({ practiceId, movementId: movement.id })
      // Unstarring should not yank the line out from under the user mid-prayer;
      // keep it for this sitting, just no longer standing.
      setCarriedIds((prev) => new Set(prev).add(movement.id))
    } else {
      pinMovement.mutate({ practiceId, movementId: movement.id })
    }
  }

  function dropFromToday(movement: Movement) {
    lightTap()
    setCarriedIds((prev) => {
      const next = new Set(prev)
      next.delete(movement.id)
      return next
    })
  }

  const standingIds = new Set(standing.map((m) => m.id))
  const grouped = groupBySubject(offered)
  const isEmpty = offered.length === 0
  const canCarryMore = active.length > offered.length
  const placeholderKey =
    captureKind === 'intention'
      ? 'movements.capture.intentionPlaceholder'
      : 'movements.capture.thanksgivingPlaceholder'
  const submitKey =
    captureKind === 'intention' ? 'movements.capture.raise' : 'movements.capture.offer'

  return (
    <YStack gap="$sm">
      {label ? <OfferingLabel>{label}</OfferingLabel> : undefined}
      <YStack
        gap="$sm"
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$backgroundSurface"
      >
        {isEmpty && !adding ? (
          <Typography variant="caption">
            {t(active.length > 0 ? 'movements.offering.emptyStanding' : 'movements.offering.empty')}
          </Typography>
        ) : undefined}

        {grouped.map(([subject, group]) => (
          <YStack key={subject ?? '__none'} gap="$xs">
            {subject ? <Typography variant="caption">{subject}</Typography> : undefined}
            {group.map((m) => (
              <Animated.View
                key={m.id}
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(120)}
                layout={LinearTransition.duration(200)}
              >
                <OfferedRow
                  movement={m}
                  isStanding={standingIds.has(m.id)}
                  canToggleStanding={practiceId !== undefined}
                  onToggleStanding={() => toggleStanding(m)}
                  onDrop={standingIds.has(m.id) ? undefined : () => dropFromToday(m)}
                />
              </Animated.View>
            ))}
          </YStack>
        ))}

        {adding ? (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            layout={LinearTransition.duration(200)}
          >
            <YStack gap="$sm">
              <PrayerTextInput
                size="sm"
                value={draft}
                onChangeText={setDraft}
                placeholder={t(placeholderKey)}
                style={{ maxHeight: 140 }}
                autoFocus
              />
              {captureKind === 'intention' ? (
                <CadenceToggle value={cadence} onChange={setCadence} />
              ) : undefined}
              {captureKind === 'intention' && cadence === 'bounded' ? (
                <BoundedUntilPicker value={boundedUntil} onChange={setBoundedUntil} />
              ) : undefined}
              <XStack gap="$sm">
                <QuietButton
                  label={t('common.cancel')}
                  onPress={() => {
                    setAdding(false)
                    setDraft('')
                  }}
                />
                <AnimatedPressable
                  onPress={captureNew}
                  disabled={!draft.trim() || submitting}
                  style={{ flex: 1, opacity: draft.trim() ? 1 : 0.5 }}
                  accessibilityRole="button"
                  accessibilityLabel={t(submitKey)}
                >
                  <XStack
                    alignItems="center"
                    justifyContent="center"
                    gap="$xs"
                    paddingVertical="$sm"
                    borderRadius="$md"
                    backgroundColor="$accent"
                  >
                    <Plus size={14} color="white" />
                    <Typography variant="label" fontSize="$2" color="white" letterSpacing={1}>
                      {t(submitKey)}
                    </Typography>
                  </XStack>
                </AnimatedPressable>
              </XStack>
            </YStack>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
            <XStack alignItems="center" gap="$lg" flexWrap="wrap">
              <AnimatedPressable
                onPress={() => {
                  lightTap()
                  setAdding(true)
                }}
                accessibilityRole="button"
                accessibilityLabel={t(`movements.offering.add.${captureKind}`)}
              >
                <XStack alignItems="center" gap="$xs" paddingVertical="$xs">
                  <Plus size={14} color={theme.accent?.val} />
                  <Typography variant="label" fontSize="$2" color="$accent">
                    {t(`movements.offering.add.${captureKind}`)}
                  </Typography>
                </XStack>
              </AnimatedPressable>
              {canCarryMore ? (
                <AnimatedPressable
                  onPress={() => {
                    lightTap()
                    setPickerOpen(true)
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('movements.offering.carryMore')}
                >
                  <XStack alignItems="center" paddingVertical="$xs">
                    <Typography variant="label" fontSize="$2" color="$accent">
                      {t('movements.offering.carryMore')}
                    </Typography>
                  </XStack>
                </AnimatedPressable>
              ) : undefined}
            </XStack>
          </Animated.View>
        )}
      </YStack>

      <OfferingPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        candidates={active.filter((m) => !offered.some((o) => o.id === m.id))}
        onCarry={(id) => setCarriedIds((prev) => new Set(prev).add(id))}
      />
    </YStack>
  )
}

function OfferingLabel({ children }: { children: string }) {
  return (
    <Typography variant="label" fontSize="$2" color="$accent" letterSpacing={1}>
      {children.toUpperCase()}
    </Typography>
  )
}

function OfferedRow({
  movement,
  isStanding,
  canToggleStanding,
  onToggleStanding,
  onDrop,
}: {
  movement: Movement
  isStanding: boolean
  canToggleStanding: boolean
  onToggleStanding: () => void
  onDrop?: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <XStack alignItems="baseline" gap="$sm" paddingVertical="$xs">
      <Typography color="$accent">⟢</Typography>
      <Typography flex={1} flexWrap="wrap">
        {movement.text}
      </Typography>
      {canToggleStanding ? (
        <AnimatedPressable
          onPress={onToggleStanding}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ selected: isStanding }}
          accessibilityLabel={t(isStanding ? 'a11y.unmakeStanding' : 'a11y.makeStanding', {
            text: movement.text,
          })}
        >
          <Star
            size={14}
            color={isStanding ? theme.accent?.val : theme.colorSecondary?.val}
            fill={isStanding ? theme.accent?.val : 'none'}
          />
        </AnimatedPressable>
      ) : undefined}
      {onDrop ? (
        <AnimatedPressable
          onPress={onDrop}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.dropFromToday', { text: movement.text })}
        >
          <X size={14} color={theme.colorSecondary?.val} />
        </AnimatedPressable>
      ) : undefined}
    </XStack>
  )
}

function QuietButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AnimatedPressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <XStack
        justifyContent="center"
        paddingVertical="$sm"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Typography variant="label" fontSize="$2" letterSpacing={1}>
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
