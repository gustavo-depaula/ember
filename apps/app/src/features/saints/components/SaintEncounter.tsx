import { YStack } from 'tamagui'
import { Typography } from '@/components/typography'
import type { SaintEntry } from '../data/catalog'

// The saint's identity — name, feast, patronage — set beside or under a card.
export function SaintEncounterHeader({
  saint,
  align = 'center',
}: {
  saint: SaintEntry
  align?: 'center' | 'left'
}) {
  return (
    <YStack
      alignItems={align === 'center' ? 'center' : 'flex-start'}
      gap="$xs"
      paddingHorizontal={align === 'center' ? 28 : 0}
      paddingBottom="$md"
    >
      <Typography variant="sacred-title" fontSize={30} lineHeight={36} textAlign={align}>
        {saint.name}
      </Typography>
      {saint.feastLabel && (
        <Typography variant="reference" textTransform="uppercase" textAlign={align}>
          {saint.feastLabel}
        </Typography>
      )}
      {saint.patronOf && (
        <Typography variant="whisper" textAlign={align}>
          {saint.patronOf}
        </Typography>
      )}
    </YStack>
  )
}
