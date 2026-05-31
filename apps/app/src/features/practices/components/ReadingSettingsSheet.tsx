import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text, useTheme, View, XStack, YStack } from 'tamagui'

import { LanguageSettings, ReadingConfig } from '@/components'

type Tab = 'reading' | 'language'

// Single fixed detent. The RN ScrollView inside a native SwiftUI sheet only
// scrolls when its frame is height-bounded — `flex` alone gets no bound from the
// native host — so we give the content an explicit height matching the snap.
const sheetFraction = 0.9

/**
 * Reading & language settings for the praying experience, in the app's native
 * bottom sheet (`@expo/ui` — SwiftUI `.sheet` on iOS, Material3 on Android; the
 * same component used by the Explore "From Rome" video sheet). `open` drives the
 * snap index; swipe-down / backdrop tap calls `onClose`.
 */
export function ReadingSettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const [tab, setTab] = useState<Tab>('reading')

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={[`${sheetFraction * 100}%`]}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * sheetFraction} width="100%" paddingHorizontal="$lg" paddingTop="$md">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'reading', label: t('readingConfig.reading') },
            { value: 'language', label: t('readingConfig.language') },
          ]}
        />

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 48 }}
        >
          {tab === 'reading' ? <ReadingConfig /> : <LanguageSettings />}
        </ScrollView>
      </YStack>
    </BottomSheet>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
}) {
  return (
    <XStack
      width="100%"
      gap={2}
      borderRadius="$lg"
      borderWidth={1}
      borderColor="$borderColor"
      overflow="hidden"
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <View
            key={opt.value}
            flex={1}
            paddingVertical="$sm"
            alignItems="center"
            backgroundColor={selected ? '$accent' : '$backgroundSurface'}
            pressStyle={{ opacity: 0.85 }}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text fontFamily="$heading" fontSize="$2" color={selected ? '$background' : '$color'}>
              {opt.label}
            </Text>
          </View>
        )
      })}
    </XStack>
  )
}
