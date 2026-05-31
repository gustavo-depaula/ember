import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { create } from 'zustand'

import { AnimatedPressable } from './AnimatedPressable'

type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  singleAction?: boolean
}

type ConfirmState = {
  options: ConfirmOptions | undefined
  resolve: ((ok: boolean) => void) | undefined
  request: (options: ConfirmOptions) => Promise<boolean>
  respond: (ok: boolean) => void
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  options: undefined,
  resolve: undefined,
  request: (options) =>
    new Promise<boolean>((resolve) => {
      const prev = get().resolve
      if (prev) prev(false)
      set({ options, resolve })
    }),
  respond: (ok) => {
    const { resolve } = get()
    if (resolve) resolve(ok)
    set({ options: undefined, resolve: undefined })
  },
}))

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().request(options)
}

export function ConfirmHost() {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const options = useConfirmStore((s) => s.options)
  const respond = useConfirmStore((s) => s.respond)

  const visible = Boolean(options)
  const destructive = options?.destructive ?? false
  const singleAction = options?.singleAction ?? false
  const confirmLabel = options?.confirmLabel ?? t('common.confirm')
  const cancelLabel = options?.cancelLabel ?? t('common.cancel')

  return (
    <BottomSheet
      index={visible ? 0 : -1}
      enablePanDownToClose
      onClose={() => respond(false)}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$md" paddingBottom={insets.bottom + 16} gap="$md">
        <Text fontFamily="$heading" fontSize="$4" color="$color">
          {options?.title}
        </Text>
        {options?.description ? (
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" lineHeight="$2">
            {options.description}
          </Text>
        ) : undefined}
        <XStack gap="$sm" paddingTop="$sm">
          {singleAction ? undefined : (
            <AnimatedPressable
              onPress={() => respond(false)}
              style={{ flex: 1 }}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <XStack
                justifyContent="center"
                paddingVertical="$md"
                borderRadius="$md"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text fontFamily="$heading" fontSize="$2" color="$color" letterSpacing={1}>
                  {cancelLabel}
                </Text>
              </XStack>
            </AnimatedPressable>
          )}
          <AnimatedPressable
            onPress={() => respond(true)}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            <XStack
              justifyContent="center"
              paddingVertical="$md"
              borderRadius="$md"
              backgroundColor={destructive ? '$colorDestructive' : '$accent'}
            >
              <Text
                fontFamily="$heading"
                fontSize="$2"
                color={destructive ? 'white' : '$backgroundSurface'}
                letterSpacing={1}
              >
                {confirmLabel}
              </Text>
            </XStack>
          </AnimatedPressable>
        </XStack>
      </YStack>
    </BottomSheet>
  )
}
