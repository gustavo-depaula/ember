/**
 * A frontispiece's quiet action row: Save · Offline · (Collection) as borderless
 * icon+label pairs — no pills, no boxes. State reads in the ink alone (gold when
 * active, muted otherwise), the illuminated idiom rather than chrome. Reuses the
 * same toggle hooks as the library's pill controls, so behavior is identical.
 * Shared across the practice and book frontispieces; `kind` denormalizes onto
 * the saved row, and the Collection action shows only when `onAddToCollection`
 * is provided.
 */

import {
  Bookmark,
  BookmarkCheck,
  Check,
  CloudDownload,
  FolderPlus,
  Loader,
} from 'lucide-react-native'
import type { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { usePinToggle } from '@/features/pinning/hooks'
import { useSaveToggle } from './savedHooks'

export function LibraryActionRow({
  itemId,
  kind,
  onAddToCollection,
}: {
  itemId: string
  kind: string
  onAddToCollection?: () => void
}) {
  const { t } = useTranslation()
  const { saved, isWorking: saving, toggle: toggleSave } = useSaveToggle(itemId, kind)
  const { pinned, isWorking: pinning, progress, toggle: togglePin } = usePinToggle(itemId)

  const offlineLabel =
    pinning && progress && progress.total > 0
      ? `${Math.round((progress.done / progress.total) * 100)}%`
      : t('library.offline')
  const offlineA11y = pinned
    ? t('pinning.availableOffline', { defaultValue: 'Available offline' })
    : t('pinning.makeAvailableOffline', { defaultValue: 'Make available offline' })

  return (
    <XStack justifyContent="space-around" alignItems="flex-start">
      <ActionItem
        icon={saved ? BookmarkCheck : Bookmark}
        label={saved ? t('library.saved') : t('library.save')}
        active={saved}
        disabled={saving}
        onPress={toggleSave}
        accessibilityRole="switch"
        accessibilityState={{ checked: saved, busy: saving }}
        accessibilityLabel={saved ? t('library.saved') : t('library.save')}
      />
      <ActionItem
        icon={pinning ? Loader : pinned ? Check : CloudDownload}
        label={offlineLabel}
        active={pinned}
        disabled={pinning}
        onPress={togglePin}
        accessibilityRole="switch"
        accessibilityState={{ checked: pinned, busy: pinning }}
        accessibilityLabel={offlineA11y}
      />
      {onAddToCollection && (
        <ActionItem
          icon={FolderPlus}
          label={t('library.collection')}
          active={false}
          onPress={onAddToCollection}
          accessibilityRole="button"
          accessibilityLabel={t('library.addToCollection')}
        />
      )}
    </XStack>
  )
}

function ActionItem({
  icon: Icon,
  label,
  active,
  disabled,
  onPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
}: {
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  active: boolean
  disabled?: boolean
  onPress: () => void
  accessibilityRole: 'switch' | 'button'
  accessibilityState?: { checked?: boolean; busy?: boolean }
  accessibilityLabel: string
}) {
  const theme = useTheme()
  const ink = active ? theme.accent.val : theme.colorSecondary.val

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      style={{ flex: 1 }}
    >
      <YStack alignItems="center" gap="$xs" paddingVertical="$xs" opacity={disabled ? 0.6 : 1}>
        <Icon size={22} color={ink} />
        <Typography
          variant="label"
          fontSize="$1"
          textAlign="center"
          color={active ? '$accent' : '$colorSecondary'}
        >
          {label}
        </Typography>
      </YStack>
    </Pressable>
  )
}
