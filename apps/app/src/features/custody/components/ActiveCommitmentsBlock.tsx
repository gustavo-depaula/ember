import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'

import { useActiveCommitmentsToday } from '../hooks'

import { CommitmentRow } from './CommitmentRow'

export function ActiveCommitmentsBlock() {
  const { t } = useTranslation()
  const router = useRouter()
  const commitments = useActiveCommitmentsToday()

  if (commitments.length === 0) return null

  return (
    <YStack gap="$sm">
      <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary" paddingHorizontal="$xs">
        {t('custody.activeToday', { defaultValue: 'TODAY’S COMMITMENTS' })}
      </Text>
      {commitments.map((c) => (
        <CommitmentRow
          key={c.id}
          commitment={c}
          onPress={() =>
            router.push({ pathname: '/custody/[commitmentId]', params: { commitmentId: c.id } })
          }
        />
      ))}
    </YStack>
  )
}
