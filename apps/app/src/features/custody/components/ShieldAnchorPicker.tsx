import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TextInput } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'

import { localizeContent } from '@/lib/i18n'

import { starterTextAnchors } from '../anchors/starter-text'
import type { Anchor } from '../types'

type Tab = 'text' | 'prayer' | 'lectio' | 'image' | 'silence'

const TABS: Tab[] = ['text', 'prayer', 'lectio', 'image', 'silence']

export function ShieldAnchorPicker({
  value,
  onChange,
}: {
  value: Anchor | null
  onChange: (a: Anchor) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [tab, setTab] = useState<Tab>(value?.kind ?? 'text')
  const [prayerRef, setPrayerRef] = useState(
    value?.kind === 'prayer' ? value.prayerRef : 'prayer/anima-christi',
  )
  const [prayerRendered, setPrayerRendered] = useState(
    value?.kind === 'prayer' ? value.rendered : '',
  )
  const [lectioRef, setLectioRef] = useState(value?.kind === 'lectio' ? value.reference : 'Jn 3:30')
  const [lectioRendered, setLectioRendered] = useState(
    value?.kind === 'lectio' ? value.rendered : '',
  )

  return (
    <YStack gap="$md">
      <XStack gap="$xs" flexWrap="wrap">
        {TABS.map((tabName) => {
          const selected = tab === tabName
          return (
            <Pressable
              key={tabName}
              onPress={() => setTab(tabName)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <YStack
                paddingHorizontal="$md"
                paddingVertical="$xs"
                borderRadius="$md"
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={selected ? '$accentSubtle' : 'transparent'}
              >
                <Text fontFamily="$body" fontSize="$2" color="$color">
                  {t(`custody.anchor.kinds.${tabName}`)}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>

      {tab === 'text' && (
        <YStack gap="$xs">
          {starterTextAnchors.map((seed) => {
            const text = localizeContent({
              'en-US': seed.text['en-US'],
              'pt-BR': seed.text['pt-BR'],
            })
            const isSelected = value?.kind === 'text' && value.text === text
            return (
              <Pressable
                key={seed.id}
                onPress={() =>
                  onChange({
                    kind: 'text',
                    text,
                    attribution: seed.attribution,
                  })
                }
                accessibilityRole="button"
              >
                <YStack
                  gap="$xs"
                  padding="$md"
                  borderRadius="$md"
                  borderWidth={1}
                  borderColor={isSelected ? '$accent' : '$borderColor'}
                  backgroundColor={isSelected ? '$accentSubtle' : 'transparent'}
                >
                  <Text fontFamily="$heading" fontSize="$2" color="$color">
                    {text}
                  </Text>
                  {seed.attribution && (
                    <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                      — {seed.attribution}
                    </Text>
                  )}
                </YStack>
              </Pressable>
            )
          })}
        </YStack>
      )}

      {tab === 'prayer' && (
        <YStack gap="$xs">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Prayer ref (e.g. prayer/anima-christi)
          </Text>
          <TextInput
            value={prayerRef}
            onChangeText={setPrayerRef}
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: theme.borderColor.val,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              color: theme.color.val,
            }}
          />
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            One-line opening (saved alongside the ref so the shield can render it without the
            network).
          </Text>
          <TextInput
            value={prayerRendered}
            onChangeText={setPrayerRendered}
            placeholder="Soul of Christ, sanctify me…"
            placeholderTextColor={theme.colorSecondary.val}
            multiline
            style={{
              borderWidth: 1,
              borderColor: theme.borderColor.val,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              minHeight: 80,
              color: theme.color.val,
            }}
          />
          <Pressable
            onPress={() => {
              if (prayerRef.trim() && prayerRendered.trim()) {
                onChange({
                  kind: 'prayer',
                  prayerRef: prayerRef.trim(),
                  rendered: prayerRendered.trim(),
                })
              }
            }}
          >
            <Text fontFamily="$body" fontSize="$2" color="$accent" textAlign="center">
              Use this prayer
            </Text>
          </Pressable>
        </YStack>
      )}

      {tab === 'lectio' && (
        <YStack gap="$xs">
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Scripture reference
          </Text>
          <TextInput
            value={lectioRef}
            onChangeText={setLectioRef}
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: theme.borderColor.val,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              color: theme.color.val,
            }}
          />
          <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
            Rendered text (saved with the ref so the shield can render it).
          </Text>
          <TextInput
            value={lectioRendered}
            onChangeText={setLectioRendered}
            multiline
            style={{
              borderWidth: 1,
              borderColor: theme.borderColor.val,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              minHeight: 80,
              color: theme.color.val,
            }}
          />
          <Pressable
            onPress={() => {
              if (lectioRef.trim() && lectioRendered.trim()) {
                onChange({
                  kind: 'lectio',
                  reference: lectioRef.trim(),
                  rendered: lectioRendered.trim(),
                })
              }
            }}
          >
            <Text fontFamily="$body" fontSize="$2" color="$accent" textAlign="center">
              Use this passage
            </Text>
          </Pressable>
        </YStack>
      )}

      {tab === 'image' && (
        <Pressable onPress={() => onChange({ kind: 'image', imageRef: 'sacred-heart' })}>
          <YStack
            padding="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor={value?.kind === 'image' ? '$accent' : '$borderColor'}
            backgroundColor={value?.kind === 'image' ? '$accentSubtle' : 'transparent'}
          >
            <Text fontFamily="$body" fontSize="$2" color="$color" textAlign="center">
              Sacred Heart (Phase B starter)
            </Text>
          </YStack>
        </Pressable>
      )}

      {tab === 'silence' && (
        <Pressable onPress={() => onChange({ kind: 'silence' })}>
          <YStack
            padding="$md"
            borderRadius="$md"
            borderWidth={1}
            borderColor={value?.kind === 'silence' ? '$accent' : '$borderColor'}
            backgroundColor={value?.kind === 'silence' ? '$accentSubtle' : 'transparent'}
          >
            <Text fontFamily="$body" fontSize="$2" color="$color" textAlign="center">
              Silent shield — only the commitment name
            </Text>
          </YStack>
        </Pressable>
      )}
    </YStack>
  )
}
