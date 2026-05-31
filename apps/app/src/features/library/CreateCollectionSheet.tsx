import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input, Text, useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components/typography'
import { paletteTones } from '@/features/explore/bgColor'

import { useCreateUserCollection } from './userCollectionHooks'

/**
 * Create a collection — the native sheet with Ember's content: a quiet name
 * field, an optional line, and a row of illuminated tone swatches for the cover
 * ground (no bordered chips). `onCreated` hands back the new id so the caller
 * can morph into the viewer or add a pending ref.
 */
export function CreateCollectionSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: (id: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const create = useCreateUserCollection()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tone, setTone] = useState(0)

  function reset() {
    setName('')
    setDescription('')
    setTone(0)
  }

  async function submit() {
    const trimmed = name.trim()
    if (!trimmed || create.isPending) return
    const id = await create.mutateAsync({
      name: trimmed,
      description: description.trim() || undefined,
      coverTone: tone,
    })
    reset()
    onClose()
    onCreated?.(id)
  }

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={['55%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack paddingHorizontal="$lg" paddingTop="$lg" paddingBottom={insets.bottom + 24} gap="$lg">
        <Typography variant="screen-title" fontSize="$5" textAlign="left">
          {t('collections.create')}
        </Typography>

        <YStack gap="$xs">
          <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
            {t('collections.name')}
          </Text>
          <QuietInput
            value={name}
            onChangeText={setName}
            placeholder={t('collections.namePlaceholder')}
            fontFamily="$heading"
            fontSize="$5"
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
        </YStack>

        <YStack gap="$xs">
          <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
            {t('collections.description')}
          </Text>
          <QuietInput
            value={description}
            onChangeText={setDescription}
            fontFamily="$body"
            fontSize="$3"
          />
        </YStack>

        <YStack gap="$sm">
          <Text fontFamily="$heading" fontSize="$2" color="$colorSecondary">
            {t('collections.coverTone')}
          </Text>
          <ToneRow value={tone} onChange={setTone} />
        </YStack>

        <Pressable
          onPress={submit}
          disabled={!name.trim() || create.isPending}
          accessibilityRole="button"
          accessibilityLabel={t('collections.create')}
        >
          <YStack
            backgroundColor="$accent"
            borderRadius="$md"
            padding="$md"
            alignItems="center"
            opacity={!name.trim() || create.isPending ? 0.5 : 1}
          >
            <Text fontFamily="$heading" fontSize="$3" color="$background">
              {t('collections.create')}
            </Text>
          </YStack>
        </Pressable>
      </YStack>
    </BottomSheet>
  )
}

/** A borderless, baseline-ruled field — the manuscript idiom, no boxed chrome. */
export function QuietInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      borderWidth={0}
      borderBottomWidth={1}
      borderColor="$borderColor"
      borderRadius={0}
      paddingHorizontal={0}
      backgroundColor="transparent"
      // Roomy enough that the large manuscript hand isn't clipped; the default
      // Input height is sized for a small font.
      height={56}
      {...props}
    />
  )
}

/** Illuminated tone swatches — little jewel grounds, the selected one ringed in gold. */
export function ToneRow({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  return (
    <XStack gap="$sm" flexWrap="wrap">
      {paletteTones.map((tone, i) => (
        <Pressable
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed palette
          key={i}
          onPress={() => onChange(i)}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === i }}
        >
          <YStack
            width={36}
            height={36}
            borderRadius={18}
            backgroundColor={tone.from}
            borderWidth={2}
            borderColor={value === i ? '$accent' : 'transparent'}
          />
        </Pressable>
      ))}
    </XStack>
  )
}
