// biome-ignore-all lint/suspicious/noArrayIndexKey: static section list never reorders
import { resolveFlow } from '@ember/content-engine'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { Text, useTheme, XStack, YStack } from 'tamagui'
import { ManuscriptFrame, PrimitiveBlock, ScreenLayout } from '@/components'
import { ImageViewerProvider } from '@/components/ImageViewerContext'
import { createEngineContext } from '@/content/engineContext'
import { preprocessFlow } from '@/content/preprocessFlow'
import { getChapterManifest, loadChapterContent, prefetchChapterProse } from '@/content/resolver'
import { useToday } from '@/hooks/useToday'
import { localizeContent } from '@/lib/i18n'
import { usePreferencesStore } from '@/stores/preferencesStore'

export default function ChapterReaderScreen() {
  const { t } = useTranslation()
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>()
  const router = useRouter()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const now = useToday()
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  const translation = usePreferencesStore((s) => s.translation)
  const doVersion = usePreferencesStore((s) => s.doVersion)

  const chapter = chapterId ? getChapterManifest(chapterId) : undefined
  const contentQuery = useQuery({
    queryKey: ['chapter-content', chapterId],
    queryFn: async () => {
      if (!chapterId) return null
      await prefetchChapterProse(chapterId, [])
      return (await loadChapterContent(chapterId)) ?? null
    },
    enabled: !!chapterId,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const content = contentQuery.data ?? undefined

  const primitivesQuery = useQuery({
    queryKey: ['chapter-primitives', chapterId, contentLanguage, translation],
    queryFn: async () => {
      if (!content) return []
      const engineContext = createEngineContext(chapterId)
      const rendered = resolveFlow(content, { date: now }, engineContext)
      return preprocessFlow(rendered, {
        queryClient,
        prefs: { lang: contentLanguage, translation, doVersion },
        date: now,
      })
    },
    enabled: !!content,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const sections = primitivesQuery.data ?? []

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
                {sections.map((primitive, i) => (
                  <PrimitiveBlock
                    key={`${primitive.type}-${i}`}
                    primitive={primitive}
                    practiceId=""
                    onSelectOverride={() => {}}
                  />
                ))}
              </YStack>
            </ManuscriptFrame>
          </ScrollView>
        </YStack>
      </ScreenLayout>
    </ImageViewerProvider>
  )
}
