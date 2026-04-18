import { formatDistanceToNowStrict, type Locale } from 'date-fns'
import { useRouter } from 'expo-router'
import { Check, ChevronLeft, Plus, RotateCcw, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout, SectionDivider } from '@/components'
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

  function onDelete(intention: IntentionState) {
    Alert.alert(t('intentions.confirmDeleteTitle'), intention.text, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => removeIntention.mutate(intention.id),
      },
    ])
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
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
                  {t('intentions.add')}
                </Text>
              </XStack>
            </AnimatedPressable>
          </XStack>
        </YStack>

        {open.length === 0 && answered.length === 0 ? (
          <YStack paddingVertical="$xl" alignItems="center" gap="$sm">
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
                  <IntentionRow
                    key={i.id}
                    intention={i}
                    locale={locale}
                    onMarkAnswered={() => onMarkAnswered(i.id)}
                    onDelete={() => onDelete(i)}
                  />
                ))
              )}
            </YStack>

            {answered.length > 0 && (
              <>
                <SectionDivider />
                <Pressable onPress={() => setShowAnswered((v) => !v)}>
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
                    <AnsweredRow
                      key={i.id}
                      intention={i}
                      locale={locale}
                      onRestore={() => markUnanswered.mutate(i.id)}
                      onDelete={() => onDelete(i)}
                    />
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
  locale,
  onMarkAnswered,
  onDelete,
}: {
  intention: IntentionState
  locale: Locale | undefined
  onMarkAnswered: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const createdAgo = formatDistanceToNowStrict(intention.created_at, { locale, addSuffix: true })

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
        {intention.text}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontFamily="$body" fontSize="$1" color="$colorSecondary" fontStyle="italic">
          {createdAgo}
        </Text>
        <XStack gap="$sm">
          <AnimatedPressable onPress={onDelete}>
            <XStack alignItems="center" gap="$xs" paddingVertical="$xs" paddingHorizontal="$sm">
              <Trash2 size={14} color={theme.colorSecondary?.val} />
            </XStack>
          </AnimatedPressable>
          <AnimatedPressable onPress={onMarkAnswered}>
            <XStack
              alignItems="center"
              gap="$xs"
              paddingVertical="$xs"
              paddingHorizontal="$sm"
              borderRadius="$sm"
              borderWidth={1}
              borderColor="$accent"
            >
              <Check size={14} color={theme.accent?.val} />
              <Text fontFamily="$heading" fontSize="$1" color="$accent" letterSpacing={0.5}>
                {t('intentions.markAnswered')}
              </Text>
            </XStack>
          </AnimatedPressable>
        </XStack>
      </XStack>
    </YStack>
  )
}

function AnsweredRow({
  intention,
  locale,
  onRestore,
  onDelete,
}: {
  intention: IntentionState
  locale: Locale | undefined
  onRestore: () => void
  onDelete: () => void
}) {
  const theme = useTheme()
  const answeredAgo =
    intention.answered_at !== null
      ? formatDistanceToNowStrict(intention.answered_at, { locale, addSuffix: true })
      : ''

  return (
    <YStack
      gap="$xs"
      padding="$md"
      borderRadius="$md"
      backgroundColor="$backgroundSurface"
      opacity={0.78}
    >
      <Text fontFamily="$body" fontSize="$2" color="$color" textDecorationLine="line-through">
        {intention.text}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontFamily="$body" fontSize="$1" color="$accent" fontStyle="italic">
          {answeredAgo}
        </Text>
        <XStack gap="$sm">
          <AnimatedPressable onPress={onDelete}>
            <Trash2 size={14} color={theme.colorSecondary?.val} />
          </AnimatedPressable>
          <AnimatedPressable onPress={onRestore}>
            <RotateCcw size={14} color={theme.colorSecondary?.val} />
          </AnimatedPressable>
        </XStack>
      </XStack>
    </YStack>
  )
}
