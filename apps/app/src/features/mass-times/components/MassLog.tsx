import { Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Alert, FlatList } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable, Typography } from '@/components'
import { mediumTap } from '@/lib/haptics'
import type { CheckIn } from '../checkins'
import { useCheckInsStore, useRecentCheckIns } from '../checkins'
import { AnimatedRow } from './AnimatedRow'
import { clockFigures, Hairline, SmallCaps, timeColumnWidth } from './SheetType'

// The personal Mass log: every recorded visit, newest first, each removable and tapping through to the
// church (place mode in the sheet). Ruled rows, time-led like the nearby list.
export function MassLog({
  onSelectChurch,
}: {
  onSelectChurch: (church: { id: string; name: string }) => void
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
            onPress={() => onSelectChurch({ id: item.churchId, name: item.churchName })}
            onRemove={() => {
              remove(item.id).catch(() => Alert.alert(t('massTimes.saveFailed')))
            }}
          />
        </AnimatedRow>
      )}
      ItemSeparatorComponent={Hairline}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    />
  )
}

// A check-in set like a nearby row: when you were there leads (time over date), then the church and
// what you came for. Tapping opens the church; the bin removes the entry.
function CheckInRow({
  item,
  locale,
  onPress,
  onRemove,
}: {
  item: CheckIn
  locale: string
  onPress: () => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const at = new Date(item.at)
  const time = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
  const date = at.toLocaleDateString(locale, { day: 'numeric', month: 'short' })

  return (
    <XStack paddingVertical={12} gap="$md" alignItems="flex-start">
      <AnimatedPressable
        style={{ flex: 1 }}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={item.churchName}
      >
        <XStack gap="$md" alignItems="flex-start">
          <YStack width={timeColumnWidth} gap={2}>
            <Typography
              variant="sacred-title"
              textAlign="left"
              fontSize={22}
              lineHeight={26}
              fontVariant={[...clockFigures]}
            >
              {time}
            </Typography>
            <SmallCaps fontSize={10}>{date}</SmallCaps>
          </YStack>
          <YStack flex={1} gap={2}>
            <Typography
              variant="sacred-title"
              textAlign="left"
              fontSize={18}
              lineHeight={24}
              numberOfLines={1}
            >
              {item.churchName}
            </Typography>
            <Typography variant="annotation">{t(`massTimes.kind.${item.kind}`)}</Typography>
            {item.note ? <Typography variant="caption">{item.note}</Typography> : null}
          </YStack>
        </XStack>
      </AnimatedPressable>
      <AnimatedPressable
        onPress={() => {
          void mediumTap()
          onRemove()
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={t('massTimes.removeCheckIn')}
      >
        <Trash2 size={18} color={theme.colorSecondary?.val} />
      </AnimatedPressable>
    </XStack>
  )
}
