import { Check, Star, Trash2, X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, XStack } from 'tamagui'

import { AnimatedPressable, BottomSheet, confirm } from '@/components'
import type { Movement } from '@/db/events'

import {
  useMarkIntentionAnswered,
  useOfferThanksgiving,
  useRetireIntention,
  useRetireThanksgiving,
} from '../hooks'

import { PinPracticeSheet } from './PinPracticeSheet'

type Action = {
  key: 'answered' | 'pin' | 'retire'
  labelKey: string
  destructive?: boolean
  icon: typeof Check
}

export function MovementActionMenu({
  movement,
  visible,
  onClose,
}: {
  movement: Movement | undefined
  visible: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()

  const markAnswered = useMarkIntentionAnswered()
  const retireIntention = useRetireIntention()
  const retireThanksgiving = useRetireThanksgiving()
  const offerThanksgivingMutation = useOfferThanksgiving()
  const [pinSheetOpen, setPinSheetOpen] = useState(false)

  if (!movement) return null

  const actions = computeActions(movement)

  async function handle(action: Action) {
    if (!movement) return
    if (action.key === 'answered') {
      // Closure happens immediately. The bridge prompt is a follow-up — denying
      // it does not undo the answered state.
      markAnswered.mutate({ id: movement.id })
      const bridge = await confirm({
        title: t('movements.bridge.title'),
        description: t('movements.bridge.description', { text: movement.text }),
        confirmLabel: t('movements.bridge.confirm'),
        cancelLabel: t('common.notNow'),
      })
      if (bridge) {
        offerThanksgivingMutation.mutate({
          text: t('movements.bridge.thanksgivingPrefill', { text: movement.text }),
          subject: movement.subject,
          from_intention: movement.id,
        })
      }
      onClose()
      return
    }
    if (action.key === 'pin') {
      setPinSheetOpen(true)
      return
    }
    const ok = await confirm({
      title: t('movements.confirm.retireTitle'),
      description: movement.text,
      confirmLabel: t('movements.actions.retire'),
      destructive: true,
    })
    if (!ok) return
    if (movement.kind === 'intention') retireIntention.mutate(movement.id)
    else retireThanksgiving.mutate(movement.id)
    onClose()
  }

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} animation="fade">
        <Text fontFamily="$heading" fontSize="$3" color="$color">
          {movement.text}
        </Text>
        {actions.map((a) => (
          <AnimatedPressable
            key={a.key}
            onPress={() => handle(a)}
            accessibilityRole="button"
            accessibilityLabel={t(a.labelKey)}
          >
            <XStack
              alignItems="center"
              gap="$sm"
              paddingVertical="$md"
              paddingHorizontal="$md"
              borderRadius="$md"
              borderWidth={1}
              borderColor={a.destructive ? '#B4322A' : '$borderColor'}
            >
              <a.icon size={16} color={a.destructive ? '#B4322A' : theme.color?.val} />
              <Text
                fontFamily="$heading"
                fontSize="$2"
                color={a.destructive ? '#B4322A' : '$color'}
                letterSpacing={0.5}
              >
                {t(a.labelKey)}
              </Text>
            </XStack>
          </AnimatedPressable>
        ))}
        <AnimatedPressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <XStack
            justifyContent="center"
            paddingVertical="$md"
            borderRadius="$md"
            backgroundColor="$backgroundSurface"
          >
            <Text fontFamily="$heading" fontSize="$2" color="$color" letterSpacing={1}>
              {t('common.cancel')}
            </Text>
          </XStack>
        </AnimatedPressable>
      </BottomSheet>
      <PinPracticeSheet
        movementId={pinSheetOpen ? movement.id : undefined}
        visible={pinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
      />
    </>
  )
}

function computeActions(movement: Movement): Action[] {
  if (movement.state === 'closed') return []
  const actions: Action[] = []
  const isGoalOrBounded =
    movement.kind === 'intention' && (movement.cadence === 'goal' || movement.cadence === 'bounded')
  if (isGoalOrBounded) {
    actions.push({ key: 'answered', labelKey: 'movements.actions.markAnswered', icon: Check })
  }
  actions.push({ key: 'pin', labelKey: 'movements.actions.pinToPractice', icon: Star })
  actions.push({
    key: 'retire',
    labelKey:
      movement.kind === 'intention'
        ? 'movements.actions.retire'
        : 'movements.actions.removeThanksgiving',
    destructive: true,
    icon: movement.kind === 'intention' ? X : Trash2,
  })
  return actions
}
