import { Check, CloudDownload, Loader } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, useTheme, XStack } from 'tamagui'

import { usePinToggle } from './hooks'

type PinToggleProps = {
  itemId: string | undefined
  /** Optional label for the unpinned state. Defaults to "Make available offline". */
  pinLabel?: string
  /** Optional label for the pinned state. Defaults to "Available offline". */
  pinnedLabel?: string
}

/**
 * One-tap "Make available offline" toggle. Works on any catalog item id
 * (`practice/...`, `book/...`, `collection/...`).
 *
 * Visual: a small pill with a download icon when unpinned; a checkmark +
 * accent border when pinned; a spinner while the prefetch is running.
 */
export function PinToggle({ itemId, pinLabel, pinnedLabel }: PinToggleProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { pinned, isWorking, progress, toggle } = usePinToggle(itemId)

  const Icon = isWorking ? Loader : pinned ? Check : CloudDownload
  const label = isWorking
    ? progress && progress.total > 0
      ? `${Math.round((progress.done / progress.total) * 100)}%`
      : t('pinning.working', { defaultValue: 'Working…' })
    : pinned
      ? (pinnedLabel ?? t('pinning.availableOffline', { defaultValue: 'Available offline' }))
      : (pinLabel ?? t('pinning.makeAvailableOffline', { defaultValue: 'Make available offline' }))

  return (
    <Pressable
      onPress={toggle}
      disabled={!itemId || isWorking}
      accessibilityRole="switch"
      accessibilityState={{ checked: pinned, busy: isWorking, disabled: !itemId }}
      accessibilityLabel={label}
    >
      <XStack
        gap="$xs"
        alignItems="center"
        paddingHorizontal="$md"
        paddingVertical="$xs"
        borderRadius="$md"
        borderWidth={1}
        borderColor={pinned ? '$accent' : '$borderColor'}
        backgroundColor={pinned ? '$accentSubtle' : 'transparent'}
        opacity={isWorking ? 0.7 : 1}
      >
        <Icon size={14} color={pinned ? theme.accent.val : theme.colorSecondary.val} />
        <Text fontFamily="$body" fontSize="$1" color={pinned ? '$accent' : '$colorSecondary'}>
          {label}
        </Text>
      </XStack>
    </Pressable>
  )
}
