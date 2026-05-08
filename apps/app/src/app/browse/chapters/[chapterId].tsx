// biome-ignore-all lint/suspicious/noArrayIndexKey: static section list never reorders
import { resolveFlow } from '@ember/content-engine'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { ManuscriptFrame, ScreenLayout, SectionBlock } from '@/components'
import { ImageViewerProvider } from '@/components/ImageViewerContext'
import { createEngineContext } from '@/content/engineContext'
import { getChapterManifest, loadChapterContent, prefetchChapterProse } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'

export default function ChapterReaderScreen() {
  const { t } = useTranslation()
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>()
  const router = useRouter()
  const theme = useTheme()

  const chapter = chapterId ? getChapterManifest(chapterId) : undefined
  const contentQuery = useQuery({
    queryKey: ['chapter-content', chapterId],
    queryFn: async () => {
      if (!chapterId) return null
      await prefetchChapterProse(chapterId, [])
      return (await loadChapterContent(chapterId)) ?? null
    },
    enabled: !!chapterId,
    staleTime: Infinity,
  })
  const content = contentQuery.data ?? undefined

  const sections = useMemo(() => {
    if (!content) return []
    const engineContext = createEngineContext(chapterId)
    return resolveFlow(content, { date: new Date() }, engineContext)
  }, [content, chapterId])

  if (!chapter || !content) {
    return (
      <ScreenLayout>
        <YStack padding="$lg">
          <Text fontFamily="$body" color="$colorSecondary">
            {t('browse.chapterNotFound')}
          </Text>
        </YStack>
      </ScreenLayout>
    )
  }

  const title = localizeContent(chapter.title)

  return (
    <ImageViewerProvider>
      <ScreenLayout>
        <YStack flex={1}>
          <XStack alignItems="center" gap="$md" paddingVertical="$md">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.goBack')}
            >
              <ChevronLeft size={24} color={theme.color.val} />
            </Pressable>
            <YStack flex={1}>
              <Text fontFamily="$heading" fontSize="$4" color="$color" numberOfLines={2}>
                {title}
              </Text>
              {chapter.subtitle && (
                <Text fontFamily="$body" fontSize="$1" color="$colorSecondary">
                  {localizeContent(chapter.subtitle)}
                </Text>
              )}
            </YStack>
          </XStack>

          <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
            <ManuscriptFrame contentPadding="$sm">
              <YStack gap="$lg" paddingVertical="$md" paddingHorizontal="$sm">
                {sections.map((section, i) => (
                  <SectionBlock key={`${section.type}-${i}`} section={section} />
                ))}
              </YStack>
            </ManuscriptFrame>
          </ScrollView>
        </YStack>
      </ScreenLayout>
    </ImageViewerProvider>
  )
}
