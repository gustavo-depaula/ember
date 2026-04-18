import type { Locale } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, Heart, Plus, RotateCcw, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm, ScreenLayout, SectionDivider } from '@/components'
import type { IntentionState } from '@/db/events/state'
import {
  useAddIntention,
  useAnsweredIntentions,
  useMarkIntentionAnswered,
  useMarkIntentionUnanswered,
  useOpenIntentions,
  useRemoveIntention,
} from '@/features/intentions'
import { lightTap, successBuzz } from '@/lib/haptics'
import { getDateLocale } from '@/lib/i18n/dateLocale'
import { formatSoftRelative } from '@/lib/softRelative'

export default function IntentionsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const locale = getDateLocale()

  const open = useOpenIntentions()
  const answered = useAnsweredIntentions()
  const addIntention = useAddIntention()
  const markAnswered = useMarkIntentionAnswered()
  const markUnanswered = useMarkIntentionUnanswered()
  const removeIntention = useRemoveIntention()

  const [draft, setDraft] = useState('')
  const [showAnswered, setShowAnswered] = useState(false)

  function submit() {
    const trimmed = draft.trim()
    if (!trimmed) return
    lightTap()
    addIntention.mutate(trimmed)
    setDraft('')
  }

  function onMarkAnswered(id: number) {
    successBuzz()
    markAnswered.mutate({ id })
  }

  async function onDelete(intention: IntentionState) {
    const ok = await confirm({
      title: t('intentions.confirmDeleteTitle'),
      description: intention.text,
      confirmLabel: t('common.remove'),
      destructive: true,
    })
    if (ok) removeIntention.mutate(intention.id)
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
              {t('intentions.title')}
            </Text>
            <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
              {t('intentions.subtitle')}
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
            placeholder={t('intentions.placeholder')}
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
            <AnimatedPressable
              onPress={submit}
              disabled={!draft.trim()}
              accessibilityRole="button"
              accessibilityLabel={t('intentions.add')}
            >
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
                  {t('intentions.add')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </YStack>

        {open.length === 0 && answered.length === 0 ? (
          <YStack paddingVertical="$xl" alignItems="center" gap="$md">
            <Heart size={32} color={theme.colorSecondary?.val} />
            <Text
              fontFamily="$body"
              fontSize="$2"
              color="$colorSecondary"
              textAlign="center"
              fontStyle="italic"
              paddingHorizontal="$lg"
            >
              {t('intentions.emptyState')}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$md">
            <YStack gap="$xs">
              <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
                {t('intentions.openHeading', { count: open.length }).toUpperCase()}
              </Text>
              {open.length === 0 ? (
                <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" fontStyle="italic">
                  {t('intentions.noOpen')}
                </Text>
              ) : (
                open.map((i) => (
                  <Animated.View
                    key={i.id}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    layout={LinearTransition.duration(200)}
                  >
                    <IntentionRow
                      intention={i}
                      mode="open"
                      locale={locale}
                      onPrimary={() => onMarkAnswered(i.id)}
                      onDelete={() => onDelete(i)}
                    />
                  </Animated.View>
                ))
              )}
            </YStack>

            {answered.length > 0 && (
              <>
                <SectionDivider />
                <Pressable
                  onPress={() => setShowAnswered((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showAnswered ? t('intentions.hide') : t('intentions.show')}
                  accessibilityState={{ expanded: showAnswered }}
                >
                  <XStack alignItems="center" gap="$sm">
                    <Text fontFamily="$heading" fontSize="$2" color="$accent" letterSpacing={1}>
                      {t('intentions.answeredHeading', {
                        count: answered.length,
                      }).toUpperCase()}
                    </Text>
                    <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                      {showAnswered ? t('intentions.hide') : t('intentions.show')}
                    </Text>
                  </XStack>
                </Pressable>
                {showAnswered &&
                  answered.map((i) => (
                    <Animated.View
                      key={i.id}
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                      layout={LinearTransition.duration(200)}
                    >
                      <IntentionRow
                        intention={i}
                        mode="answered"
                        locale={locale}
                        onPrimary={() => markUnanswered.mutate(i.id)}
                        onDelete={() => onDelete(i)}
                      />
                    </Animated.View>
                  ))}
              </>
            )}
          </YStack>
        )}
      </YStack>
    </ScreenLayout>
  )
}

function IntentionRow({
  intention,
  mode,
  locale,
  onPrimary,
  onDelete,
}: {
  intention: IntentionState
  mode: 'open' | 'answered'
  locale: Locale | undefined
  onPrimary: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isOpen = mode === 'open'
  const timestamp = isOpen ? intention.created_at : (intention.answered_at ?? intention.created_at)
  const timestampAgo = formatSoftRelative(timestamp, {
    locale,
    justNow: t('common.justNow'),
    aMomentAgo: t('common.aMomentAgo'),
  })

  return (
    <YStack
      gap={isOpen ? '$sm' : '$xs'}
      padding="$md"
      borderRadius="$md"
      borderWidth={isOpen ? 1 : 0}
      borderColor="$borderColor"
      backgroundColor="$backgroundSurface"
      opacity={isOpen ? 1 : 0.78}
    >
      <Text
        fontFamily="$body"
        fontSize={isOpen ? '$3' : '$2'}
        color="$color"
        textDecorationLine={isOpen ? 'none' : 'line-through'}
      >
        {intention.text}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <Text
          fontFamily="$body"
          fontSize="$1"
          color={isOpen ? '$colorSecondary' : '$accent'}
          fontStyle="italic"
        >
          {timestampAgo}
        </Text>
        <XStack gap="$sm">
          <AnimatedPressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={t('common.remove')}
          >
            <XStack alignItems="center" gap="$xs" paddingVertical="$xs" paddingHorizontal="$sm">
              <Trash2 size={14} color={theme.colorSecondary?.val} />
            </XStack>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={onPrimary}
            accessibilityRole="button"
            accessibilityLabel={
              isOpen ? t('intentions.markAnswered') : t('intentions.markUnanswered')
            }
          >
            <XStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$xs"
              paddingHorizontal="$sm"
              borderRadius="$sm"
              borderWidth={isOpen ? 1 : 0}
              borderColor="$accent"
            >
              {isOpen ? (
                <>
                  <Check size={14} color={theme.accent?.val} />
                  <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={0.5}>
                    {t('intentions.markAnswered')}
                  </Text>
                </>
              ) : (
                <RotateCcw size={14} color={theme.colorSecondary?.val} />
              )}
            </XStack>
          </AnimatedPressable>
        </XStack>
      </XStack>
    </YStack>
  )
}
