import { useMemo } from 'react'
import { Text, XStack } from 'tamagui'

import { useToday } from '@/hooks/useToday'

const aspirations = [
  'Jesu, Jesu, Jesu.',
  'Cor Jesu, confidio in te.',
  'Deus meus et omnia.',
  'Omnia pro Iesu.',
  'Ad majorem Dei gloriam.',
  'Laus Deo semper.',
  'Jesu, mitis et humilis corde.',
  'Maria, refugium peccatorum.',
  'Jesu, Maria, Ioseph.',
  'Fiat voluntas tua.',
  'Sancte Michael, defende nos.',
  'Cor Mariae Immaculatum, ora pro nobis.',
  'Veni, Sancte Spiritus.',
  'Misericordias Domini in aeternum cantabo.',
  'Pax Christi.',
] as const

export function Aspiratio({ date }: { date?: Date }) {
  const today = useToday()
  const d = date ?? today
  const aspiration = useMemo(() => {
    const dayIndex = Math.floor(d.getTime() / 86400000)
    return aspirations[dayIndex % aspirations.length]
  }, [d])

  return (
    <XStack justifyContent="center" paddingVertical="$sm" paddingHorizontal="$lg">
      <Text
        fontFamily="$script"
        fontSize="$3"
        color="$colorSecondary"
        fontStyle="italic"
        textAlign="center"
        opacity={0.7}
      >
        {aspiration}
      </Text>
    </XStack>
  )
}
