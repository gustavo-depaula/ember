import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import type { PlanOfLifeTemplatePracticeRef } from '@/content/manifestTypes'
import { HourToggle } from '@/features/plan-of-life/components/HourToggle'
import { scheduleDaysLabel } from '@/features/plan-of-life/ruleString'

import { resolvePracticeName } from './resolvePractice'

const groupOf = (c: PlanOfLifeTemplatePracticeRef) =>
  c.schedule.type === 'daily' ? 'daily' : c.schedule.type === 'days-of-week' ? 'weekly' : 'monthly'

const firstDay = (c: PlanOfLifeTemplatePracticeRef) =>
  c.schedule.type === 'days-of-week' ? (c.schedule.days[0] ?? 0) : 0

/**
 * A tradition's customs as open beads beside its rule, each day's first, then
 * the week's and the month's: a tap brings one onto the string, another lets it
 * go. `chosen` holds the indexes into `customs` that are on.
 */
export function TemplateCustoms({
  customs,
  chosen,
  onToggle,
}: {
  customs: PlanOfLifeTemplatePracticeRef[]
  chosen: ReadonlySet<number>
  onToggle: (index: number) => void
}) {
  const { t } = useTranslation()
  const indexed = customs.map((custom, index) => ({ custom, index }))
  const groups = (['daily', 'weekly', 'monthly'] as const)
    .map((group) => ({
      group,
      items: indexed
        .filter(({ custom }) => groupOf(custom) === group)
        .sort(
          (a, b) =>
            firstDay(a.custom) - firstDay(b.custom) ||
            (a.custom.time ?? '').localeCompare(b.custom.time ?? ''),
        ),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <YStack gap="$xs">
      <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
        {t('templates.customs')}
      </Typography>
      <Typography variant="caption">{t('templates.customsLede')}</Typography>
      {groups.map(({ group, items }) => (
        <YStack key={group} paddingTop="$sm">
          <Typography variant="label" tone="muted" textTransform="uppercase" letterSpacing={1.5}>
            {t(`templates.customsGroup.${group}`)}
          </Typography>
          {items.map(({ custom, index }, i) => (
            <HourToggle
              key={`${custom.ref}-${index}`}
              testID={`template-custom-${custom.ref}`}
              index={i}
              count={items.length}
              label={resolvePracticeName(custom.ref)}
              time={custom.time}
              days={scheduleDaysLabel(custom.schedule, t)}
              on={chosen.has(index)}
              onToggle={() => onToggle(index)}
            />
          ))}
        </YStack>
      ))}
    </YStack>
  )
}
