import { Stack, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import { useBottomClearance } from '@/components/tabAccessory'
import { ChronicleDayRow } from '@/features/memoria'
import { useChronicle } from '@/features/plan-of-life/useRuleRecord'

export default function MemoriaScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const bottomClearance = useBottomClearance()
  const chronicle = useChronicle()

  return (
    // Not ScreenLayout: its unscrolled variant pads a fixed frame, stopping the
    // list short of the tab bar. The list pads itself and runs beneath it.
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen options={{ title: t('memoria.title') }} />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + bottomClearance + 24,
        }}
        contentInsetAdjustmentBehavior="never"
        // Rows build their day as they render, so a long history costs only
        // the days on screen.
        data={chronicle?.dates ?? []}
        extraData={chronicle?.dayAt}
        keyExtractor={(date) => date}
        renderItem={({ item }) =>
          chronicle ? <ChronicleDayRow day={chronicle.dayAt(item)} /> : null
        }
        initialNumToRender={8}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <XStack alignItems="center" gap="$md" paddingVertical="$lg">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
              <ChevronLeft size={24} color={theme.color?.val} />
            </Pressable>
            <YStack flex={1}>
              <Typography variant="screen-title">{t('memoria.title')}</Typography>
              <Typography variant="caption">{t('memoria.subtitle')}</Typography>
            </YStack>
          </XStack>
        }
      />
    </YStack>
  )
}
