import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { confirm } from '@/components/ConfirmSheet'
import { Typography } from '@/components/typography'
import { getEntry } from '@/content/contentIndex'
import { localizeContent } from '@/lib/i18n'

import { QuietInput, ToneRow } from './CreateCollectionSheet'
import {
  useDeleteUserCollection,
  useRemoveFromCollection,
  useRenameUserCollection,
  useReorderCollection,
  useSetUserCollectionTone,
  useUserCollection,
} from './userCollectionHooks'

/**
 * Manage a user collection — native sheet, bespoke content. Rename and recolor
 * the cover, reorder/remove members (up/down + ✕ on jewel rows), and a quiet
 * destructive delete at the foot. Reorder feeds a single batched position
 * rewrite; delete confirms, then morphs back via `onDeleted`.
 */
export function ManageCollectionSheet({
  collectionId,
  open,
  onClose,
  onDeleted,
}: {
  collectionId: string | undefined
  open: boolean
  onClose: () => void
  onDeleted: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { data } = useUserCollection(collectionId)
  const rename = useRenameUserCollection()
  const setTone = useSetUserCollectionTone()
  const remove = useRemoveFromCollection()
  const reorder = useReorderCollection()
  const del = useDeleteUserCollection()

  const [name, setName] = useState('')
  useEffect(() => {
    if (data?.collection) setName(data.collection.name)
  }, [data?.collection])

  if (!collectionId) return null

  const refs = (data?.items ?? []).map((it) => it.ref)

  function commitName() {
    const trimmed = name.trim()
    if (collectionId && trimmed && trimmed !== data?.collection.name) {
      rename.mutate({ id: collectionId, name: trimmed })
    }
  }

  function move(index: number, delta: number) {
    if (!collectionId) return
    const next = [...refs]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder.mutate({ collectionId, orderedRefs: next })
  }

  async function onDelete() {
    if (!collectionId) return
    const ok = await confirm({
      title: t('collections.delete'),
      description: t('collections.deleteConfirm'),
      confirmLabel: t('collections.delete'),
      destructive: true,
    })
    if (!ok) return
    await del.mutateAsync(collectionId)
    onClose()
    onDeleted()
  }

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={['75%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$lg" height="100%">
        <Typography variant="screen-title" fontSize="$5" textAlign="left" paddingHorizontal="$lg">
          {t('collections.manage')}
        </Typography>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack paddingHorizontal="$lg" gap="$lg">
            <YStack gap="$xs">
              <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
                {t('collections.name')}
              </Text>
              <QuietInput
                value={name}
                onChangeText={setName}
                onBlur={commitName}
                onSubmitEditing={commitName}
                fontFamily="$heading"
                fontSize="$5"
                returnKeyType="done"
              />
            </YStack>

            <YStack gap="$sm">
              <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
                {t('collections.coverTone')}
              </Text>
              <ToneRow
                value={data?.collection.coverTone ?? 0}
                onChange={(i) => collectionId && setTone.mutate({ id: collectionId, coverTone: i })}
              />
            </YStack>

            {refs.length > 0 && (
              <YStack gap="$xs">
                <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
                  {t('collections.reorder')}
                </Text>
                {refs.map((ref, i) => {
                  const entry = getEntry(ref)
                  const title = entry ? localizeContent(entry.name ?? entry.title ?? {}) : ref
                  return (
                    <XStack key={ref} alignItems="center" gap="$sm" paddingVertical="$xs">
                      <Text
                        flex={1}
                        fontFamily="$heading"
                        fontSize="$3"
                        color="$color"
                        numberOfLines={1}
                      >
                        {title}
                      </Text>
                      <Pressable
                        onPress={() => move(i, -1)}
                        disabled={i === 0}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('collections.moveUp')}
                      >
                        <ChevronUp
                          size={20}
                          color={i === 0 ? theme.borderColor?.val : theme.color?.val}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => move(i, 1)}
                        disabled={i === refs.length - 1}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('collections.moveDown')}
                      >
                        <ChevronDown
                          size={20}
                          color={i === refs.length - 1 ? theme.borderColor?.val : theme.color?.val}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => collectionId && remove.mutate({ collectionId, ref })}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('collections.remove')}
                      >
                        <X size={20} color={theme.colorSecondary?.val} />
                      </Pressable>
                    </XStack>
                  )
                })}
              </YStack>
            )}

            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={t('collections.delete')}
            >
              <XStack alignItems="center" gap="$sm" paddingVertical="$sm">
                <Trash2 size={18} color={theme.colorDestructive?.val} />
                <Text fontFamily="$heading" fontSize="$3" color="$colorDestructive">
                  {t('collections.delete')}
                </Text>
              </XStack>
            </Pressable>
          </YStack>
        </ScrollView>
      </YStack>
    </BottomSheet>
  )
}
