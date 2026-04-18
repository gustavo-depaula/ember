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
                    mode="open"
                    locale={locale}
                    onPrimary={() => onMarkAnswered(i.id)}
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
                    <IntentionRow
                      key={i.id}
                      intention={i}
                      mode="answered"
                      locale={locale}
                      onPrimary={() => markUnanswered.mutate(i.id)}
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
  const timestampAgo = formatDistanceToNowStrict(timestamp, { locale, addSuffix: true })

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
          <AnimatedPressable onPress={onDelete}>
            <XStack alignItems="center" gap="$xs" paddingVertical="$xs" paddingHorizontal="$sm">
              <Trash2 size={14} color={theme.colorSecondary?.val} />
            </XStack>
          </AnimatedPressable>
          <AnimatedPressable onPress={onPrimary}>
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
