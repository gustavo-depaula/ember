/**
 * A frontispiece's quiet action row: Favorite · Offline · (Collection) as
 * borderless icon+label pairs — no pills, no boxes. State reads in the ink (gold
 * when active, muted otherwise), and the star fills. Shared across the practice and book frontispieces;
 * `kind` denormalizes onto the saved row, and the Collection action shows only
 * when `onAddToCollection` is provided.
 */

import { Check, CloudDownload, FolderPlus, Loader, Star } from 'lucide-react-native'
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
        icon={Star}
        filled={saved}
        label={saved ? t('library.favorited') : t('library.favorite')}
        active={saved}
        disabled={saving}
        onPress={toggleSave}
        accessibilityRole="switch"
        accessibilityState={{ checked: saved, busy: saving }}
        accessibilityLabel={saved ? t('library.favorited') : t('library.favorite')}
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
  filled,
  label,
  active,
  disabled,
  onPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
}: {
  icon: ComponentType<{ size?: number; color?: string; fill?: string }>
  filled?: boolean
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
        <Icon size={22} color={ink} fill={filled ? ink : 'none'} />
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
