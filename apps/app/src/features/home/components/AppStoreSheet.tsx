import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { AnimatedPressable, confirm } from '@/components'
import { createSheet, NativeSheet } from '@/components/NativeSheet'
import { Typography } from '@/components/typography'
import { appStoreUrl, isTestFlight } from '@/lib/installSource'
import { track } from '@/lib/usage'

const sheet = createSheet()

// Once per launch: coming back to Today within a session doesn't ask again.
let askedThisLaunch = false

/**
 * On a TestFlight install, rises over Today at every launch to send the reader
 * to the App Store, where Ember is kept up and the test builds stop opening.
 */
export function AppStoreSheet() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (askedThisLaunch || !appStoreUrl || !isTestFlight()) return
    askedThisLaunch = true
    track('app_store_sheet', { action: 'shown' })
    sheet.open()
  }, [])

  const openStore = async () => {
    if (!appStoreUrl) return
    track('app_store_sheet', { action: 'open' })
    try {
      await Linking.openURL(appStoreUrl)
      sheet.close()
    } catch {
      confirm({ title: t('appStore.openFailed'), description: appStoreUrl, singleAction: true })
    }
  }

  return (
    <NativeSheet sheet={sheet} fraction={0.45}>
      {({ height }) => (
        <YStack
          height={height}
          paddingTop="$xl"
          paddingHorizontal="$lg"
          paddingBottom={insets.bottom + 24}
          gap="$lg"
        >
          <Typography variant="section-title">{t('appStore.title')}</Typography>
          <Typography variant="interface" fontSize="$3">
            {t('appStore.body')}
          </Typography>
          <YStack gap="$sm" marginTop="auto">
            <AnimatedPressable
              onPress={openStore}
              accessibilityRole="link"
              accessibilityLabel={t('appStore.open')}
            >
              <YStack
                backgroundColor="$accent"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$accentSubtle"
                paddingVertical="$md"
                alignItems="center"
              >
                <Typography variant="section-title" color="$background">
                  {t('appStore.open')}
                </Typography>
              </YStack>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => {
                track('app_store_sheet', { action: 'later' })
                sheet.close()
              }}
              accessibilityRole="button"
              accessibilityLabel={t('appStore.later')}
              hitSlop={12}
            >
              <YStack paddingVertical="$md" alignItems="center">
                <Typography variant="interface" tone="muted">
                  {t('appStore.later')}
                </Typography>
              </YStack>
            </AnimatedPressable>
          </YStack>
        </YStack>
      )}
    </NativeSheet>
  )
}
