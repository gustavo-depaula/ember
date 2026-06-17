import { Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { mediumTap } from '@/lib/haptics'
import type { CheckIn } from '../checkins'
import { useCheckInsStore, useRecentCheckIns } from '../checkins'
import { AnimatedRow } from './AnimatedRow'
import { useGlassTile } from './glass'

// The personal Mass log: every recorded visit, newest first, each removable and tapping through to the
// church (place mode in the sheet). `onGlass` blends the rows on the sheet's glass.
export function MassLog({
  onSelectChurch,
  onGlass,
}: {
  onSelectChurch: (church: { id: string; name: string }) => void
  onGlass?: boolean
}) {
  const { t, i18n } = useTranslation()
  const checkins = useRecentCheckIns()
  const remove = useCheckInsStore((s) => s.remove)

  if (checkins.length === 0) {
    return (
      <YStack paddingTop="$lg" alignItems="center" gap="$xs">
        <Typography variant="interface">{t('massTimes.logEmpty')}</Typography>
        <Typography variant="annotation">{t('massTimes.logEmptyHint')}</Typography>
      </YStack>
    )
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      nestedScrollEnabled
      data={checkins}
      keyExtractor={(c) => c.id}
      renderItem={({ item, index }) => (
        <AnimatedRow index={index} exiting>
          <CheckInRow
            item={item}
            locale={i18n.language}
            onGlass={onGlass}
            onPress={() => onSelectChurch({ id: item.churchId, name: item.churchName })}
            onRemove={() => remove(item.id)}
          />
        </AnimatedRow>
      )}
      ItemSeparatorComponent={() => <YStack height="$sm" />}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    />
  )
}

function CheckInRow({
  item,
  locale,
  onPress,
  onRemove,
  onGlass,
}: {
  item: CheckIn
  locale: string
  onPress: () => void
  onRemove: () => void
  onGlass?: boolean
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const tile = useGlassTile()
  const when = new Date(item.at).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <XStack
      backgroundColor={onGlass ? tile : '$backgroundSurface'}
      borderRadius="$lg"
      padding="$md"
      alignItems="center"
      justifyContent="space-between"
      gap="$sm"
    >
      <AnimatedPressable style={{ flexShrink: 1 }} onPress={onPress} accessibilityRole="button">
        <YStack flexShrink={1} gap="$xs">
          <Typography variant="interface" fontSize="$4" fontWeight="600">
            {item.churchName}
          </Typography>
          <Typography variant="annotation">
            {t(`massTimes.kind.${item.kind}`)} · {when}
          </Typography>
          {item.note ? (
            <Typography variant="annotation" tone="muted">
              {item.note}
            </Typography>
          ) : null}
        </YStack>
      </AnimatedPressable>
      <AnimatedPressable
        onPress={() => {
          void mediumTap()
          onRemove()
        }}
        hitSlop={10}
        accessibilityRole="button"
      >
        <Trash2 size={18} color={theme.colorSecondary?.val} />
      </AnimatedPressable>
    </XStack>
  )
}
