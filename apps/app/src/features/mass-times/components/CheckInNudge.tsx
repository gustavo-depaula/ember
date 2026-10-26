import { Check, MapPin, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import Animated, { FadeOut, SlideInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useThemeName, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, Typography } from '@/components'
import { GlassSurface } from '@/components/GlassSurface'
import { successBuzz } from '@/lib/haptics'
import { checkIn } from '../checkins'
import { type ChurchHere, dismissCheckInNudge, useCheckInNudge } from '../churchHere'

// Long enough to read a church's name and reach for the button; short enough to leave by itself.
const shownMs = 8000
const thanksMs = 1600

/**
 * "At São Francisco? [Check in]" — shown at the root after Mass is ticked on Hoje near a church (see
 * `offerMassCheckIn`). The Mass is already marked, so checking in only adds where it was.
 */
export function CheckInNudge() {
  const church = useCheckInNudge()
  if (!church) return null
  // Keyed so a second offer restarts the timer and the thanks.
  return <NudgeToast key={church.id} church={church} />
}

function NudgeToast({ church }: { church: ChurchHere }) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const isDark = useThemeName().startsWith('dark')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const id = setTimeout(dismissCheckInNudge, done ? thanksMs : shownMs)
    return () => clearTimeout(id)
  }, [done])

  const accept = async () => {
    setSaving(true)
    try {
      await checkIn(church, { kind: 'mass' }, { massMarked: true })
    } catch {
      setSaving(false)
      dismissCheckInNudge()
      confirm({ title: t('massTimes.saveFailed'), singleAction: true })
      return
    }
    void successBuzz()
    setDone(true)
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 84 }]}>
      <Animated.View entering={SlideInDown.duration(280)} exiting={FadeOut.duration(200)}>
        <GlassSurface
          isDark={isDark}
          tintColor={isDark ? 'rgba(28,26,24,0.75)' : 'rgba(244,240,234,0.85)'}
          style={styles.toast}
        >
          {done ? (
            <XStack alignItems="center" gap="$sm" minHeight={44}>
              <Check size={18} color={theme.colorGreen?.val} />
              <Typography variant="interface" fontSize="$3">
                {t('massTimes.checkedIn')}
              </Typography>
            </XStack>
          ) : (
            <XStack alignItems="center" gap="$md">
              <MapPin size={18} color={theme.colorSecondary?.val} />
              <YStack flex={1}>
                <Typography variant="interface" fontSize="$3" numberOfLines={1}>
                  {t('massTimes.nudgeQuestion')}
                </Typography>
                <Typography variant="annotation" numberOfLines={1}>
                  {church.name}
                </Typography>
              </YStack>
              <AnimatedPressable
                onPress={() => void accept()}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={t('massTimes.checkInAt', { name: church.name })}
              >
                <XStack
                  minHeight={40}
                  paddingHorizontal="$md"
                  borderRadius={10}
                  backgroundColor="$color"
                  alignItems="center"
                  opacity={saving ? 0.5 : 1}
                >
                  <Typography variant="interface" fontSize="$2" color="$background">
                    {t('massTimes.checkInShort')}
                  </Typography>
                </XStack>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={dismissCheckInNudge}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('massTimes.notNow')}
              >
                <X size={18} color={theme.colorSecondary?.val} />
              </AnimatedPressable>
            </XStack>
          )}
        </GlassSurface>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, zIndex: 100 },
  toast: { borderRadius: 16, overflow: 'hidden', paddingVertical: 10, paddingHorizontal: 14 },
})
