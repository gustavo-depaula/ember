import { Bookmark, BookmarkCheck } from 'lucide-react-native'
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
 * One-tap "Save to library" toggle — the curation gesture, distinct from
 * `PinToggle` (offline). Instant, no download. A bookmark when unsaved; a filled
 * bookmark + accent when saved. Mirrors PinToggle's pill so the two controls
 * read as siblings wherever they sit side by side.
 */
export function SaveToggle({ itemId, kind }: SaveToggleProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { saved, isWorking, toggle } = useSaveToggle(itemId, kind)

  const Icon = saved ? BookmarkCheck : Bookmark
  const label = saved ? t('library.saved') : t('library.save')

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
        <Icon size={14} color={saved ? theme.accent.val : theme.colorSecondary.val} />
        <Text fontFamily="$body" fontSize="$1" color={saved ? '$accent' : '$colorSecondary'}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}
