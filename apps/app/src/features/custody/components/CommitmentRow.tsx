import { ChevronRight, Clock, Lock, Timer } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import type { Commitment } from '../types'

function KindIcon({ kind }: { kind: Commitment['kind'] }) {
  if (kind === 'time-fence') return <Clock size={16} />
  if (kind === 'time-limit') return <Timer size={16} />
  return <Lock size={16} />
}

export function CommitmentRow({
  commitment,
  onPress,
  trailing,
}: {
  commitment: Commitment
  onPress: () => void
  trailing?: React.ReactNode
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={commitment.name}>
      <XStack
        backgroundColor="$backgroundSurface"
        borderRadius="$lg"
        padding="$md"
        alignItems="center"
        gap="$md"
        borderLeftWidth={3}
        borderLeftColor="$accent"
      >
        <KindIcon kind={commitment.kind} />
        <YStack flex={1} gap={2}>
          <Text fontFamily="$heading" fontSize="$3" color="$color">
            {commitment.name}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            {t(`custody.kinds.${commitment.kind}.label`)}
          </Text>
        </YStack>
        {trailing}
        <ChevronRight size={16} color={theme.colorSecondary.val} />
      </XStack>
    </Pressable>
  )
}
