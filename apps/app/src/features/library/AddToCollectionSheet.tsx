import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check, Plus, Star } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { pullDown } from '@/components/NativeSheet'
import { Typography } from '@/components/typography'
import { blockInk, toneByIndex } from '@/features/explore/bgColor'
import { CreateCollectionSheet } from './CreateCollectionSheet'
import { favoritesTone, isFavoritable } from './favorites'
import { useSaveToggle } from './savedHooks'
import {
  useAddToCollection,
  useCollectionsContainingRef,
  useRemoveFromCollection,
  useUserCollections,
} from './userCollectionHooks'

/**
 * Add an item to one of the user's collections. Native sheet, manuscript
 * content: each collection is a small jewel row (tone ground + name), checked in
 * gold when the ref already belongs. The top row opens the create flow and adds
 * the ref to the fresh collection; Favorites leads the list for anything that
 * can be favorited.
 */
export function AddToCollectionSheet({
  itemRef,
  open,
  onClose,
}: {
  itemRef: string | undefined
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { data: collections } = useUserCollections()
  const { data: memberOf } = useCollectionsContainingRef(itemRef)
  const add = useAddToCollection()
  const remove = useRemoveFromCollection()
  const [creating, setCreating] = useState(false)
  // The kind is the ref's prefix: every catalog id carries it.
  const favorite = useSaveToggle(itemRef, itemRef?.split('/')[0] ?? '')

  const memberSet = useMemo(() => new Set(memberOf ?? []), [memberOf])
  const list = collections ?? []

  function toggle(collectionId: string) {
    if (!itemRef) return
    if (memberSet.has(collectionId)) remove.mutate({ collectionId, ref: itemRef })
    else add.mutate({ collectionId, ref: itemRef })
  }

  return (
    <>
      <BottomSheet
        index={open && !creating ? 0 : -1}
        snapPoints={['55%']}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: theme.background?.val }}
      >
        <YStack paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$md" height="100%">
          <Typography variant="screen-title" fontSize="$5" textAlign="left" paddingHorizontal="$lg">
            {t('library.addToCollection')}
          </Typography>

          <ScrollView showsVerticalScrollIndicator={false} {...pullDown(onClose)}>
            <YStack paddingHorizontal="$lg" gap="$xs">
              <Pressable
                onPress={() => setCreating(true)}
                accessibilityRole="button"
                accessibilityLabel={t('library.newCollection')}
              >
                <XStack alignItems="center" gap="$md" paddingVertical="$sm">
                  <YStack
                    width={40}
                    height={40}
                    borderRadius={20}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="$accentSubtle"
                  >
                    <Plus size={20} color={theme.accent?.val} />
                  </YStack>
                  <Text fontFamily="$heading" fontSize="$3" color="$accent">
                    {t('library.newCollection')}
                  </Text>
                </XStack>
              </Pressable>

              {itemRef && isFavoritable(itemRef) && (
                <Pressable
                  onPress={favorite.toggle}
                  disabled={favorite.isWorking}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: favorite.saved }}
                  accessibilityLabel={t('library.favorites')}
                >
                  <XStack alignItems="center" gap="$md" paddingVertical="$sm">
                    <YStack
                      width={40}
                      height={40}
                      borderRadius={20}
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor={favoritesTone.from}
                    >
                      <Star size={18} color={blockInk} fill={blockInk} />
                    </YStack>
                    <Text
                      flex={1}
                      fontFamily="$heading"
                      fontSize="$3"
                      color="$color"
                      numberOfLines={1}
                    >
                      {t('library.favorites')}
                    </Text>
                    {favorite.saved && <Check size={20} color={theme.accent?.val} />}
                  </XStack>
                </Pressable>
              )}

              {list.map((c) => {
                const member = memberSet.has(c.id)
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggle(c.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: member }}
                    accessibilityLabel={c.name}
                  >
                    <XStack alignItems="center" gap="$md" paddingVertical="$sm">
                      <YStack
                        width={40}
                        height={40}
                        borderRadius={20}
                        backgroundColor={toneByIndex(c.coverTone).from}
                      />
                      <Text
                        flex={1}
                        fontFamily="$heading"
                        fontSize="$3"
                        color="$color"
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                      {member && <Check size={20} color={theme.accent?.val} />}
                    </XStack>
                  </Pressable>
                )
              })}
            </YStack>
          </ScrollView>
        </YStack>
      </BottomSheet>

      <CreateCollectionSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          if (itemRef) add.mutate({ collectionId: id, ref: itemRef })
        }}
      />
    </>
  )
}
