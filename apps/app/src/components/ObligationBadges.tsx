import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Text, XStack, YStack } from 'tamagui'
import { calmSpring } from '@/config/animation'
import { lightTap } from '@/lib/haptics'
import type { AbstinenceLevel } from '@/lib/liturgical'
import { AnimatedPressable } from './AnimatedPressable'
import { ManuscriptFrame } from './ManuscriptFrame'

type Badge = { key: string; label: string; note: string; explanation: string }

const stagger = 120

function ModalFadeIn({ index = 0, children }: { index?: number; children: React.ReactNode }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(index * stagger, withTiming(1, { duration: 400 }))
  }, [index, progress])

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: progress.value * -4 + 4 }],
  }))

  return <Animated.View style={style}>{children}</Animated.View>
}

export function ObligationBadges({
  fast,
  abstinence,
}: {
  fast: boolean
  abstinence: AbstinenceLevel
}) {
  const { t } = useTranslation()
  const [modalVisible, setModalVisible] = useState(false)
  const badges: Badge[] = []

  if (fast) {
    badges.push({
      key: 'fast',
      label: t('obligations.fast'),
      note: t('obligations.fastNote'),
      explanation: t('obligations.fastExplanation'),
    })
  }

  if (abstinence === 'full') {
    badges.push({
      key: 'abstinence',
      label: t('obligations.abstinence'),
      note: t('obligations.abstinenceNote'),
      explanation: t('obligations.abstinenceExplanation'),
    })
  } else if (abstinence === 'partial') {
    badges.push({
      key: 'partial',
      label: t('obligations.partialAbstinence'),
      note: t('obligations.partialAbstinenceNote'),
      explanation: t('obligations.partialAbstinenceExplanation'),
    })
  } else if (abstinence === 'penance-required') {
    badges.push({
      key: 'penance',
      label: t('obligations.penance'),
      note: t('obligations.penanceNote'),
      explanation: t('obligations.penanceExplanation'),
    })
  }

  if (badges.length === 0) return null

  return (
    <>
      <AnimatedPressable
        onPress={() => {
          lightTap()
          setModalVisible(true)
        }}
        accessibilityRole="button"
        accessibilityHint={t('obligations.tapToLearnMore')}
      >
        <YStack
          backgroundColor="$backgroundSurface"
          borderLeftWidth={3}
          borderLeftColor="$colorBurgundy"
          borderRadius="$md"
          paddingVertical="$sm"
          paddingHorizontal="$md"
          gap="$md"
        >
          {badges.map((b) => (
            <YStack key={b.key} gap={4}>
              <XStack alignItems="center" gap="$sm">
                <Text fontFamily="$heading" fontSize="$2" color="$colorBurgundy">
                  ✠
                </Text>
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color="$colorBurgundy"
                  textTransform="uppercase"
                  letterSpacing={1.5}
                >
                  {b.label}
                </Text>
              </XStack>
              <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
                {b.note}
              </Text>
            </YStack>
          ))}
        </YStack>
      </AnimatedPressable>

      <ObligationModal
        visible={modalVisible}
        badges={badges}
        onClose={() => setModalVisible(false)}
      />
    </>
  )
}

function ObligationModal({
  visible,
  badges,
  onClose,
}: {
  visible: boolean
  badges: Badge[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const scale = useSharedValue(0.92)

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, calmSpring)
    }
  }, [visible, scale])

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <YStack paddingHorizontal="$lg">
            <Animated.View style={frameStyle}>
              <ManuscriptFrame backgroundColor="$background">
                <YStack alignItems="center" gap="$md" paddingVertical="$md" paddingHorizontal="$sm">
                  <ModalFadeIn index={0}>
                    <Text fontFamily="$display" fontSize="$5" color="$accent" textAlign="center">
                      ✠
                    </Text>
                  </ModalFadeIn>

                  {badges.map((b, i) => (
                    <ModalFadeIn key={b.key} index={i + 1}>
                      <YStack gap="$sm">
                        <Text
                          fontFamily="$heading"
                          fontSize="$3"
                          color="$colorBurgundy"
                          textTransform="uppercase"
                          letterSpacing={1.5}
                          textAlign="center"
                        >
                          {b.label}
                        </Text>
                        <Text
                          fontFamily="$body"
                          fontSize="$3"
                          color="$color"
                          lineHeight={28}
                          textAlign="justify"
                        >
                          {b.explanation}
                        </Text>
                      </YStack>
                    </ModalFadeIn>
                  ))}

                  <ModalFadeIn index={badges.length + 1}>
                    <AnimatedPressable
                      onPress={() => {
                        lightTap()
                        onClose()
                      }}
                    >
                      <YStack paddingVertical="$sm" paddingHorizontal="$lg" alignItems="center">
                        <Text fontFamily="$heading" fontSize="$3" color="$accent">
                          {t('obligations.dismiss')}
                        </Text>
                      </YStack>
                    </AnimatedPressable>
                  </ModalFadeIn>
                </YStack>
              </ManuscriptFrame>
            </Animated.View>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
  },
})
