import { useRouter } from 'expo-router'
import { ChevronLeft, Flame, Plus, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, ScreenLayout } from '@/components'
import type { GratitudeState } from '@/db/events/state'
import { useAddGratitude, useGratitudes, useRemoveGratitude } from '@/features/gratias'
import { lightTap } from '@/lib/haptics'
import { getDateLocale } from '@/lib/i18n/dateLocale'
import { formatSoftRelative } from '@/lib/softRelative'

export default function GratiasScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const locale = getDateLocale()

  const gratitudes = useGratitudes()
  const add = useAddGratitude()
  const remove = useRemoveGratitude()

  const [draft, setDraft] = useState('')

  function submit() {
    const trimmed = draft.trim()
    if (!trimmed) return
    lightTap()
    add.mutate(trimmed)
    setDraft('')
  }

  async function onDelete(gratitude: GratitudeState) {
    const ok = await confirm({
      title: t('gratias.confirmDeleteTitle'),
      description: gratitude.text,
      confirmLabel: t('common.remove'),
      destructive: true,
    })
    if (ok) remove.mutate(gratitude.id)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.goBack')}
          >
            <ChevronLeft size={24} color={theme.color?.val} />
          </Pressable>
          <YStack flex={1}>
            <Text fontFamily="$heading" fontSize="$5" color="$color">
              {t('gratias.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t('gratias.subtitle')}
            </Text>
          </YStack>
        </XStack>

        <YStack
          gap="$sm"
          padding="$md"
          borderRadius="$md"
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$backgroundSurface"
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('gratias.placeholder')}
            placeholderTextColor={theme.colorSecondary?.val}
            multiline
            style={{
              fontFamily: 'EBGaramond_400Regular',
              fontSize: 16,
              color: theme.color?.val,
              minHeight: 48,
              maxHeight: 140,
              textAlignVertical: 'top',
            }}
          />
          <XStack justifyContent="flex-end">
            <AnimatedPressable onPress={submit} disabled={!draft.trim()}>
              <XStack
                alignItems="center"
                gap="$xs"
                paddingVertical="$sm"
                paddingHorizontal="$md"
                borderRadius="$md"
                backgroundColor={draft.trim() ? '$accent' : '$backgroundSurface'}
                borderWidth={1}
                borderColor="$accent"
                opacity={draft.trim() ? 1 : 0.5}
              >
                <Plus size={14} color={draft.trim() ? 'white' : theme.accent?.val} />
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color={draft.trim() ? 'white' : '$accent'}
                  letterSpacing={0.5}
                >
                  {t('gratias.add')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </YStack>

        {gratitudes.length === 0 ? (
          <YStack paddingVertical="$xl" alignItems="center" gap="$md">
            <Flame size={32} color={theme.colorSecondary?.val} />
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
              paddingHorizontal="$lg"
            >
              {t('gratias.emptyState')}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$sm">
            {gratitudes.map((g) => (
              <Animated.View
                key={g.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                layout={LinearTransition.duration(200)}
              >
                <GratitudeRow gratitude={g} locale={locale} onDelete={() => onDelete(g)} />
              </Animated.View>
            ))}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}

function GratitudeRow({
  gratitude,
  locale,
  onDelete,
}: {
  gratitude: GratitudeState
  locale: ReturnType<typeof getDateLocale>
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const timestampAgo = formatSoftRelative(gratitude.recorded_at, {
    locale,
    justNow: t('common.justNow'),
    aMomentAgo: t('common.aMomentAgo'),
  })

  return (
    <YStack
      gap="$sm"
      padding="$md"
      borderRadius="$md"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundSurface"
    >
      <Text fontFamily="$body" fontSize="$3" color="$color">
        {gratitude.text}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
          {timestampAgo}
        </Text>
        <AnimatedPressable onPress={onDelete}>
          <XStack alignItems="center" gap="$xs" paddingVertical="$xs" paddingHorizontal="$sm">
            <Trash2 size={14} color={theme.colorSecondary?.val} />
          </XStack>
        </AnimatedPressable>
      </XStack>
    </YStack>
  )
}
