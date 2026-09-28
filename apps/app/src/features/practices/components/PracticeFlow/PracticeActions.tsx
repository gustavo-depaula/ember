import { BottomSheet } from '@expo/ui/community/bottom-sheet'
import { useRouter } from 'expo-router'
import {
  ArrowDownToLine,
  CalendarCheck,
  CalendarPlus,
  ChevronDown,
  Ellipsis,
  FolderPlus,
  Loader,
  Star,
} from 'lucide-react-native'
import { type ComponentType, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, useWindowDimensions } from 'react-native'
import { ScrollView, useTheme, XStack, YStack } from 'tamagui'

import { Typography } from '@/components'
import type { PracticeManifest } from '@/content/manifestTypes'
import { getAlternativeGroup } from '@/content/resolver'
// Not the '@/features/library' barrel: it drags in LibraryFeed, whose imports
// reach expo's dev-only async-require and break every PracticeFlow test.
import { AddToCollectionSheet } from '@/features/library/AddToCollectionSheet'
import { useSaveToggle } from '@/features/library/savedHooks'
import { usePinToggle } from '@/features/pinning/hooks'
import { lightTap } from '@/lib/haptics'
import { localizeContent } from '@/lib/i18n'
import { PracticePlanEditor, usePracticePlan } from '../PracticePlan'

// Two native sheets (or a sheet and a Modal) can't present at once on iOS; the
// second waits for the first to finish sliding away.
const sheetHandoffMs = 350

/**
 * Everything the old practice frontispiece did, folded into the prayer page:
 * plan and save act straight from the header; the ⋯ sheet holds the variant
 * list and every action by name, collection and offline included. State lives
 * here so the header row and the sheets (outside the scroll view) share it.
 */
export function usePracticeActions(manifest: PracticeManifest) {
  const router = useRouter()
  const plan = usePracticePlan(manifest)
  const save = useSaveToggle(manifest.id, 'practice')
  const pin = usePinToggle(manifest.id)
  const group = useMemo(() => getAlternativeGroup(manifest.id), [manifest.id])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [collectionOpen, setCollectionOpen] = useState(false)

  const afterSheet = (next: () => void) => {
    if (!sheetOpen) return next()
    setSheetOpen(false)
    setTimeout(next, sheetHandoffMs)
  }

  return {
    manifest,
    plan,
    save,
    pin,
    group,
    sheetOpen,
    openSheet: () => {
      lightTap()
      setSheetOpen(true)
    },
    closeSheet: () => setSheetOpen(false),
    collectionOpen,
    closeCollection: () => setCollectionOpen(false),
    onPlan: () =>
      afterSheet(() => {
        if (!plan.isInPlan) return plan.addToPlan()
        if (plan.isProgram) return plan.openProgram()
        router.push({ pathname: '/plan/[practiceId]', params: { practiceId: plan.planPracticeId } })
      }),
    onCollection: () => afterSheet(() => setCollectionOpen(true)),
    onSave: () => {
      lightTap()
      save.toggle()
    },
    onPin: () => {
      lightTap()
      pin.toggle()
    },
    onPickVariant: (id: string) => {
      setSheetOpen(false)
      if (id === manifest.id) return
      // Swap the practice in place — a replace() still slides a new screen in.
      router.setParams({ practiceId: id })
    },
  }
}

type Actions = ReturnType<typeof usePracticeActions>

/** The variant in italics under the title, when there are siblings to switch to. */
export function PracticeVariant({ actions }: { actions: Actions }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { manifest, group } = actions
  const label = manifest.alternativeTo ? localizeContent(manifest.alternativeTo.label) : ''
  if (!group || !label) return null

  return (
    <Pressable
      onPress={actions.openSheet}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={t('practice.variantsOf', { name: localizeContent(manifest.name) })}
      accessibilityHint={label}
    >
      <XStack alignItems="center" gap={5}>
        <Typography
          variant="sacred-title"
          fontSize={25}
          lineHeight={34}
          fontStyle="italic"
          color="$colorSecondary"
        >
          {label}
        </Typography>
        <ChevronDown size={16} strokeWidth={1.5} color={theme.colorSecondary.val} />
      </XStack>
    </Pressable>
  )
}

/**
 * The two actions everyone reads — add to plan, save — and ⋯ for the rest. The
 * plan icon is a calendar: a bare ✓ read as "mark this prayer as prayed".
 */
export function PracticeActionIcons({ actions }: { actions: Actions }) {
  const { t } = useTranslation()
  const { plan, save } = actions

  return (
    <XStack gap={26} alignItems="center">
      <Glyph
        icon={plan.isInPlan ? CalendarCheck : CalendarPlus}
        active={plan.isInPlan}
        onPress={actions.onPlan}
        accessibilityRole={plan.isInPlan ? 'link' : 'button'}
        accessibilityLabel={plan.isInPlan ? t('catalog.alreadyInPlan') : t('catalog.addToPlan')}
        testID="add-to-plan-button"
      />
      <Glyph
        icon={Star}
        filled={save.saved}
        active={save.saved}
        disabled={save.isWorking}
        onPress={actions.onSave}
        accessibilityRole="switch"
        accessibilityState={{ checked: save.saved, busy: save.isWorking }}
        accessibilityLabel={save.saved ? t('library.saved') : t('library.save')}
      />
      <Glyph
        icon={Ellipsis}
        active={false}
        onPress={actions.openSheet}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.practiceMore')}
        testID="practice-more"
      />
    </XStack>
  )
}

function Glyph({
  icon: Icon,
  active,
  filled = false,
  disabled,
  onPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  testID,
}: {
  icon: ComponentType<{ size?: number; color?: string; fill?: string; strokeWidth?: number }>
  active: boolean
  filled?: boolean
  disabled?: boolean
  onPress: () => void
  accessibilityRole: 'button' | 'switch' | 'link'
  accessibilityState?: { checked?: boolean; busy?: boolean }
  accessibilityLabel: string
  testID?: string
}) {
  const theme = useTheme()
  const ink = active ? theme.color.val : theme.colorSecondary.val
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={12}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      aria-checked={accessibilityState?.checked}
      aria-busy={accessibilityState?.busy}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Icon size={22} strokeWidth={1.5} color={ink} fill={filled ? ink : 'transparent'} />
    </Pressable>
  )
}

/** The ⋯ sheet, plus the collection and plan editors the header opens. */
export function PracticeActionSheets({ actions }: { actions: Actions }) {
  const { manifest, plan } = actions
  return (
    <>
      <PracticeSheet actions={actions} />
      <AddToCollectionSheet
        itemRef={manifest.id}
        open={actions.collectionOpen}
        onClose={actions.closeCollection}
      />
      <PracticePlanEditor manifest={manifest} plan={plan} />
    </>
  )
}

function PracticeSheet({ actions }: { actions: Actions }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { height } = useWindowDimensions()
  const { manifest, plan, save, pin, group } = actions

  const categories = (manifest.categories ?? [])
    .map((c) => t(`category.${c}`, { defaultValue: c }))
    .join(' · ')
  // A single detent sized to the content: the native host gives the RN tree no
  // height of its own, so the ScrollView inside needs an explicit one.
  const fraction = Math.min(0.85, 0.2 + (group ? 0.05 + group.members.length * 0.066 : 0))

  return (
    <BottomSheet
      index={actions.sheetOpen ? 0 : -1}
      snapPoints={[`${fraction * 100}%`]}
      enablePanDownToClose
      onClose={actions.closeSheet}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
    >
      <YStack height={height * fraction} width="100%" paddingHorizontal="$lg" paddingTop="$lg">
        <YStack alignItems="center" gap="$xs">
          <Typography variant="sacred-title" fontSize={26} lineHeight={34}>
            {localizeContent(manifest.name)}
          </Typography>
          {categories ? (
            <Typography variant="caption" fontSize={15}>
              {categories}
            </Typography>
          ) : null}
        </YStack>

        <YStack height={0.5} backgroundColor="$borderColor" marginTop="$md" />

        {/* Widened by the stamps' bleed, which a ScrollView would otherwise clip.
            It only takes the room the list needs, so the actions follow it. */}
        <ScrollView
          flexGrow={0}
          flexShrink={1}
          marginHorizontal={-8}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 8, paddingHorizontal: 8 }}
        >
          {group ? (
            <YStack gap={6}>
              <Typography
                variant="label"
                fontSize={14}
                color="$colorBurgundy"
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                {t('practice.form')}
              </Typography>
              <YStack marginHorizontal={-8}>
                {group.members.map((member) => {
                  const selected = member.manifest.id === manifest.id
                  return (
                    <Pressable
                      key={member.manifest.id}
                      onPress={() => actions.onPickVariant(member.manifest.id)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                      aria-selected={selected}
                      accessibilityLabel={member.label}
                    >
                      <YStack
                        paddingHorizontal={8}
                        paddingVertical={7}
                        borderRadius={1}
                        backgroundColor={selected ? '$color' : 'transparent'}
                      >
                        <Typography
                          fontSize={17}
                          lineHeight={22}
                          color={selected ? '$background' : '$colorSecondary'}
                        >
                          {member.label}
                        </Typography>
                        {member.description ? (
                          <Typography
                            fontSize={14}
                            lineHeight={18}
                            color={selected ? '$background' : '$colorSecondary'}
                            opacity={0.8}
                          >
                            {member.description}
                          </Typography>
                        ) : null}
                      </YStack>
                    </Pressable>
                  )
                })}
              </YStack>
            </YStack>
          ) : null}
        </ScrollView>

        <XStack
          justifyContent="space-around"
          paddingTop="$md"
          borderTopWidth={group ? 0.5 : 0}
          borderColor="$borderColor"
        >
          <LabeledGlyph
            icon={plan.isInPlan ? CalendarCheck : CalendarPlus}
            label={plan.isInPlan ? t('catalog.alreadyInPlan') : t('catalog.addToPlan')}
            active={plan.isInPlan}
            onPress={actions.onPlan}
            accessibilityRole={plan.isInPlan ? 'link' : 'button'}
          />
          <LabeledGlyph
            icon={Star}
            filled={save.saved}
            label={save.saved ? t('library.saved') : t('library.save')}
            active={save.saved}
            disabled={save.isWorking}
            onPress={actions.onSave}
            accessibilityRole="switch"
            accessibilityState={{ checked: save.saved, busy: save.isWorking }}
          />
          <LabeledGlyph
            icon={FolderPlus}
            label={t('library.collection')}
            active={false}
            onPress={actions.onCollection}
            accessibilityRole="button"
          />
          <LabeledGlyph
            icon={pin.isWorking ? Loader : ArrowDownToLine}
            label={t('library.offline')}
            active={pin.pinned}
            disabled={pin.isWorking}
            onPress={actions.onPin}
            accessibilityRole="switch"
            accessibilityState={{ checked: pin.pinned, busy: pin.isWorking }}
          />
        </XStack>
      </YStack>
    </BottomSheet>
  )
}

function LabeledGlyph({
  icon: Icon,
  label,
  active,
  filled = false,
  disabled,
  onPress,
  accessibilityRole,
  accessibilityState,
}: {
  icon: ComponentType<{ size?: number; color?: string; fill?: string; strokeWidth?: number }>
  label: string
  active: boolean
  filled?: boolean
  disabled?: boolean
  onPress: () => void
  accessibilityRole: 'button' | 'switch' | 'link'
  accessibilityState?: { checked?: boolean; busy?: boolean }
}) {
  const theme = useTheme()
  const ink = active ? theme.color.val : theme.colorSecondary.val
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      aria-checked={accessibilityState?.checked}
      aria-busy={accessibilityState?.busy}
      accessibilityLabel={label}
      style={{ flex: 1, opacity: disabled ? 0.5 : 1 }}
    >
      <YStack alignItems="center" gap={6}>
        <Icon size={22} strokeWidth={1.5} color={ink} fill={filled ? ink : 'transparent'} />
        <Typography fontSize={14} color={active ? '$color' : '$colorSecondary'} textAlign="center">
          {label}
        </Typography>
      </YStack>
    </Pressable>
  )
}
