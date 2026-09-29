import { format } from 'date-fns'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'

import { Typography } from '@/components'
import { createSheet, NativeSheet } from '@/components/NativeSheet'
import { getManifest } from '@/content/resolver'
import { getPreference, setPreference } from '@/db/repositories/preferences'
import { useStableToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'

import { useRestartNeededPractices } from '../hooks'
import { FootLink, MissedDays } from './MissedDays'

const sheet = createSheet()

// The day the sheet last rose: it warns once a day, not on every return to Today.
const shownOnKey = 'missed-days-shown-on'

/**
 * Rises over Today when a program a missed day sends back to its start — the
 * First Fridays, a triduum — is waiting on the choice to restart.
 */
export function MissedDaysSheet() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const ids = [...useRestartNeededPractices()].sort()
  const key = ids.join(',')
  const day = format(useStableToday(), 'yyyy-MM-dd')

  useEffect(() => {
    if (!key) return sheet.close()
    let live = true
    void getPreference(shownOnKey).then(async (last) => {
      if (!live || last === day) return
      sheet.open()
      await setPreference(shownOnKey, day)
    })
    return () => {
      live = false
    }
  }, [key, day])

  return (
    <NativeSheet sheet={sheet}>
      {({ height, expanded, bodyShown }) => (
        <YStack height={height} paddingTop="$xl">
          <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={expanded}>
            <YStack paddingHorizontal="$lg" paddingBottom={insets.bottom + 48} gap="$xl">
              {bodyShown &&
                ids.map((id) => {
                  const manifest = getManifest(id)
                  if (!manifest?.program) return null
                  return (
                    <YStack key={id} alignItems="center" gap="$md">
                      <Typography variant="label" textTransform="uppercase" letterSpacing={1.5}>
                        {localizeContent(manifest.name)}
                      </Typography>
                      <MissedDays practiceId={id} program={manifest.program} />
                      <FootLink
                        label={t('program.openProgram')}
                        chevron
                        onPress={() => {
                          sheet.close()
                          router.push({
                            pathname: '/practices/[manifestId]/program',
                            params: { manifestId: id },
                          })
                        }}
                      />
                    </YStack>
                  )
                })}
            </YStack>
          </ScrollView>
        </YStack>
      )}
    </NativeSheet>
  )
}
