import { Check, Star } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { useShallow } from 'zustand/react/shallow'

import { AnimatedPressable, BottomSheet } from '@/components'
import { getManifest } from '@/content/resolver'
import { useEventStore } from '@/db/events'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'

import { usePinMovement, usePinnedPracticesFor, useUnpinMovement } from '../hooks'

export function PinPracticeSheet({
  movementId,
  visible,
  onClose,
}: {
  movementId: string | undefined
  visible: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const userPractices = useEventStore(
    useShallow((s) => [...s.practices.values()].filter((p) => p.archived === 0)),
  )
  const pinnedPracticeIds = usePinnedPracticesFor(movementId ?? '')

  const pinMutation = usePinMovement()
  const unpinMutation = useUnpinMovement()

  if (!movementId) return null

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="80%">
      <Text fontFamily="$heading" fontSize="$4" color="$color">
        {t('movements.pinPractice.title')}
      </Text>
      <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
        {t('movements.pinPractice.subtitle')}
      </Text>

      <ScrollView style={{ flex: 1 }}>
        <YStack gap="$xs">
          {userPractices.length === 0 ? (
            <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
              {t('movements.pinPractice.empty')}
            </Text>
          ) : (
            userPractices.map((p) => {
              const manifest = getManifest(p.practice_id)
              const name =
                p.custom_name ?? (manifest ? localizeContent(manifest.name) : p.practice_id)
              const isPinned = pinnedPracticeIds.includes(p.practice_id)
              return (
                <AnimatedPressable
                  key={p.practice_id}
                  onPress={() => {
                    lightTap()
                    if (isPinned) {
                      unpinMutation.mutate({ practiceId: p.practice_id, movementId })
                    } else {
                      pinMutation.mutate({ practiceId: p.practice_id, movementId })
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isPinned }}
                >
                  <XStack
                    alignItems="center"
                    gap="$sm"
                    paddingVertical="$md"
                    paddingHorizontal="$md"
                    borderRadius="$md"
                    borderWidth={1}
                    borderColor={isPinned ? '$accent' : '$borderColor'}
                    backgroundColor={isPinned ? '$accentSubtle' : '$backgroundSurface'}
                  >
                    <Star
                      size={16}
                      color={isPinned ? theme.accent?.val : theme.colorSecondary?.val}
                      fill={isPinned ? theme.accent?.val : 'none'}
                    />
                    <Text fontFamily="$body" fontSize="$3" color="$color" flex={1}>
                      {name}
                    </Text>
                    {isPinned ? <Check size={14} color={theme.accent?.val} /> : undefined}
                  </XStack>
                </AnimatedPressable>
              )
            })
          )}
        </YStack>
      </ScrollView>

      <AnimatedPressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.done')}
      >
        <XStack
          justifyContent="center"
          paddingVertical="$md"
          borderRadius="$md"
          backgroundColor="$accent"
        >
          <Text fontFamily="$heading" fontSize="$2" color="white" letterSpacing={1}>
            {t('common.done')}
          </Text>
        </XStack>
      </AnimatedPressable>
    </BottomSheet>
  )
}
