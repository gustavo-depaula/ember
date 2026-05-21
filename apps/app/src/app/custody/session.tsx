import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { CustodySessionRunner } from '@/features/custody/components/CustodySessionRunner'
import { SessionDurationPicker } from '@/features/custody/components/SessionDurationPicker'
import { useSessionStore } from '@/features/custody/sessionStore'
import { pickShieldMessage } from '@/features/custody/shieldMessages'
import type { Anchor } from '@/features/custody/types'

export default function CustodySessionScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const kind = useSessionStore((s) => s.kind)
  const start = useSessionStore((s) => s.start)

  const [minutes, setMinutes] = useState<number>(5)
  // Pull from the same rotating pool the iOS shield uses — keeps the session
  // surface consistent with the prayer-shield aesthetic.
  const anchor = useMemo<Anchor>(() => {
    const message = pickShieldMessage('session')
    return { kind: 'text', text: message.body, attribution: message.title }
  }, [])

  if (kind !== 'idle') {
    return (
      <ScreenLayout>
        <CustodySessionRunner />
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('custody.session.start')} />
        <SessionDurationPicker value={minutes} onChange={setMinutes} />
        <YStack gap="$xs" paddingHorizontal="$lg" alignItems="center">
          <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
            {anchor.kind === 'text' ? anchor.text : ''}
          </Text>
          {anchor.kind === 'text' && anchor.attribution && (
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
              {anchor.attribution}
            </Text>
          )}
        </YStack>
        <Pressable
          onPress={async () => {
            await start({ plannedSeconds: minutes * 60, anchor })
          }}
        >
          <YStack padding="$md" borderRadius="$md" backgroundColor="$accent" alignItems="center">
            <Text fontFamily="$heading" fontSize="$3" color="white">
              {t('custody.session.start')}
            </Text>
          </YStack>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
            Cancel
          </Text>
        </Pressable>
      </YStack>
    </ScreenLayout>
  )
}
