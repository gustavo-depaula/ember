import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { starterTextAnchors } from '@/features/custody/anchors/starter-text'
import { CustodySessionRunner } from '@/features/custody/components/CustodySessionRunner'
import { SessionDurationPicker } from '@/features/custody/components/SessionDurationPicker'
import { ShieldAnchorPicker } from '@/features/custody/components/ShieldAnchorPicker'
import { useSessionStore } from '@/features/custody/sessionStore'
import type { Anchor } from '@/features/custody/types'
import { localizeContent } from '@/lib/i18n'

export default function CustodySessionScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const kind = useSessionStore((s) => s.kind)
  const start = useSessionStore((s) => s.start)

  // Default anchor — first starter text — so the picker isn't required.
  const defaultAnchor: Anchor = (() => {
    const seed = starterTextAnchors[0]
    return {
      kind: 'text',
      text: localizeContent({ 'en-US': seed.text['en-US'], 'pt-BR': seed.text['pt-BR'] }),
      attribution: seed.attribution,
    }
  })()

  const [minutes, setMinutes] = useState<number>(5)
  const [anchor, setAnchor] = useState<Anchor>(defaultAnchor)

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
        <ShieldAnchorPicker value={anchor} onChange={setAnchor} />
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
