import type { BilingualText } from '@ember/content-engine'
import { resolveFlow } from '@ember/content-engine'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Text, YStack } from 'tamagui'

import { ManuscriptFrame } from '@/components/ManuscriptFrame'
import { SectionBlock } from '@/components/SectionBlock'
import { createEngineContext } from '@/content/engineContext'
import { resolveCanticle, resolvePrayer } from '@/content/resolver'
import { localizeBilingual } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

export function PrayerModal({
  prayerId,
  onClose,
}: {
  prayerId: string | undefined
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { contentLanguage, secondaryLanguage } = usePreferencesStore()
  const [mounted, setMounted] = useState(false)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (prayerId) {
      setMounted(true)
      opacity.value = withTiming(1, { duration: 150 })
      return
    }
    opacity.value = withTiming(0, { duration: 120 })
    const timer = setTimeout(() => setMounted(false), 130)
    return () => clearTimeout(timer)
  }, [prayerId, opacity])

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value > 0 ? ('auto' as const) : ('none' as const),
  }))

  const prayerData = useMemo(() => {
    if (!prayerId) return undefined
    const asset = resolvePrayer(prayerId) ?? resolveCanticle(prayerId)
    if (!asset) return undefined
    const bil = (text: Record<string, string>): BilingualText =>
      localizeBilingual(text, contentLanguage, secondaryLanguage)
    if (!Array.isArray(asset.body)) {
      return {
        title: bil(asset.title),
        sections: [
          {
            type: 'prayer' as const,
            title: bil(asset.title),
            text: bil(asset.body as unknown as Record<string, string>),
          },
        ],
      }
    }
    const ec = createEngineContext()
    const sections = resolveFlow({ sections: asset.body }, { date: new Date() }, ec)
    return { title: bil(asset.title), sections }
  }, [prayerId, contentLanguage, secondaryLanguage])

  if (!mounted) return undefined

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: 32,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.closeModal')}
      />
      <YStack
        backgroundColor="$background"
        maxWidth={360}
        width="100%"
        style={{ maxHeight: '85%' }}
      >
        <ManuscriptFrame>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {prayerData ? (
              <YStack gap="$sm">
                <Text fontFamily="$heading" fontSize="$3" color="$accent" textAlign="center">
                  {prayerData.title.primary}
                </Text>
                {prayerData.sections.map((s, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static prayer sections never reorder
                  <SectionBlock key={`${s.type}-${i}`} section={s} />
                ))}
              </YStack>
            ) : null}
          </ScrollView>
        </ManuscriptFrame>
      </YStack>
    </Animated.View>
  )
}
