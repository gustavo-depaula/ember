import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { PracticeIcon } from '@/components/PracticeIcon'
import { Typography } from '@/components/typography'
import { bareId } from '@/content/contentIndex'
import { isTemplatePlaceholder, type PlanOfLifeTemplateManifest } from '@/content/manifestTypes'
import { findGroupMemberInSet, getManifest } from '@/content/resolver'
import { useCreatePractice, useSlots, useUpdatePractice } from '@/features/plan-of-life'
import { localizeContent } from '@/lib/i18n'

import { cadenceLabel } from './cadence'
import { resolvePracticeIcon, resolvePracticeName } from './resolvePractice'

/**
 * Cherry-pick adopt. Each proposed practice falls into one of four buckets:
 *   - placeholder: shown but never adoptable (corpus doesn't host it yet)
 *   - already: exact-ref match in rule — disabled, "already in your rule"
 *   - replaces: a different member of the same alternativeTo group is in rule;
 *     adopting this row flips the existing practice's active_variant to the
 *     tradition's variant, mirroring what VariantList does manually
 *   - adoptable: new ref, creates a fresh practice + slot
 * Confirm runs the swaps and the adds; the existing rule's slots/times/tiers
 * are never touched.
 */
export function AdoptSheet({
  template,
  open,
  onClose,
  onAdopted,
}: {
  template: PlanOfLifeTemplateManifest
  open: boolean
  onClose: () => void
  onAdopted?: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const slots = useSlots()
  const createPractice = useCreatePractice()
  const updatePractice = useUpdatePractice()

  // A practice is "already in the rule" if any enabled slot shares its bare id.
  const inRule = useMemo(() => new Set(slots.map((s) => s.practice_id)), [slots])

  // Normalize each proposed practice. Stable index — a template may list the
  // same ref twice (e.g. Opus Dei's two prayer periods). Placeholders are shown
  // for fidelity but never adoptable (the corpus doesn't host them yet).
  const proposed = template.practices.map((p, i) => {
    if (isTemplatePlaceholder(p)) {
      return {
        index: i,
        placeholder: true as const,
        name: localizeContent(p.name),
        icon: p.icon ?? 'prayer',
      }
    }
    const ref = bareId(p.ref)
    const already = inRule.has(ref)
    // If an exact match isn't in the rule but a sibling in the same
    // alternativeTo group is, this row is a variant swap, not a new add.
    const replacesId = already ? undefined : findGroupMemberInSet(ref, inRule)
    return {
      index: i,
      placeholder: false as const,
      ref,
      tier: p.tier,
      time: p.time,
      schedule: p.schedule,
      name: resolvePracticeName(ref),
      icon: resolvePracticeIcon(ref),
      already,
      replacesId,
      replacesLabel: replacesId ? variantDisplayName(replacesId) : undefined,
    }
  })

  const actionable = proposed.filter((p) => !p.placeholder && !p.already)

  const [checked, setChecked] = useState<Set<number>>(() => new Set(actionable.map((p) => p.index)))

  const selectedAdds = actionable.filter((p) => checked.has(p.index) && !p.replacesId).length
  const selectedSwaps = actionable.filter((p) => checked.has(p.index) && !!p.replacesId).length
  const selectedCount = selectedAdds + selectedSwaps

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  async function confirm() {
    if (selectedCount === 0 || createPractice.isPending || updatePractice.isPending) return
    for (const p of proposed) {
      if (p.placeholder || p.already || !checked.has(p.index)) continue
      if (p.replacesId) {
        // Mirror VariantList: flip active_variant on the existing row.
        // No archive, no new slot — the user's schedule and tier survive.
        await updatePractice.mutateAsync({
          id: p.replacesId,
          data: { activeVariant: p.ref },
        })
      } else {
        await createPractice.mutateAsync({
          id: p.ref,
          slot: {
            tier: p.tier,
            time: p.time,
            schedule: JSON.stringify(p.schedule),
          },
        })
      }
    }
    // TODO: pre-fill template.resolutions into the Resolutions panel and pin
    // template.collections — deferred; practice adoption is the priority.
    onClose()
    onAdopted?.()
  }

  const ctaLabel =
    selectedCount === 0
      ? t('templates.adoptCtaEmpty')
      : selectedSwaps === 0
        ? t('templates.adoptCta', { count: selectedAdds })
        : selectedAdds === 0
          ? t('templates.adoptCtaSwapOnly', { count: selectedSwaps, swaps: selectedSwaps })
          : t('templates.adoptCtaWithSwaps', {
              count: selectedAdds,
              swaps: selectedSwaps,
            })

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={['70%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$md" height="100%">
        <YStack paddingHorizontal="$lg" gap="$xs">
          <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
            {t('templates.adoptTitle', { name: localizeContent(template.name) })}
          </Typography>
          <Typography variant="whisper">{t('templates.adoptHint')}</Typography>
        </YStack>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack paddingHorizontal="$lg" gap="$xs">
            {proposed.map((p) => {
              const disabled = p.placeholder || p.already
              const isChecked = !disabled && checked.has(p.index)
              const isSwap = !p.placeholder && !p.already && !!p.replacesId
              const caption = p.placeholder
                ? t('templates.comingSoon')
                : p.already
                  ? t('templates.alreadyInRule')
                  : isSwap
                    ? t('templates.willReplace', { name: p.replacesLabel })
                    : cadenceLabel(p.schedule, t)
              return (
                <Pressable
                  key={`${p.placeholder ? 'ph' : p.ref}-${p.index}`}
                  onPress={() => !disabled && toggle(p.index)}
                  disabled={disabled}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked, disabled }}
                  accessibilityLabel={p.name}
                >
                  <XStack
                    alignItems="center"
                    gap="$md"
                    paddingVertical="$sm"
                    opacity={disabled ? 0.45 : 1}
                  >
                    <Checkbox checked={isChecked} disabled={disabled} />
                    <PracticeIcon name={p.icon} size={20} />
                    <YStack flex={1} gap={1}>
                      <Typography variant="interface" numberOfLines={1}>
                        {p.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        tone={isSwap ? undefined : 'muted'}
                        color={isSwap ? '$accent' : undefined}
                      >
                        {caption}
                      </Typography>
                    </YStack>
                  </XStack>
                </Pressable>
              )
            })}
          </YStack>
        </ScrollView>

        <YStack paddingHorizontal="$lg">
          <Pressable
            onPress={confirm}
            disabled={selectedCount === 0 || createPractice.isPending || updatePractice.isPending}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
          >
            <YStack
              backgroundColor="$accent"
              borderRadius="$md"
              padding="$md"
              alignItems="center"
              opacity={
                selectedCount === 0 || createPractice.isPending || updatePractice.isPending
                  ? 0.5
                  : 1
              }
            >
              <Typography variant="label" fontSize="$3" color="$background">
                {ctaLabel}
              </Typography>
            </YStack>
          </Pressable>
        </YStack>
      </YStack>
    </BottomSheet>
  )
}

/**
 * Label to show in "Replaces: {name}" — prefers the variant label
 * ("Traditional", "Sacred Heart") when the practice is part of an
 * alternativeTo group, since otherwise all variants would share the same name.
 */
function variantDisplayName(ref: string): string {
  const manifest = getManifest(ref)
  if (manifest?.alternativeTo) return localizeContent(manifest.alternativeTo.label)
  return resolvePracticeName(ref)
}

/** A small square that fills gold with a check when selected — no boxed pill. */
function Checkbox({ checked, disabled }: { checked: boolean; disabled: boolean }) {
  const theme = useTheme()
  return (
    <YStack
      width={22}
      height={22}
      borderRadius={4}
      borderWidth={1.5}
      borderColor={checked ? '$accent' : '$borderColor'}
      backgroundColor={checked ? '$accent' : 'transparent'}
      alignItems="center"
      justifyContent="center"
      opacity={disabled ? 0.5 : 1}
    >
      {checked && <Check size={15} color={theme.background?.val} strokeWidth={3} />}
    </YStack>
  )
}
