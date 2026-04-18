import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack } from 'tamagui'

import { useToday } from '@/hooks/useToday'
import { lightTap } from '@/lib/haptics'

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
  'Domine Iesu, miserere mei.',
  'Dominus meus et Deus meus.',
  'In manus tuas, Domine.',
  'Sanctus, Sanctus, Sanctus.',
  'Sancta Maria, Mater Dei.',
  'Agnus Dei, miserere nobis.',
  'Dominus illuminatio mea.',
  'Maranatha.',
  'Jesu, spes mea.',
  'Magnificat anima mea Dominum.',
  'Ave crux, spes unica.',
  'Sitio.',
  'Cor Iesu, miserere nobis.',
  'Tota pulchra es, Maria.',
  'Benedictus Deus in saecula.',
] as const

export function Aspiratio({ date }: { date?: Date }) {
  const { t } = useTranslation()
  const today = useToday()
  const d = date ?? today
  const baseIndex = useMemo(() => Math.floor(d.getTime() / 86400000) % aspirations.length, [d])
  const [offset, setOffset] = useState(0)
  const aspiration = aspirations[(baseIndex + offset) % aspirations.length]

  return (
    <Pressable
      onPress={() => {
        lightTap()
        setOffset((o) => o + 1)
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={aspiration}
      accessibilityHint={t('a11y.nextAspiration')}
    >
      <XStack justifyContent="center" paddingVertical="$sm" paddingHorizontal="$lg">
        <Text
          fontFamily="$body"
          fontSize="$2"
          color="$colorSecondary"
          textAlign="center"
          opacity={0.75}
        >
          {aspiration}
        </Text>
      </XStack>
    </Pressable>
  )
}
