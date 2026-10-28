import { Star } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import { useSaveToggle } from './savedHooks'

type SaveToggleProps = {
  itemId: string | undefined
  /** Catalog kind, denormalized onto the saved row. */
  kind: string
}

/**
 * One-tap Favorites toggle — the curation gesture, distinct from offline
 * pinning. Instant, no download. A star, filled in the accent once kept.
 */
export function SaveToggle({ itemId, kind }: SaveToggleProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { saved, isWorking, toggle } = useSaveToggle(itemId, kind)

  const ink = saved ? theme.accent.val : theme.colorSecondary.val
  const label = saved ? t('library.favorited') : t('library.favorite')

  return (
    <Pressable
      onPress={toggle}
      disabled={!itemId || isWorking}
      accessibilityRole="switch"
      accessibilityState={{ checked: saved, busy: isWorking, disabled: !itemId }}
      accessibilityLabel={label}
    >
      <XStack
        gap="$xs"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderRadius="$md"
        borderWidth={1}
        borderColor={saved ? '$accent' : '$borderColor'}
        backgroundColor={saved ? '$accentSubtle' : 'transparent'}
        opacity={isWorking ? 0.7 : 1}
      >
        <Star size={14} color={ink} fill={saved ? ink : 'none'} />
        <Text fontFamily="$body" fontSize="$1" color={saved ? '$accent' : '$colorSecondary'}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}
