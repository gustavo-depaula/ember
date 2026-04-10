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

  return (
    <Modal animationType="fade" visible onRequestClose={onDone}>
      <ScreenLayout>
        <YStack flex={1} justifyContent="center" paddingVertical="$lg">
          <FadeInView index={0}>
            <HeaderFlourish />
          </FadeInView>

          <ManuscriptFrame>
            <YStack alignItems="center" gap="$md" paddingVertical="$lg" paddingHorizontal="$md">
              <FadeInView index={1}>
                <Text fontFamily="$display" fontSize="$4" color="$accent" textAlign="center">
                  {t('program.complete')}
                </Text>
              </FadeInView>

              <FadeInView index={2}>
                <OrnamentalRule />
              </FadeInView>

              <FadeInView index={3}>
                <Text fontFamily="$body" fontSize="$3" color="$color" textAlign="center">
                  {t('program.completeMessage', { name: practiceName })}
                </Text>
              </FadeInView>

              <FadeInView index={4}>
                <OrnamentalRule />
              </FadeInView>

              <FadeInView index={5}>
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
              </FadeInView>
            </YStack>
          </ManuscriptFrame>
        </YStack>
      </ScreenLayout>
    </Modal>
  )
}
