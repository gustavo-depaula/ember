import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { localizeContent } from '@/lib/i18n'

import gambling from '../blocklists/gambling.json'
import news from '../blocklists/news.json'
import porn from '../blocklists/porn.json'
import social from '../blocklists/social.json'
import type { Target } from '../types'

type BlockListKey = 'porn' | 'gambling' | 'social' | 'news'

const BLOCKLISTS: { key: BlockListKey; name: { 'en-US': string; 'pt-BR': string } }[] = [
  { key: 'porn', name: porn.name },
  { key: 'gambling', name: gambling.name },
  { key: 'social', name: social.name },
  { key: 'news', name: news.name },
]

export function DomainListTargetPicker({
  targets,
  onChange,
}: {
  targets: Target[]
  onChange: (next: Target[]) => void
}) {
  const { t } = useTranslation()
  const selectedKeys = new Set(
    targets
      .filter((x) => x.kind === 'domain-list')
      .map((x) => (x as { listKey: BlockListKey }).listKey),
  )
  const others = targets.filter((x) => x.kind !== 'domain-list')

  const toggle = (key: BlockListKey) => {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    const lists: Target[] = [...next].map((k) => ({ kind: 'domain-list', listKey: k }))
    onChange([...others, ...lists])
  }

  return (
    <YStack gap="$xs">
      <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
        {t('custody.targets.curatedHelp', {
          defaultValue: 'Tap a list to include its domains.',
        })}
      </Text>
      <XStack gap="$xs" flexWrap="wrap">
        {BLOCKLISTS.map((list) => {
          const selected = selectedKeys.has(list.key)
          return (
            <Pressable
              key={list.key}
              onPress={() => toggle(list.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <YStack
                paddingHorizontal="$md"
                paddingVertical="$xs"
                borderRadius="$md"
                borderWidth={1}
                borderColor={selected ? '$accent' : '$borderColor'}
                backgroundColor={selected ? '$accent' : 'transparent'}
              >
                <Text fontFamily="$body" fontSize="$2" color={selected ? 'white' : '$color'}>
                  {localizeContent(list.name)}
                </Text>
              </YStack>
            </Pressable>
          )
        })}
      </XStack>
    </YStack>
  )
}
