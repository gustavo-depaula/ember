import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { CommitmentList } from '@/features/custody/components/CommitmentList'

export default function CustodyScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('custody.title')} />
        <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
          {t('custody.tagline')}
        </Text>

        <XStack gap="$md">
          <Pressable onPress={() => router.push('/custody/new')} style={{ flex: 1 }}>
            <YStack padding="$md" borderRadius="$md" backgroundColor="$accent" alignItems="center">
              <Text fontFamily="$heading" fontSize="$2" color="white">
                {t('custody.commitments.create')}
              </Text>
            </YStack>
          </Pressable>
          <Pressable onPress={() => router.push('/custody/session')} style={{ flex: 1 }}>
            <YStack
              padding="$md"
              borderRadius="$md"
              borderWidth={1}
              borderColor="$accent"
              alignItems="center"
            >
              <Text fontFamily="$heading" fontSize="$2" color="$accent">
                {t('custody.session.start')}
              </Text>
            </YStack>
          </Pressable>
        </XStack>

        <CommitmentList />
      </YStack>
    </ScreenLayout>
  )
}
