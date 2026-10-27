import { format } from 'date-fns'
import { MapPin } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, Typography } from '@/components'
import { useStableToday } from '@/hooks/useToday'
import { selectionTick, successBuzz } from '@/lib/haptics'
import { checkIn, useCheckInsOn, useRecentCheckIns } from '../checkins'
import { stopAskingMassWhere, useChurchHere, useMassWhereAsking } from '../churchHere'
import { useFavoriteChurches } from '../favorites'
import { useGlassTile } from './glass'

// Under the Santa Missa row it hangs from: past the checkbox and the icon, level with the name.
const indent = 80
// The likeliest churches offered at once; more would wrap into a wall of chips.
const shownChurches = 3

type Place = { id: string; name: string }

/**
 * The line under Santa Missa on Hoje: "Onde?" with the likeliest churches once Mass is ticked —
 * the one you're standing at first, then where you check in most, then your saved ones — and,
 * once answered, the church itself. The Mass is already marked, so a check-in here only adds where
 * it was. `onOtherChurch` leaves the list for the map, to find a church not offered.
 */
export function MassWhere({
  slotKey,
  onOtherChurch,
}: {
  slotKey: string
  onOtherChurch: () => void
}) {
  const today = format(useStableToday(), 'yyyy-MM-dd')
  const place = useCheckInsOn(today)
    .filter((c) => c.kind === 'mass')
    .at(-1)
  const asking = useMassWhereAsking(slotKey)
  if (place) return <PlaceLine name={place.churchName} />
  if (!asking) return null
  return <AskWhere slotKey={slotKey} onOtherChurch={onOtherChurch} />
}

function PlaceLine({ name }: { name: string }) {
  const theme = useTheme()
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <XStack paddingLeft={indent} paddingBottom="$sm" marginTop={-8} alignItems="center" gap={6}>
        <MapPin size={13} color={theme.colorSecondary?.val} />
        <Typography tone="muted" fontSize="$2" numberOfLines={1} flexShrink={1}>
          {name}
        </Typography>
      </XStack>
    </Animated.View>
  )
}

function AskWhere({ slotKey, onOtherChurch }: { slotKey: string; onOtherChurch: () => void }) {
  const { t } = useTranslation()
  const { data: here } = useChurchHere(true)
  const recent = useRecentCheckIns()
  const saved = useFavoriteChurches()
  const [saving, setSaving] = useState(false)

  const churches = useMemo(() => {
    const frequent = new Map<string, Place & { count: number }>()
    for (const c of recent) {
      const seen = frequent.get(c.churchId)
      frequent.set(c.churchId, {
        id: c.churchId,
        name: c.churchName,
        count: (seen?.count ?? 0) + 1,
      })
    }
    const ordered: Place[] = [
      ...(here ? [here] : []),
      ...[...frequent.values()].sort((a, b) => b.count - a.count),
      ...saved,
    ]
    return ordered
      .filter((c, i) => ordered.findIndex((o) => o.id === c.id) === i)
      .slice(0, shownChurches)
  }, [here, recent, saved])

  const pick = async (church: Place) => {
    void selectionTick()
    setSaving(true)
    try {
      await checkIn(church, { kind: 'mass' }, { massMarked: true })
    } catch {
      setSaving(false)
      confirm({ title: t('massTimes.saveFailed'), singleAction: true })
      return
    }
    void successBuzz()
    stopAskingMassWhere(slotKey)
  }

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <YStack paddingLeft={indent} paddingBottom="$md" marginTop={-4} gap="$sm">
        <Typography
          variant="label"
          fontSize="$1"
          tone="muted"
          textTransform="uppercase"
          letterSpacing={1.5}
        >
          {t('massTimes.where')}
        </Typography>
        <XStack flexWrap="wrap" gap={6}>
          {churches.map((church, i) => (
            <Chip
              key={church.id}
              label={church.name}
              filled={i === 0 && church.id === here?.id}
              disabled={saving}
              onPress={() => void pick(church)}
            />
          ))}
          <Chip label={t('massTimes.otherChurch')} onPress={onOtherChurch} />
          <Chip label={t('massTimes.notNow')} ghost onPress={() => stopAskingMassWhere(slotKey)} />
        </XStack>
      </YStack>
    </Animated.View>
  )
}

function Chip({
  label,
  filled,
  ghost,
  disabled,
  onPress,
}: {
  label: string
  filled?: boolean
  ghost?: boolean
  disabled?: boolean
  onPress: () => void
}) {
  const tile = useGlassTile(true)
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <XStack
        minHeight={34}
        paddingHorizontal={ghost ? 6 : 12}
        borderRadius={17}
        alignItems="center"
        backgroundColor={filled ? '$color' : ghost ? 'transparent' : tile}
        opacity={disabled ? 0.5 : 1}
      >
        <Typography
          variant="interface"
          fontSize="$2"
          numberOfLines={1}
          color={filled ? '$background' : ghost ? '$colorSecondary' : '$color'}
        >
          {label}
        </Typography>
      </XStack>
    </AnimatedPressable>
  )
}
