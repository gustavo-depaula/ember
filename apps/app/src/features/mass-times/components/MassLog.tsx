import { Link } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { Card, Typography } from '@/components'
import type { CheckIn } from '../checkins'
import { useCheckInsStore, useRecentCheckIns } from '../checkins'

// The personal Mass log: every recorded visit, newest first, each removable and tapping through to
// the church.
export function MassLog() {
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
      data={checkins}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <CheckInRow item={item} locale={i18n.language} onRemove={() => remove(item.id)} />
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
  onRemove,
}: {
  item: CheckIn
  locale: string
  onRemove: () => void
}) {
  const theme = useTheme()
  const when = new Date(item.at).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <XStack alignItems="center" justifyContent="space-between" gap="$sm">
        <Link
          href={{ pathname: '/mass-times/[churchId]', params: { churchId: item.churchId } }}
          asChild
        >
          <Pressable style={{ flexShrink: 1 }}>
            <YStack flexShrink={1} gap="$xs">
              <Typography variant="interface" fontSize="$4" fontWeight="600">
                {item.churchName}
              </Typography>
              <Typography variant="annotation">{when}</Typography>
            </YStack>
          </Pressable>
        </Link>
        <Pressable onPress={onRemove} hitSlop={10} accessibilityRole="button">
          <Trash2 size={18} color={theme.colorSecondary?.val} />
        </Pressable>
      </XStack>
    </Card>
  )
}
