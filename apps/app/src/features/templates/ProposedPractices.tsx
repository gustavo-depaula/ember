import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { XStack, YStack } from 'tamagui'

import { AnimatedPressable } from '@/components'
import { PracticeIcon } from '@/components/PracticeIcon'
import { Typography } from '@/components/typography'
import { bareId } from '@/content/contentIndex'
import {
  isTemplatePlaceholder,
  type PlanOfLifeTemplateManifest,
  type PlanOfLifeTemplatePractice,
} from '@/content/manifestTypes'
import { TierBadge } from '@/features/plan-of-life/components/TierBadge'
import { localizeContent } from '@/lib/i18n'

import { cadenceLabel } from './cadence'
import { resolvePracticeIcon, resolvePracticeName } from './resolvePractice'

/**
 * The rule, walked practice by practice — each row interweaves *what* it is with
 * *why* this tradition keeps it (the `note`), under the practice name. Cadence
 * and tier sit quietly beneath. Practices the corpus doesn't host yet show as
 * placeholders ("coming soon"), named faithfully but never approximated.
 */
export function ProposedPractices({ template }: { template: PlanOfLifeTemplateManifest }) {
  const { t } = useTranslation()

  return (
    <YStack gap="$md">
      <Typography variant="marker" textAlign="left">
        {t('templates.proposedPractices')}
      </Typography>
      <YStack gap="$lg">
        {template.practices.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a ref may repeat (e.g. two prayer periods)
          <PracticeLine key={`${rowKey(p)}-${i}`} practice={p} />
        ))}
      </YStack>
    </YStack>
  )
}

function rowKey(p: PlanOfLifeTemplatePractice): string {
  return isTemplatePlaceholder(p) ? 'placeholder' : bareId(p.ref)
}

function PracticeLine({ practice }: { practice: PlanOfLifeTemplatePractice }) {
  const { t } = useTranslation()
  const router = useRouter()
  const placeholder = isTemplatePlaceholder(practice)
  const ref = placeholder ? undefined : bareId(practice.ref)

  const name = placeholder ? localizeContent(practice.name) : resolvePracticeName(ref ?? '')
  const icon = placeholder ? (practice.icon ?? 'prayer') : resolvePracticeIcon(ref ?? '')
  const note = practice.note ? localizeContent(practice.note) : undefined
  const meta = placeholder
    ? practice.cadence
      ? localizeContent(practice.cadence)
      : undefined
    : practice.time
      ? `${practice.time} · ${cadenceLabel(practice.schedule, t)}`
      : cadenceLabel(practice.schedule, t)

  const row = (
    <XStack gap="$md" alignItems="flex-start" opacity={placeholder ? 0.6 : 1}>
      <YStack paddingTop={2}>
        <PracticeIcon name={icon} size={22} />
      </YStack>
      <YStack flex={1} gap="$xs">
        <XStack alignItems="center" gap="$sm" flexWrap="wrap">
          <Typography variant="section-title" textAlign="left" fontSize="$4">
            {name}
          </Typography>
          {placeholder ? (
            <Typography variant="reference" tone="muted" textTransform="uppercase">
              {t('templates.comingSoon')}
            </Typography>
          ) : undefined}
        </XStack>

        {note ? (
          <Typography variant="interface" fontSize="$3" color="$colorSecondary" lineHeight={24}>
            {note}
          </Typography>
        ) : undefined}

        <XStack alignItems="center" gap="$sm">
          {!placeholder && <TierBadge tier={practice.tier} />}
          {meta ? (
            <Typography variant="caption" tone="muted">
              {meta}
            </Typography>
          ) : undefined}
        </XStack>
      </YStack>
    </XStack>
  )

  // A placeholder isn't a real corpus practice, so it has nowhere to go.
  if (!ref) return row

  return (
    <AnimatedPressable
      onPress={() =>
        router.push({ pathname: '/practices/[manifestId]', params: { manifestId: ref } })
      }
      accessibilityRole="link"
      accessibilityLabel={name}
    >
      {row}
    </AnimatedPressable>
  )
}
