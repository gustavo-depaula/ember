import { AlignJustify, AlignLeft, Type, X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'

import { readingFonts } from '@/config/readingFonts'
import { useReadingMargin, useReadingStyle } from '@/hooks/useReadingStyle'
import { useReadingConfigStore } from '@/stores/readingConfigStore'

const previewHeight = 180

function ToolbarButton({
  onPress,
  selected,
  disabled,
  children,
}: {
  onPress: () => void
  selected?: boolean
  disabled?: boolean
  children: (pressed: boolean) => React.ReactNode
}) {
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <YStack
        backgroundColor={selected ? '$accent' : pressed ? '$borderColor' : '$backgroundSurface'}
        width={52}
        height={52}
        borderRadius="$md"
        alignItems="center"
        justifyContent="center"
        opacity={disabled ? 0.3 : 1}
        scale={pressed && !selected ? 0.92 : 1}
      >
        {children(pressed)}
      </YStack>
    </Pressable>
  )
}

function ButtonGroup({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <YStack alignItems="center" gap={4}>
      <XStack
        gap={2}
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
      >
        {children}
      </XStack>
      <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
        {label}
      </Text>
    </YStack>
  )
}

export function ReadingConfigBadge({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Pressable onPress={onPress}>
      <XStack alignItems="center" gap="$sm">
        <View
          width={32}
          height={32}
          borderRadius={8}
          backgroundColor="$backgroundSurface"
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Type size={16} color={theme.accent.val} />
        </View>
        <Text fontFamily="$heading" fontSize="$2" color="$color">
          {t('readingConfig.reading')}
        </Text>
      </XStack>
    </Pressable>
  )
}

export function ReadingConfig() {
  const { t } = useTranslation()
  const theme = useTheme()
  const rc = useReadingConfigStore()
  const readingStyle = useReadingStyle()
  const readingMargin = useReadingMargin()

  return (
    <YStack gap="$lg">
      {/* Fixed-height preview so buttons don't shift */}
      <YStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        paddingHorizontal={readingMargin}
        height={previewHeight}
        overflow="hidden"
      >
        <Text color="$color" {...readingStyle}>
          {t('readingConfig.preview')}
        </Text>
      </YStack>

      {/* Row 1: Size + Spacing */}
      <XStack justifyContent="center" gap="$lg">
        <ButtonGroup label={t('readingConfig.size')}>
          <ToolbarButton
            onPress={() => rc.setFontSizeStep(rc.fontSizeStep - 1)}
            disabled={rc.fontSizeStep <= 1}
          >
            {() => (
              <Text fontFamily="$body" fontSize={15} color="$color">
                a
              </Text>
            )}
          </ToolbarButton>
          <ToolbarButton
            onPress={() => rc.setFontSizeStep(rc.fontSizeStep + 1)}
            disabled={rc.fontSizeStep >= 5}
          >
            {() => (
              <Text fontFamily="$body" fontSize={24} color="$color">
                A
              </Text>
            )}
          </ToolbarButton>
        </ButtonGroup>

        <ButtonGroup label={t('readingConfig.spacing')}>
          <ToolbarButton
            onPress={() => rc.setLineHeightStep(rc.lineHeightStep - 1)}
            disabled={rc.lineHeightStep <= Math.max(1, rc.fontSizeStep - 1)}
          >
            {() => (
              <Text fontFamily="$body" fontSize={20} color="$color">
                −
              </Text>
            )}
          </ToolbarButton>
          <ToolbarButton
            onPress={() => rc.setLineHeightStep(rc.lineHeightStep + 1)}
            disabled={rc.lineHeightStep >= 5}
          >
            {() => (
              <Text fontFamily="$body" fontSize={20} color="$color">
                =
              </Text>
            )}
          </ToolbarButton>
        </ButtonGroup>
      </XStack>

      {/* Row 2: Align + Margins */}
      <XStack justifyContent="center" gap="$lg">
        <ButtonGroup label={t('readingConfig.align')}>
          <ToolbarButton onPress={() => rc.setTextAlign('left')} selected={rc.textAlign === 'left'}>
            {() => (
              <AlignLeft
                size={22}
                color={rc.textAlign === 'left' ? theme.background.val : theme.color.val}
              />
            )}
          </ToolbarButton>
          <ToolbarButton
            onPress={() => rc.setTextAlign('justify')}
            selected={rc.textAlign === 'justify'}
          >
            {() => (
              <AlignJustify
                size={22}
                color={rc.textAlign === 'justify' ? theme.background.val : theme.color.val}
              />
            )}
          </ToolbarButton>
        </ButtonGroup>

        <ButtonGroup label={t('readingConfig.margins')}>
          <ToolbarButton onPress={() => rc.setMargin('narrow')} selected={rc.margin === 'narrow'}>
            {() => (
              <Text
                fontFamily="$heading"
                fontSize={18}
                color={rc.margin === 'narrow' ? '$background' : '$color'}
              >
                ][
              </Text>
            )}
          </ToolbarButton>
          <ToolbarButton onPress={() => rc.setMargin('normal')} selected={rc.margin === 'normal'}>
            {() => (
              <Text
                fontFamily="$heading"
                fontSize={18}
                color={rc.margin === 'normal' ? '$background' : '$color'}
                letterSpacing={4}
              >
                ][
              </Text>
            )}
          </ToolbarButton>
          <ToolbarButton onPress={() => rc.setMargin('wide')} selected={rc.margin === 'wide'}>
            {() => (
              <Text
                fontFamily="$heading"
                fontSize={18}
                color={rc.margin === 'wide' ? '$background' : '$color'}
                letterSpacing={8}
              >
                ][
              </Text>
            )}
          </ToolbarButton>
        </ButtonGroup>
      </XStack>

      {/* Font list */}
      <YStack gap="$xs">
        {readingFonts.map((f) => {
          const selected = rc.fontFamily === f.id
          return (
            <Pressable key={f.id} onPress={() => rc.setFontFamily(f.id)}>
              <XStack
                backgroundColor={selected ? '$accent' : '$backgroundSurface'}
                borderRadius="$lg"
                padding="$sm"
                paddingHorizontal="$md"
                alignItems="center"
                justifyContent="space-between"
              >
                <YStack>
                  <Text
                    fontFamily={f.family as '$body'}
                    fontSize="$3"
                    color={selected ? '$background' : '$color'}
                  >
                    {f.label}
                  </Text>
                  <Text
                    fontFamily="$body"
                    fontSize="$1"
                    color={selected ? '$background' : '$colorSecondary'}
                    opacity={selected ? 0.8 : 1}
                  >
                    {f.description}
                  </Text>
                </YStack>
              </XStack>
            </Pressable>
          )
        })}
      </YStack>
    </YStack>
  )
}

export function ReadingConfigModal({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const theme = useTheme()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View flex={1} backgroundColor="$background">
        <XStack
          paddingTop={insets.top + 8}
          paddingBottom="$sm"
          paddingHorizontal="$lg"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={24} color={theme.color.val} />
          </Pressable>
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('readingConfig.reading')}
          </Text>
          <View width={24} />
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <ReadingConfig />
          <View height={insets.bottom + 24} />
        </ScrollView>
      </View>
    </Modal>
  )
}
