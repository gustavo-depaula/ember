import { Columns2, Scroll, Smartphone, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'
import { ReadingConfig } from '@/components/ReadingConfigModal'
import { usePreferencesStore } from '@/stores/preferencesStore'
import type { ReaderLayout } from './protocol'

type Props = { visible: boolean; onClose: () => void }

/**
 * Book-reader settings sheet. Composes the shared `ReadingConfig` panel
 * (font, size, line height, align, margin) so changes follow users across
 * every reading surface, and adds the book-specific `bookLayout` toggle that
 * lets users override the device-default paginated/scroll choice.
 */
export function ReaderSettingsSheet({ visible, onClose }: Props) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const bookLayout = usePreferencesStore((s) => s.bookLayout)
  const setBookLayout = usePreferencesStore((s) => s.setBookLayout)
  const defaultLayout: ReaderLayout = Platform.OS === 'web' ? 'scroll' : 'paginated'
  const effectiveLayout = bookLayout ?? defaultLayout

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
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.closeModal')}
          >
            <X size={24} color={theme.color.val} />
          </Pressable>
          <Text fontFamily="$heading" fontSize="$4" color="$color">
            {t('readingConfig.reading')}
          </Text>
          <View width={24} />
        </XStack>

        <ScrollView flex={1} contentContainerStyle={{ padding: 16 }}>
          <YStack gap="$lg">
            <LayoutToggle
              value={effectiveLayout}
              defaultLayout={defaultLayout}
              isOverride={bookLayout !== undefined}
              onChange={setBookLayout}
            />
            <ReadingConfig />
          </YStack>
          <View height={insets.bottom + 24} />
        </ScrollView>
      </View>
    </Modal>
  )
}

function LayoutToggle({
  value,
  defaultLayout,
  isOverride,
  onChange,
}: {
  value: ReaderLayout
  defaultLayout: ReaderLayout
  isOverride: boolean
  onChange: (next: ReaderLayout | undefined) => void
}) {
  const theme = useTheme()
  return (
    <YStack gap="$sm">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
          Layout
        </Text>
        {isOverride ? (
          <Pressable onPress={() => onChange(undefined)} hitSlop={8}>
            <Text fontFamily="$body" fontSize="$1" color="$accent">
              Use device default
            </Text>
          </Pressable>
        ) : (
          <XStack alignItems="center" gap="$xs">
            {defaultLayout === 'paginated' ? (
              <Smartphone size={12} color={theme.colorSecondary.val} />
            ) : (
              <Smartphone size={12} color={theme.colorSecondary.val} />
            )}
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
              device default
            </Text>
          </XStack>
        )}
      </XStack>
      <XStack
        gap={0}
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
      >
        <LayoutOption
          selected={value === 'paginated'}
          icon={
            <Columns2
              size={18}
              color={value === 'paginated' ? theme.background.val : theme.color.val}
            />
          }
          label="Paginated"
          onPress={() => onChange('paginated')}
        />
        <LayoutOption
          selected={value === 'scroll'}
          icon={
            <Scroll size={18} color={value === 'scroll' ? theme.background.val : theme.color.val} />
          }
          label="Scroll"
          onPress={() => onChange('scroll')}
        />
      </XStack>
    </YStack>
  )
}

function LayoutOption({
  selected,
  icon,
  label,
  onPress,
}: {
  selected: boolean
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <XStack
        flex={1}
        height={44}
        alignItems="center"
        justifyContent="center"
        gap="$sm"
        backgroundColor={selected ? '$accent' : '$backgroundSurface'}
      >
        {icon}
        <Text fontFamily="$body" fontSize="$2" color={selected ? '$background' : '$color'}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}
