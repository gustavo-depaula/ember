import { useTranslation } from 'react-i18next'
import { Modal } from 'react-native'
import { Text, YStack } from 'tamagui'

import {
  AnimatedPressable,
  FadeInView,
  HeaderFlourish,
  ManuscriptFrame,
  OrnamentalRule,
  ScreenLayout,
} from '@/components'

export function ProgramRestartModal({
  practiceName,
  missedDays,
  onRestart,
  onContinue,
}: {
  practiceName: string
  missedDays: number
  onRestart: () => void
  onContinue: () => void
}) {
  const { t } = useTranslation()

  return (
    <Modal animationType="fade" visible onRequestClose={onContinue}>
      <ScreenLayout>
        <YStack flex={1} justifyContent="center" paddingVertical="$lg">
          <FadeInView index={0}>
            <HeaderFlourish />
          </FadeInView>

          <ManuscriptFrame>
            <YStack alignItems="center" gap="$md" paddingVertical="$lg" paddingHorizontal="$md">
              <FadeInView index={1}>
                <Text fontFamily="$display" fontSize="$4" color="$accent" textAlign="center">
                  {t('program.restartModal.title')}
                </Text>
              </FadeInView>

              <FadeInView index={2}>
                <OrnamentalRule />
              </FadeInView>

              <FadeInView index={3}>
                <Text fontFamily="$body" fontSize="$3" color="$color" textAlign="center">
                  {t('program.restartModal.message', {
                    count: missedDays,
                    name: practiceName,
                  })}
                </Text>
              </FadeInView>

              <FadeInView index={4}>
                <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
                  {t('program.restartModal.didYouPray')}
                </Text>
              </FadeInView>

              <FadeInView index={5}>
                <OrnamentalRule />
              </FadeInView>

              <FadeInView index={6}>
                <YStack alignItems="center" gap="$sm" paddingTop="$md">
                  <AnimatedPressable onPress={onRestart}>
                    <YStack
                      backgroundColor="$accent"
                      borderRadius="$md"
                      paddingVertical="$sm"
                      paddingHorizontal="$lg"
                      alignItems="center"
                    >
                      <Text fontFamily="$heading" fontSize="$3" color="white">
                        {t('program.restartModal.restartButton')}
                      </Text>
                    </YStack>
                  </AnimatedPressable>

                  <AnimatedPressable onPress={onContinue}>
                    <YStack paddingVertical="$sm" paddingHorizontal="$lg" alignItems="center">
                      <Text fontFamily="$heading" fontSize="$3" color="$accent">
                        {t('program.restartModal.continueButton')}
                      </Text>
                    </YStack>
                  </AnimatedPressable>
                </YStack>
              </FadeInView>
            </YStack>
          </ManuscriptFrame>
        </YStack>
      </ScreenLayout>
    </Modal>
  )
}
