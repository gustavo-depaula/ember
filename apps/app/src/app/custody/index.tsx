import { Link, useRouter } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, XStack, YStack } from 'tamagui'

import { AnimatedPressable, ScreenLayout } from '@/components'
import { CommitmentRow } from '@/features/custody/components/CommitmentRow'
import { useCommitments } from '@/features/custody/hooks'
import { COMMITMENT_TEMPLATES, type CommitmentTemplate } from '@/features/custody/templates'
import { lightTap } from '@/lib/haptics'

// Dark ink for text/icon on the gold accent — readable in both light + dark
// themes (the accent is gold in both).
const ACCENT_INK = '#0E0D0C'

export default function CustodyScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data: commitments } = useCommitments({ includeArchived: false })
  const isEmpty = !commitments || commitments.length === 0

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingTop="$md" paddingBottom={insets.bottom + 24}>
        <Text fontFamily="$heading" fontSize={32} color="$color">
          {t('custody.title')}
        </Text>

        {/* Active commitments come first — they're what the user wants to
            check / manage. Templates live below as the "add another" path. */}
        {!isEmpty && (
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

        {/* Templates grid — primary path to creating a commitment now that
            the old top-right "+" is gone. Each card uses Link.AppleZoom so
            it morphs into the editor on iOS 18+. */}
        <YStack gap="$sm">
          <Text
            fontFamily="$heading"
            fontSize="$2"
            color="$colorSecondary"
            letterSpacing={1}
            paddingHorizontal="$xs"
          >
            {t('custody.startWithTemplate')}
          </Text>
          <XStack flexWrap="wrap" gap={12} rowGap={12}>
            {COMMITMENT_TEMPLATES.map((tpl) => (
              <TemplateLink key={tpl.id} template={tpl} />
            ))}
            <CustomLink label={t('custody.commitments.create')} />
          </XStack>
        </YStack>

        {isEmpty && (
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="$colorSecondary"
            textAlign="center"
            paddingHorizontal="$lg"
          >
            {t('custody.tagline')}
          </Text>
        )}
      </YStack>
    </ScreenLayout>
  )
}

function TemplateLink({ template }: { template: CommitmentTemplate }) {
  return (
    <Link
      href={{ pathname: '/custody/new', params: { template: template.id } }}
      push
      asChild
      onPress={() => lightTap()}
    >
      <Link.AppleZoom>
        <AnimatedPressable
          accessibilityRole="link"
          accessibilityLabel={template.name}
          style={{ width: '48%' }}
        >
          <YStack
            aspectRatio={1}
            borderRadius={18}
            overflow="hidden"
            backgroundColor={template.tint}
            padding="$md"
            justifyContent="space-between"
          >
            <Text fontSize={36}>{template.emoji}</Text>
            <YStack gap={2}>
              <Text fontFamily="$heading" fontSize="$3" color="white" numberOfLines={1}>
                {template.name}
              </Text>
              <Text fontFamily="$body" fontSize="$1" color="white" opacity={0.85} numberOfLines={2}>
                {template.tagline}
              </Text>
            </YStack>
          </YStack>
        </AnimatedPressable>
      </Link.AppleZoom>
    </Link>
  )
}

function CustomLink({ label }: { label: string }) {
  return (
    <Link href="/custody/new" push asChild onPress={() => lightTap()}>
      <Link.AppleZoom>
        <AnimatedPressable
          accessibilityRole="link"
          accessibilityLabel={label}
          style={{ width: '48%' }}
        >
          <YStack
            aspectRatio={1}
            borderRadius={18}
            borderWidth={1.5}
            borderColor="$accent"
            borderStyle="dashed"
            backgroundColor="$backgroundSurface"
            padding="$md"
            alignItems="center"
            justifyContent="center"
            gap="$sm"
          >
            <View
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor="$accent"
              alignItems="center"
              justifyContent="center"
            >
              <Plus size={24} color={ACCENT_INK} />
            </View>
            <Text fontFamily="$heading" fontSize="$3" color="$color" textAlign="center">
              {label}
            </Text>
          </YStack>
        </AnimatedPressable>
      </Link.AppleZoom>
    </Link>
  )
}
