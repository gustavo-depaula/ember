import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Text, YStack } from 'tamagui'

import { AnimatedPressable, ManuscriptFrame, OrnamentalRule, ScreenLayout } from '@/components'
import { calmSpring } from '@/config/animation'
import { successBuzz } from '@/lib/haptics'

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

export function ProgramCompleteModal({
  practiceName,
  showRestart,
  onRestart,
  onDone,
}: {
  practiceName: string
  showRestart: boolean
  onRestart: () => void
  onDone: () => void
}) {
  const { t } = useTranslation()
  const scale = useSharedValue(0.92)

  useEffect(() => {
    scale.value = withSpring(1, calmSpring)
    successBuzz()
  }, [scale])

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Modal animationType="fade" visible onRequestClose={onDone}>
      <ScreenLayout>
        <YStack flex={1} justifyContent="center" paddingVertical="$lg">
          <Animated.View style={frameStyle}>
            <ManuscriptFrame>
              <YStack alignItems="center" gap="$md" paddingVertical="$lg" paddingHorizontal="$md">
                <ModalFadeIn index={1}>
                  <Text fontFamily="$display" fontSize="$5" color="$accent" textAlign="center">
                    ✠
                  </Text>
                </ModalFadeIn>

                <ModalFadeIn index={2}>
                  <Text fontFamily="$display" fontSize="$4" color="$accent" textAlign="center">
                    {t('program.complete')}
                  </Text>
                </ModalFadeIn>

                <ModalFadeIn index={3}>
                  <OrnamentalRule />
                </ModalFadeIn>

                <ModalFadeIn index={4}>
                  <Text fontFamily="$body" fontSize="$3" color="$color" textAlign="center">
                    {t('program.completeMessage', { name: practiceName })}
                  </Text>
                </ModalFadeIn>

                <ModalFadeIn index={5}>
                  <Text
                    fontFamily="$script"
                    fontSize="$3"
                    color="$colorSecondary"
                    textAlign="center"
                  >
                    {t('program.completeCelebration')}
                  </Text>
                </ModalFadeIn>

                <ModalFadeIn index={6}>
                  <OrnamentalRule />
                </ModalFadeIn>

                <ModalFadeIn index={7}>
                  <YStack alignItems="center" gap="$sm" paddingTop="$md">
                    {showRestart && (
                      <AnimatedPressable onPress={onRestart}>
                        <YStack
                          backgroundColor="$accent"
                          borderRadius="$md"
                          paddingVertical="$sm"
                          paddingHorizontal="$lg"
                          alignItems="center"
                        >
                          <Text fontFamily="$heading" fontSize="$3" color="white">
                            {t('program.restart')}
                          </Text>
                        </YStack>
                      </AnimatedPressable>
                    )}

                    <AnimatedPressable onPress={onDone}>
                      <YStack paddingVertical="$sm" paddingHorizontal="$lg" alignItems="center">
                        <Text fontFamily="$heading" fontSize="$3" color="$accent">
                          {t('program.done')}
                        </Text>
                      </YStack>
                    </AnimatedPressable>
                  </YStack>
                </ModalFadeIn>
              </YStack>
            </ManuscriptFrame>
          </Animated.View>
        </YStack>
      </ScreenLayout>
    </Modal>
  )
}
