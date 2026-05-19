import type { ReactNode } from 'react'
import { Modal, Pressable } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, YStack } from 'tamagui'

export function BottomSheet({
  visible,
  onClose,
  animation = 'slide',
  maxHeight,
  children,
}: {
  visible: boolean
  onClose: () => void
  animation?: 'slide' | 'fade'
  maxHeight?: string | number
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} transparent animationType={animation} onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={onClose}
          accessibilityRole="button"
        >
          <View flex={1} justifyContent="flex-end">
            <Pressable onPress={(e) => e.stopPropagation()} aria-hidden>
              <YStack
                backgroundColor="$background"
                borderTopLeftRadius="$lg"
                borderTopRightRadius="$lg"
                paddingTop="$lg"
                paddingHorizontal="$lg"
                paddingBottom={insets.bottom + 16}
                gap="$md"
                {...(maxHeight !== undefined ? { maxHeight } : {})}
              >
                {children}
              </YStack>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  )
}
