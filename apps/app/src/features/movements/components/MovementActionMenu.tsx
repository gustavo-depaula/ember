import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { Check, Pencil, Star, Trash2, X } from 'lucide-react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { AnimatedPressable, confirm } from '@/components'
import type { Movement } from '@/db/events'

import { useRetireIntention, useRetireThanksgiving } from '../hooks'

import { MovementAnsweredSheet } from './MovementAnsweredSheet'
import { MovementEditSheet } from './MovementEditSheet'
import { PinPracticeSheet } from './PinPracticeSheet'

type Action = {
  key: 'answered' | 'edit' | 'pin' | 'retire'
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
  const insets = useSafeAreaInsets()

  const retireIntention = useRetireIntention()
  const retireThanksgiving = useRetireThanksgiving()
  const [pinSheetOpen, setPinSheetOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [answeredSheetOpen, setAnsweredSheetOpen] = useState(false)

  if (!movement) return null

  const actions = computeActions(movement)

  async function handle(action: Action) {
    if (!movement) return
    if (action.key === 'answered') {
      setAnsweredSheetOpen(true)
      return
    }
    if (action.key === 'edit') {
      setEditSheetOpen(true)
      return
    }
    if (action.key === 'pin') {
      setPinSheetOpen(true)
      return
    }
    const ok = await confirm({
      title: t('movements.confirm.retireTitle'),
      description: `“${movement.text}” — ${t('movements.confirm.retireDescription')}`,
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
      <BottomSheet
        index={visible ? 0 : -1}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: theme.background?.val }}
      >
        <YStack
          paddingHorizontal="$lg"
          paddingTop="$md"
          paddingBottom={insets.bottom + 16}
          gap="$md"
        >
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
                borderColor={a.destructive ? '$colorDestructive' : '$borderColor'}
              >
                <a.icon
                  size={16}
                  color={a.destructive ? theme.colorDestructive?.val : theme.color?.val}
                />
                <Text
                  fontFamily="$heading"
                  fontSize="$2"
                  color={a.destructive ? '$colorDestructive' : '$color'}
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
        </YStack>
      </BottomSheet>
      <PinPracticeSheet
        movementId={pinSheetOpen ? movement.id : undefined}
        visible={pinSheetOpen}
        onClose={() => setPinSheetOpen(false)}
      />
      <MovementEditSheet
        movement={editSheetOpen ? movement : undefined}
        visible={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false)
          onClose()
        }}
      />
      <MovementAnsweredSheet
        movement={answeredSheetOpen ? movement : undefined}
        visible={answeredSheetOpen}
        onClose={() => {
          setAnsweredSheetOpen(false)
          onClose()
        }}
      />
    </>
  )
}

function computeActions(movement: Movement): Action[] {
  if (movement.state === 'closed') return []
  const actions: Action[] = []
  if (movement.kind === 'intention') {
    // Every intention can be answered, perpetual ones included. Gating this on
    // cadence left a granted lifelong petition — a conversion, a healing — with
    // no exit but "Stop carrying", which files the grace as attrition and never
    // reaches the thanksgiving bridge. Perpetual gets the gentler wording;
    // nothing forces the verb on an intention that is simply carried forever.
    actions.push({
      key: 'answered',
      labelKey:
        movement.cadence === 'perpetual'
          ? 'movements.actions.markAnsweredPerpetual'
          : 'movements.actions.markAnswered',
      icon: Check,
    })
  }
  actions.push({ key: 'edit', labelKey: 'movements.actions.edit', icon: Pencil })
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
