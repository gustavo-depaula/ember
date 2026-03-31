import { useRouter } from 'expo-router'
import { ChevronLeft, Plus } from 'lucide-react-native'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { ScreenLayout } from '@/components'
import { getManifest } from '@/content/practices'
import type { Tier, UserPracticeSlot } from '@/db/schema'
import { getPracticeIcon } from '@/db/seed'
import { enrichSlot, useAllSlots, useCreatePractice } from '@/features/plan-of-life'
import type { PracticeFormData } from '@/features/plan-of-life/components/PracticeEditSheet'
import { PracticeEditSheet } from '@/features/plan-of-life/components/PracticeEditSheet'
import { TierBadge } from '@/features/plan-of-life/components/TierBadge'
import { localizeContent } from '@/lib/i18n'

type PracticeGroup = {
  practiceId: string
  name: string
  icon: string
  tier: Tier
  slots: UserPracticeSlot[]
  enabled: boolean
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getPracticeDisplayName(
  slots: UserPracticeSlot[],
  t: ReturnType<typeof useTranslation>['t'],
): string {
  const first = slots[0]
  if (!first) return ''
  const manifest = getManifest(first.practice_id)
  if (manifest) {
    const key = `practice.${first.practice_id}`
    const translated = t(key)
    if (translated !== key) return translated
    return localizeContent(manifest.name)
  }
  return first.custom_name ?? first.practice_id
}

function SlotCount({ count }: { count: number }) {
  if (count <= 1) return null
  return (
    <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
      {count} slots
    </Text>
  )
}

export default function PlanSettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const { data: allSlots = [] } = useAllSlots()
  const createPractice = useCreatePractice()

  const [showEditor, setShowEditor] = useState(false)

  // Group slots by practice, then by tier
  const grouped = useMemo(() => {
    const byPractice = new Map<string, UserPracticeSlot[]>()
    for (const s of allSlots) {
      const existing = byPractice.get(s.practice_id) ?? []
      existing.push(s)
      byPractice.set(s.practice_id, existing)
    }

    const practices: PracticeGroup[] = []
    for (const [practiceId, slots] of byPractice) {
      const first = slots[0]
      const enriched = enrichSlot(first, t)
      practices.push({
        practiceId,
        name: getPracticeDisplayName(slots, t),
        icon: enriched.icon,
        tier: first.tier,
        slots,
        enabled: slots.some((s) => s.enabled === 1),
      })
    }

    const groups: Record<Tier, PracticeGroup[]> = { essential: [], ideal: [], extra: [] }
    for (const p of practices) {
      if (p.tier in groups) groups[p.tier].push(p)
    }
    return groups
  }, [allSlots, t])

  const tierSections: Tier[] = ['essential', 'ideal', 'extra']

  function handleAdd() {
    setShowEditor(true)
  }

  function handleSave(data: PracticeFormData) {
    createPractice.mutate({
      id: slugify(data.name),
      customName: data.name,
      customIcon: data.icon,
      customDesc: data.description,
      slot: {
        tier: data.tier,
        time: undefined,
        schedule: JSON.stringify(data.schedule),
      },
    })
    setShowEditor(false)
  }

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <XStack alignItems="center" gap="$md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={theme.color.val} />
          </Pressable>
          <Text flex={1} fontFamily="$heading" fontSize="$5" color="$color">
            {t('plan.customize')}
          </Text>
          <Pressable onPress={handleAdd} hitSlop={8}>
            <Plus size={24} color={theme.accent.val} />
          </Pressable>
        </XStack>

        {tierSections.map((tier) => (
          <YStack key={tier} gap="$sm">
            <XStack alignItems="center" gap="$sm" paddingHorizontal="$xs">
              <TierBadge tier={tier} />
              <Text fontFamily="$heading" fontSize="$3" color="$color">
                {t(`tier.${tier}`)}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                ({grouped[tier].length})
              </Text>
            </XStack>

            {grouped[tier].map((group) => (
              <Pressable
                key={group.practiceId}
                onPress={() => router.push(`/plan/${group.practiceId}` as any)}
              >
                <XStack
                  backgroundColor="$backgroundSurface"
                  borderRadius="$lg"
                  padding="$md"
                  alignItems="center"
                  gap="$md"
                  opacity={group.enabled ? 1 : 0.5}
                >
                  <Text fontSize={20}>{getPracticeIcon(group.icon)}</Text>
                  <YStack flex={1} gap={2}>
                    <Text fontFamily="$body" fontSize="$3" color="$color">
                      {group.name}
                    </Text>
                    <SlotCount count={group.slots.length} />
                  </YStack>
                  {!group.enabled && (
                    <Text fontFamily="$body" fontSize={11} color="$colorSecondary">
                      {t('plan.disabled')}
                    </Text>
                  )}
                  <Text fontFamily="$body" fontSize="$2" color="$colorSecondary">
                    ›
                  </Text>
                </XStack>
              </Pressable>
            ))}

            {grouped[tier].length === 0 && (
              <Text
                fontFamily="$body"
                fontSize="$2"
                color="$colorSecondary"
                paddingHorizontal="$xs"
              >
                {t('plan.noPractices', { tier: t(`tier.${tier}`).toLowerCase() })}
              </Text>
            )}
          </YStack>
        ))}

        <Pressable onPress={handleAdd}>
          <XStack
            borderWidth={1}
            borderColor="$accent"
            borderRadius="$lg"
            borderStyle="dashed"
            padding="$md"
            alignItems="center"
            justifyContent="center"
            gap="$sm"
          >
            <Plus size={18} color={theme.accent.val} />
            <Text fontFamily="$body" fontSize="$3" color="$accent">
              {t('plan.addCustom')}
            </Text>
          </XStack>
        </Pressable>

        <Pressable onPress={() => router.push('/practices' as any)}>
          <XStack
            backgroundColor="$backgroundSurface"
            borderRadius="$lg"
            padding="$md"
            alignItems="center"
            justifyContent="center"
            gap="$sm"
          >
            <Text fontFamily="$body" fontSize="$3" color="$accent">
              {t('catalog.browseCatalog')}
            </Text>
            <Text fontFamily="$body" fontSize="$2" color="$accent">
              ›
            </Text>
          </XStack>
        </Pressable>
      </YStack>

      <Modal
        visible={showEditor}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditor(false)}
      >
        <YStack flex={1} justifyContent="flex-end">
          <Pressable
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
            onPress={() => setShowEditor(false)}
          />
          <PracticeEditSheet onSave={handleSave} onClose={() => setShowEditor(false)} />
        </YStack>
      </Modal>
    </ScreenLayout>
  )
}
