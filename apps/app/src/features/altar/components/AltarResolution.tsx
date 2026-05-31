import { type LucideIcon, Pencil, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, Typography } from '@/components'
import type { Resolution } from '@/db/events'
import {
  useActiveResolutions,
  useArchiveResolution,
  useCheckinResolution,
  useResolutionReviews,
} from '@/features/resolutions'
import { lightTap } from '@/lib/haptics'

const outcomes = ['kept', 'partial', 'broken'] as const

/**
 * The Altar's Resolução tab — the day's resolves as a list (a level can hold
 * several at once). Each is a fleuron-led line with a chip check-in
 * (kept/partial/broken, the current one lit gold), plus revise + remove. Writing
 * is delegated to the joint create sheet; nothing is an inline boxed field.
 */
export function AltarResolution({
  onCreate,
  onEdit,
}: {
  onCreate: () => void
  onEdit: (resolution: { id: string; text: string }) => void
}) {
  const today = useActiveResolutions('daily')

  if (today.length === 0) return <EmptyResolution onSet={onCreate} />

  return (
    <YStack gap="$xl">
      {today.map((r) => (
        <ResolutionRow key={r.id} resolution={r} onEdit={onEdit} />
      ))}
    </YStack>
  )
}

function EmptyResolution({ onSet }: { onSet: () => void }) {
  const { t } = useTranslation()
  return (
    <YStack gap="$md">
      <Typography tone="muted" fontStyle="italic">
        {t('altar.resolutionEmpty')}
      </Typography>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          onSet()
        }}
        accessibilityRole="button"
        accessibilityLabel={t('altar.setResolution')}
      >
        <Typography variant="label" color="$accent">
          {t('altar.setResolution')}
        </Typography>
      </AnimatedPressable>
    </YStack>
  )
}

function ResolutionRow({
  resolution,
  onEdit,
}: {
  resolution: Resolution
  onEdit: (resolution: { id: string; text: string }) => void
}) {
  const { t } = useTranslation()
  const reviews = useResolutionReviews(resolution.id)
  const checkin = useCheckinResolution()
  const archive = useArchiveResolution()

  const current = [...reviews]
    .filter((r) => r.kind === 'checkin' || r.kind === 'review')
    .sort((a, b) => b.reviewed_at - a.reviewed_at)[0]?.outcome

  return (
    <YStack gap="$sm">
      <XStack gap="$sm" alignItems="baseline">
        <Typography color="$accent">⟢</Typography>
        <Typography flex={1} fontSize="$5">
          {resolution.text}
        </Typography>
      </XStack>

      <XStack gap="$sm" paddingLeft="$lg" flexWrap="wrap">
        {outcomes.map((o) => {
          const selected = current === o
          return (
            <AnimatedPressable
              key={o}
              onPress={() => {
                lightTap()
                checkin.mutate({ resolutionId: resolution.id, outcome: o })
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(`resolutions.review.outcome.${o}`)}
            >
              <XStack
                paddingVertical="$xs"
                paddingHorizontal="$md"
                borderRadius="$lg"
                backgroundColor={selected ? '$accent' : '$backgroundSurface'}
              >
                <Typography
                  variant="label"
                  fontSize="$2"
                  color={selected ? '$background' : undefined}
                  tone={selected ? undefined : 'muted'}
                >
                  {t(`resolutions.review.outcome.${o}`)}
                </Typography>
              </XStack>
            </AnimatedPressable>
          )
        })}
      </XStack>

      <XStack paddingLeft="$lg" gap="$lg">
        <RowAction
          icon={Pencil}
          label={t('altar.editResolution')}
          onPress={() => onEdit({ id: resolution.id, text: resolution.text })}
        />
        <RowAction
          icon={Trash2}
          label={t('altar.removeResolution')}
          onPress={() => archive.mutate(resolution.id)}
        />
      </XStack>
    </YStack>
  )
}

function RowAction({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon
  label: string
  onPress: () => void
}) {
  const theme = useTheme()
  return (
    <AnimatedPressable
      onPress={() => {
        lightTap()
        onPress()
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <XStack alignItems="center" gap="$xs">
        <Icon size={12} color={theme.colorSecondary?.val} />
        <Typography variant="label" fontSize="$1" tone="muted">
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
