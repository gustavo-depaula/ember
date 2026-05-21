import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { useCommitments } from '../hooks'

import { CommitmentRow } from './CommitmentRow'

export function CommitmentList() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: commitments, isPending } = useCommitments({ includeArchived: false })

  if (isPending) {
    return (
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
        …
      </Text>
    )
  }

  if (!commitments || commitments.length === 0) {
    return (
      <Pressable
        onPress={() => router.push('/custody/new')}
        accessibilityRole="button"
        accessibilityLabel={t('custody.empty.cta')}
      >
        <YStack
          alignItems="center"
          gap="$sm"
          paddingVertical="$xl"
          paddingHorizontal="$lg"
          borderRadius="$lg"
          borderWidth={1}
          borderColor="$borderColor"
          borderStyle="dashed"
          backgroundColor="$backgroundSurface"
        >
          <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
            {t('custody.empty.heading')}
          </Text>
          <Text fontFamily="$heading" fontSize="$2" color="$accent">
            {t('custody.empty.cta')}
          </Text>
        </YStack>
      </Pressable>
    )
  }

  return (
    <YStack gap="$sm">
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
