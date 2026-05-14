import { Check, Plus, Square } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, PrayerTextInput } from '@/components'
import type { Cadence, Movement } from '@/db/events'
import { lightTap, successBuzz } from '@/lib/haptics'

import { groupBySubject } from '../groupBySubject'
import {
  useActiveIntentions,
  useActiveThanksgivings,
  useOfferThanksgiving,
  usePinnedFor,
  useRaiseIntention,
} from '../hooks'

import { CadenceToggle } from './CadenceToggle'

export type OfferingMode = 'intercessory' | 'thanksgiving' | 'both'
export type OfferingDefault = 'pinned' | 'all-active' | 'user-pick'
type OfferingShow = 'list' | 'count' | 'silent'

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

  const all = useMemo(() => {
    const out: Movement[] = []
    if (wantsIntentions) out.push(...intentions)
    if (wantsThanksgivings) out.push(...thanksgivings)
    return out
  }, [wantsIntentions, wantsThanksgivings, intentions, thanksgivings])

  // The default selection: derived purely from the props + current world.
  // New movements appearing during the flow flow into this naturally; the
  // user's manual toggles are layered on top.
  const defaults = useMemo(() => {
    const set = new Set<string>()
    if (defaultMode === 'pinned') {
      if (wantsIntentions) for (const m of pinnedIntentions) set.add(m.id)
      if (wantsThanksgivings) for (const m of pinnedThanksgivings) set.add(m.id)
    } else if (defaultMode === 'all-active') {
      for (const m of all) set.add(m.id)
    }
    return set
  }, [defaultMode, wantsIntentions, wantsThanksgivings, pinnedIntentions, pinnedThanksgivings, all])

  // Sparse overrides: only ids the user has explicitly chosen for or against.
  // Effective selection = `defaults`, with each override applied on top.
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())
  const [draft, setDraft] = useState('')
  const [cadence, setCadence] = useState<Cadence>('perpetual')
  const [adding, setAdding] = useState(false)

  const raiseIntention = useRaiseIntention()
  const offerThanksgiving = useOfferThanksgiving()
  const submitting = raiseIntention.isPending || offerThanksgiving.isPending

  const selected = useMemo(() => {
    const result = new Set<string>()
    for (const m of all) {
      const override = overrides.get(m.id)
      const on = override !== undefined ? override : defaults.has(m.id)
      if (on) result.add(m.id)
    }
    return result
  }, [all, defaults, overrides])

  if (show === 'silent') return null

  function toggle(id: string) {
    lightTap()
    setOverrides((prev) => {
      const next = new Map(prev)
      const current = next.has(id) ? (next.get(id) ?? false) : defaults.has(id)
      next.set(id, !current)
      return next
    })
  }

  if (show === 'count') {
    const count = selected.size
    return (
      <YStack gap="$xs">
        {label ? (
          <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
            {label.toUpperCase()}
          </Text>
        ) : undefined}
        <Text fontFamily="$body" fontSize="$3" color="$color" fontStyle="italic">
          {count === 0
            ? t('movements.offering.summaryEmpty')
            : t('movements.offering.summary', { count })}
        </Text>
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
    if (captureKind === 'intention') {
      await raiseIntention.mutateAsync({ text: trimmed, cadence })
    } else {
      await offerThanksgiving.mutateAsync({ text: trimmed })
    }
    successBuzz()
    setDraft('')
    setCadence('perpetual')
    setAdding(false)
  }

  const grouped = groupBySubject(all)
  const isEmpty = all.length === 0
  // The capture form opens only on an explicit "+ Add" tap, regardless of
  // whether the list is empty. Auto-opening on empty is hostile to a user
  // who didn't ask to capture anything — they just see a textarea appear
  // and wonder what they're supposed to type.
  const showForm = adding
  const placeholderKey =
    captureKind === 'intention'
      ? 'movements.capture.intentionPlaceholder'
      : 'movements.capture.thanksgivingPlaceholder'
  const submitKey =
    captureKind === 'intention' ? 'movements.capture.raise' : 'movements.capture.offer'

  return (
    <YStack gap="$sm">
      {label ? (
        <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
          {label.toUpperCase()}
        </Text>
      ) : undefined}
      <YStack
        gap="$sm"
        padding="$md"
        borderRadius="$md"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$backgroundSurface"
      >
        {!isEmpty && defaultMode === 'user-pick' ? (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
            {t('movements.offering.pickHint')}
          </Text>
        ) : undefined}
        {isEmpty && !showForm ? (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
            {t('movements.offering.empty')}
          </Text>
        ) : undefined}
        {isEmpty
          ? undefined
          : grouped.map(([subject, group]) => (
              <YStack key={subject ?? '__none'} gap="$xs">
                {subject ? (
                  <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
                    {subject}
                  </Text>
                ) : undefined}
                {group.map((m) => {
                  const isSelected = selected.has(m.id)
                  return (
                    <AnimatedPressable
                      key={m.id}
                      onPress={() => toggle(m.id)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      accessibilityLabel={m.text}
                    >
                      <XStack alignItems="center" gap="$sm" paddingVertical="$xs">
                        {isSelected ? (
                          <Check size={16} color={theme.accent?.val} />
                        ) : (
                          <Square size={16} color={theme.colorSecondary?.val} />
                        )}
                        <Text
                          fontFamily="$body"
                          fontSize="$3"
                          color={isSelected ? '$color' : '$colorSecondary'}
                          flexShrink={1}
                          flexWrap="wrap"
                        >
                          {m.text}
                        </Text>
                      </XStack>
                    </AnimatedPressable>
                  )
                })}
              </YStack>
            ))}

        {showForm ? (
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
              <XStack gap="$sm">
                <AnimatedPressable
                  onPress={() => {
                    setAdding(false)
                    setDraft('')
                  }}
                  style={{ flex: 1 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                >
                  <XStack
                    justifyContent="center"
                    paddingVertical="$sm"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Text fontFamily="$heading" fontSize="$2" color="$color" letterSpacing={1}>
                      {t('common.cancel')}
                    </Text>
                  </XStack>
                </AnimatedPressable>
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
                    <Text fontFamily="$heading" fontSize="$2" color="white" letterSpacing={1}>
                      {t(submitKey)}
                    </Text>
                  </XStack>
                </AnimatedPressable>
              </XStack>
            </YStack>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
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
                <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={0.5}>
                  {t(`movements.offering.add.${captureKind}`)}
                </Text>
              </XStack>
            </AnimatedPressable>
          </Animated.View>
        )}
      </YStack>
    </YStack>
  )
}
