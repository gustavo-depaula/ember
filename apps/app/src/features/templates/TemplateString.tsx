import { useTranslation } from 'react-i18next'
import { useTheme, useThemeName, YStack } from 'tamagui'

import { Typography } from '@/components'
import {
  isTemplatePlaceholder,
  type PlanOfLifeTemplateManifest,
  type PlanOfLifeTemplatePracticeRef,
} from '@/content/manifestTypes'
import { BeadRow } from '@/features/plan-of-life/components/BeadRow'
import {
  beadRadius,
  formatSlotTime,
  hourHue,
  scheduleDaysLabel,
} from '@/features/plan-of-life/ruleString'
import { resolvePracticeName } from './resolvePractice'

const byHour = (a: PlanOfLifeTemplatePracticeRef, b: PlanOfLifeTemplatePracticeRef) =>
  Number(a.schedule.type !== 'daily') - Number(b.schedule.type !== 'daily') ||
  (a.time ?? '').localeCompare(b.time ?? '')

/**
 * A tradition's rule as the string it will make in the plan: a bead for each
 * practice in the hue of its hour, sized by its tier. What it asks first, then
 * (when it has any) what it holds out for the days one can go further.
 */
export function TemplateString({ template }: { template: PlanOfLifeTemplateManifest }) {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const dark = useThemeName().startsWith('dark')
  const practices = template.practices.filter(
    (p): p is PlanOfLifeTemplatePracticeRef => !isTemplatePlaceholder(p),
  )
  const essential = practices.filter((p) => p.tier === 'essential').sort(byHour)
  const beyond = practices.filter((p) => p.tier !== 'essential').sort(byHour)
  const strings = beyond.length
    ? [
        { label: t('onboarding.essential'), practices: essential },
        { label: t('onboarding.beyond'), practices: beyond },
      ]
    : [{ label: undefined, practices: essential }]

  return (
    <YStack gap="$md">
      {strings.map(({ label, practices: beads }) => (
        <YStack key={label ?? 'all'} gap="$xs">
          {label ? (
            <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
              {label}
            </Typography>
          ) : null}
          <YStack>
            {beads.map((p, i) => {
              const days = scheduleDaysLabel(p.schedule, t)
              return (
                <BeadRow
                  // biome-ignore lint/suspicious/noArrayIndexKey: a ref may repeat (two periods of prayer)
                  key={`${p.ref}-${i}`}
                  index={i}
                  count={beads.length}
                  hue={hourHue(p.time ?? null, dark)}
                  radius={beadRadius[p.tier]}
                  hollow={!!days}
                  background={theme.background.val}
                  name={resolvePracticeName(p.ref)}
                  when={[days, p.time && formatSlotTime(p.time, i18n.language)]
                    .filter(Boolean)
                    .join(' ')}
                />
              )
            })}
          </YStack>
        </YStack>
      ))}
    </YStack>
  )
}
