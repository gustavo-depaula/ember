import { useRouter } from 'expo-router'
import { BookMarked, CircleDot, Compass, Mic2, Music, Sparkle } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Text, useTheme, YStack } from 'tamagui'

import { CandleFlame, PageHeader, ScreenLayout } from '@/components'
import { ShortcutRow } from '@/features/home'

export default function ExploreScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <YStack gap="$sm">
          <PageHeader title={t('explore.title')} />
          <Text
            fontFamily="$body"
            fontSize="$2"
            color="$colorSecondary"
            fontStyle="italic"
            textAlign="center"
            paddingHorizontal="$lg"
          >
            {t('explore.subtitle')}
          </Text>
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('explore.companions')} />

          <ShortcutRow
            leading={<CandleFlame size={28} />}
            title={t('oratio.title')}
            tagline={t('oratio.homeTagline')}
            onPress={() => router.push('/oratio')}
          />

          <ShortcutRow
            leading={<CircleDot size={22} color={theme.accent?.val} />}
            title={t('kyrie.title')}
            tagline={t('kyrie.homeTagline')}
            onPress={() => router.push('/kyrie')}
          />

          <ShortcutRow
            leading={<Compass size={22} color={theme.accent?.val} />}
            title={t('examen.title')}
            tagline={t('examen.homeTagline')}
            onPress={() =>
              router.push({
                pathname: '/pray/[practiceId]',
                params: { practiceId: 'examination-of-conscience' },
              })
            }
          />
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('explore.library')} />

          <ShortcutRow
            leading={<BookMarked size={22} color={theme.accent?.val} />}
            title={t('catechism.title')}
            tagline={t('catechism.homeTagline')}
            onPress={() => router.push('/catechism')}
          />

          <ShortcutRow
            leading={<Sparkle size={22} color={theme.accent?.val} />}
            title={t('saints.title')}
            tagline={t('saints.homeTagline')}
            onPress={() => router.push('/saints')}
          />

          <ShortcutRow
            leading={<Mic2 size={22} color={theme.accent?.val} />}
            title={t('creators.title')}
            tagline={t('creators.homeTagline')}
            onPress={() => router.push('/creators')}
          />
        </YStack>

        <YStack gap="$sm">
          <SectionHeading text={t('explore.tools')} />

          <ShortcutRow
            leading={<Music size={22} color={theme.accent?.val} />}
            title={t('piano.title')}
            tagline={t('piano.homeTagline')}
            onPress={() => router.push('/piano')}
          />
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}

function SectionHeading({ text }: { text: string }) {
  return (
    <Text
      fontFamily="$heading"
      fontSize="$2"
      color="$accent"
      letterSpacing={2}
      textTransform="uppercase"
      paddingHorizontal="$md"
    >
      {text}
    </Text>
  )
}
