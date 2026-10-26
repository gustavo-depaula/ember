import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'

import { RailBlock, RailLink, Typography, usePageWidth } from '@/components'
import { useCelebrationDisplay, useTodayCelebration } from '@/features/calendar'
import { RankBadge } from '@/features/calendar/components'
import { MassTimesDoor } from '@/features/search'
import { getLiturgicalDayName } from '@/lib/liturgical'
import { useOfTransfers } from '@/lib/missal/useOfTransfers'

/**
 * The liturgy of the day down Today's side column, as the website's home
 * keeps it: the day's Mass, the Office, the calendar, and where to find a
 * church.
 */
export function TodayLiturgyPanel({ date }: { date: Date }) {
  const { t } = useTranslation()
  const router = useRouter()
  const transfers = useOfTransfers()
  const width = usePageWidth()
  const principal = useTodayCelebration()?.principal
  const { name } = useCelebrationDisplay(principal)
  const dayName =
    name || getLiturgicalDayName(date, 'of', { t: (k, o) => t(k, o) as string }, transfers)

  return (
    <YStack>
      <RailBlock title={t('home.holyMass')}>
        <YStack gap="$xs" paddingBottom="$xs" alignItems="flex-start">
          <Typography fontSize="$4">{dayName}</Typography>
          {principal && <RankBadge rank={principal.rank} />}
        </YStack>
        <RailLink
          label={t('home.massOfTheDay')}
          onPress={() =>
            router.push({ pathname: '/pray/[practiceId]', params: { practiceId: 'mass' } })
          }
        />
        <RailLink label={t('calendar.title')} onPress={() => router.push('/calendar')} />
      </RailBlock>
      <RailBlock title={t('home.divineOffice')}>
        <RailLink
          label={t('home.divineOfficeSub')}
          onPress={() =>
            router.push({
              pathname: '/pray/[practiceId]',
              params: { practiceId: 'liturgy-of-the-hours' },
            })
          }
        />
      </RailBlock>
      <RailBlock>
        <MassTimesDoor width={width} />
      </RailBlock>
    </YStack>
  )
}
