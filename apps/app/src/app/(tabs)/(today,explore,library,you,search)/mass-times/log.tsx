import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { ScreenLayout, Typography } from '@/components'
import { BackHeader, MassLog, useCheckInCount } from '@/features/mass-times'

export default function MassLogScreen() {
  const { t } = useTranslation()
  const count = useCheckInCount()

  return (
    <ScreenLayout scroll={false}>
      <YStack flex={1} gap="$lg" paddingVertical="$md">
        <BackHeader label={t('massTimes.title')} />
        <YStack gap="$xs">
          <Typography variant="screen-title" fontSize={28} lineHeight={32}>
            {t('massTimes.massLog')}
          </Typography>
          {count > 0 ? (
            <Typography variant="annotation">
              {t('massTimes.attendanceCount', { count })}
            </Typography>
          ) : null}
        </YStack>
        <MassLog />
      </YStack>
    </ScreenLayout>
  )
}
