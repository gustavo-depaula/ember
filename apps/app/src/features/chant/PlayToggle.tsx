import { useFocusEffect } from 'expo-router'
import { Play, Square } from 'lucide-react-native'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable } from 'react-native'
import { useTheme, YStack } from 'tamagui'

import { chantKey, playChant, stopChant, useChantPlayerStore } from './chantPlayer'

/**
 * Sounds a chant's melody, or stops it; leaving the page, or its tab, stops it
 * too. `id` is the chant's catalog id where it has one; a chant set in a prayer
 * or an hour is known by its score.
 */
export function PlayToggle({ id, score, name }: { id?: string; score: string; name: string }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const key = id ?? chantKey(score)
  const playing = useChantPlayerStore((s) => s.playing === key)

  // A tab keeps its pages mounted, so a page left for another tab is only blurred: stop on that.
  useFocusEffect(
    useCallback(
      () => () => {
        if (useChantPlayerStore.getState().playing === key) stopChant()
      },
      [key],
    ),
  )

  const toggle = () => {
    if (playing) return stopChant()
    playChant(key, score).catch((error: unknown) => {
      stopChant()
      Alert.alert(t('chant.playFailed'), error instanceof Error ? error.message : String(error))
    })
  }

  const Icon = playing ? Square : Play
  return (
    <Pressable
      onPress={toggle}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected: playing }}
      accessibilityLabel={t(playing ? 'a11y.stopChant' : 'a11y.playChant', { name })}
    >
      <YStack width={44} height={44} alignItems="center" justifyContent="center">
        <Icon size={18} color={theme.accentHover.val} fill={theme.accentHover.val} />
      </YStack>
    </Pressable>
  )
}
