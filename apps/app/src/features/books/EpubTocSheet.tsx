import { X } from 'lucide-react-native'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { AnimatedPressable } from '@/components'
import type { TocNode } from '@/content/sources/filesystem'
import { localizeContent } from '@/lib/i18n'

type Props = {
  toc: TocNode[]
  currentChapterId: string
  onSelectChapter: (id: string) => void
  onClose: () => void
}

function TocItem({
  node,
  currentChapterId,
  onSelect,
  depth,
}: {
  node: TocNode
  currentChapterId: string
  onSelect: (id: string) => void
  depth: number
}) {
  const isLeaf = !node.children?.length
  const isCurrent = node.id === currentChapterId

  return (
    <>
      {isLeaf ? (
        <AnimatedPressable onPress={() => onSelect(node.id)}>
          <XStack
            paddingVertical="$xs"
            paddingHorizontal="$md"
            paddingLeft={16 + depth * 16}
            backgroundColor={isCurrent ? '$accentSubtle' : 'transparent'}
            borderRadius="$sm"
          >
            <Text
              fontFamily="$body"
              fontSize="$2"
              color={isCurrent ? '$accent' : '$color'}
              numberOfLines={2}
            >
              {localizeContent(node.title)}
            </Text>
          </XStack>
        </AnimatedPressable>
      ) : (
        <YStack paddingTop={depth > 0 ? '$xs' : '$sm'}>
          <Text
            fontFamily="$heading"
            fontSize="$2"
            color="$colorSecondary"
            paddingHorizontal="$md"
            paddingLeft={16 + depth * 16}
            paddingBottom="$xs"
          >
            {localizeContent(node.title)}
          </Text>
          {node.children?.map((child) => (
            <TocItem
              key={child.id}
              node={child}
              currentChapterId={currentChapterId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </YStack>
      )}
    </>
  )
}

export function EpubTocSheet({ toc, currentChapterId, onSelectChapter, onClose }: Props) {
  const theme = useTheme()
  const { t } = useTranslation()

  const handleSelect = useCallback(
    (id: string) => {
      onSelectChapter(id)
      onClose()
    },
    [onSelectChapter, onClose],
  )

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(120)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        entering={SlideInRight.duration(200)}
        exiting={SlideOutRight.duration(150)}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: 320,
          backgroundColor: theme.background.val,
          zIndex: 11,
          borderLeftWidth: 1,
          borderLeftColor: theme.borderColor.val,
        }}
      >
        <YStack flex={1} paddingTop="$lg">
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$md"
            paddingBottom="$md"
          >
            <Text fontFamily="$heading" fontSize="$4" color="$color">
              {t('prayerBooks.tableOfContents')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={20} color={theme.colorSecondary.val} />
            </Pressable>
          </XStack>

          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            {toc.map((node) => (
              <TocItem
                key={node.id}
                node={node}
                currentChapterId={currentChapterId}
                onSelect={handleSelect}
                depth={0}
              />
            ))}
          </ScrollView>
        </YStack>
      </Animated.View>
    </>
  )
}
