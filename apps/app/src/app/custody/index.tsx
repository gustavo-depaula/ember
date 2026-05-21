import { useRouter } from 'expo-router'
import { Plus, Settings } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, useTheme, View, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { CommitmentRow } from '@/features/custody/components/CommitmentRow'
import { useCommitments } from '@/features/custody/hooks'
import { COMMITMENT_TEMPLATES, type CommitmentTemplate } from '@/features/custody/templates'

export default function CustodyScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { data: commitments } = useCommitments({ includeArchived: false })
  const isEmpty = !commitments || commitments.length === 0

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingTop="$md" paddingBottom={insets.bottom + 24}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontFamily="$heading" fontSize={32} color="$color">
            {t('custody.title')}
          </Text>
          <XStack gap="$xs">
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              hitSlop={8}
            >
              <View
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="$backgroundSurface"
                alignItems="center"
                justifyContent="center"
              >
                <Settings size={18} color={theme.colorSecondary?.val} />
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push('/custody/new')}
              accessibilityRole="button"
              accessibilityLabel={t('custody.commitments.create')}
              hitSlop={8}
            >
              <View
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="$accent"
                alignItems="center"
                justifyContent="center"
              >
                <Plus size={18} color="white" />
              </View>
            </Pressable>
          </XStack>
        </XStack>

        {isEmpty ? (
          <EmptyCard
            onPress={() => router.push('/custody/new')}
            cta={t('custody.empty.cta')}
            heading={t('custody.empty.heading')}
            tagline={t('custody.tagline')}
          />
        ) : (
          <YStack gap="$sm">
            {commitments?.map((c) => (
              <CommitmentRow
                key={c.id}
                commitment={c}
                onPress={() =>
                  router.push({
                    pathname: '/custody/[commitmentId]',
                    params: { commitmentId: c.id },
                  })
                }
              />
            ))}
          </YStack>
        )}

        <YStack gap="$sm" paddingTop="$md">
          <Text
            fontFamily="$heading"
            fontSize="$2"
            color="$colorSecondary"
            letterSpacing={1}
            paddingHorizontal="$xs"
          >
            START WITH A TEMPLATE
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
          >
            {COMMITMENT_TEMPLATES.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onPress={() =>
                  router.push({
                    pathname: '/custody/new',
                    params: { template: tpl.id },
                  })
                }
              />
            ))}
          </ScrollView>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

function EmptyCard({
  onPress,
  cta,
  heading,
  tagline,
}: {
  onPress: () => void
  cta: string
  heading: string
  tagline: string
}) {
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={cta}>
      <YStack
        alignItems="center"
        gap="$md"
        paddingVertical={48}
        paddingHorizontal="$lg"
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$borderColor"
        borderStyle="dashed"
        backgroundColor="$backgroundSurface"
      >
        <View
          width={56}
          height={56}
          borderRadius={28}
          backgroundColor="$accentSubtle"
          alignItems="center"
          justifyContent="center"
        >
          <Plus size={28} color="white" />
        </View>
        <YStack gap="$xs" alignItems="center">
          <Text fontFamily="$heading" fontSize="$4" color="$color" textAlign="center">
            {heading}
          </Text>
          <Text fontFamily="$body" fontSize="$2" color="$colorSecondary" textAlign="center">
            {tagline}
          </Text>
        </YStack>
        <Text fontFamily="$heading" fontSize="$2" color="$accent">
          {cta}
        </Text>
      </YStack>
    </AnimatedPressable>
  )
}

function TemplateCard({
  template,
  onPress,
}: {
  template: CommitmentTemplate
  onPress: () => void
}) {
  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={template.name}
    >
      <YStack
        width={220}
        height={180}
        borderRadius={18}
        overflow="hidden"
        backgroundColor={template.tint}
        padding="$md"
        justifyContent="space-between"
      >
        <Text fontSize={40}>{template.emoji}</Text>
        <YStack gap="$xs">
          <Text fontFamily="$heading" fontSize="$3" color="white">
            {template.name}
          </Text>
          <Text fontFamily="$body" fontSize="$1" color="white" opacity={0.85}>
            {template.tagline}
          </Text>
        </YStack>
      </YStack>
    </AnimatedPressable>
  )
}
