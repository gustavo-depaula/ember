import { useRouter } from 'expo-router'
import {
  BookOpen,
  Flame,
  Heart,
  ScrollText,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useTheme, YStack } from 'tamagui'

import { PageHeader, ScreenLayout } from '@/components'
import { flags } from '@/config/flags'
import { ShortcutRow } from '@/features/home'

// You tab root (Phase 1 skeleton): your spiritual life — rule, fidelity,
// journal, and settings. Later phases inline the fidelity wall and journal
// timeline here instead of linking out.
export default function YouScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('nav.you')} />

        <YStack gap="$sm">
          <ShortcutRow
            leading={<ScrollText size={22} color={theme.accent?.val} />}
            title={t('you.rule')}
            tagline={t('you.ruleHint')}
            onPress={() => router.push('/plan')}
          />
          <ShortcutRow
            leading={<Sparkles size={22} color={theme.accent?.val} />}
            title={t('you.fidelity')}
            tagline={t('you.fidelityHint')}
            onPress={() => router.push('/plan')}
          />
        </YStack>

        <YStack gap="$sm">
          <ShortcutRow
            leading={<BookOpen size={22} color={theme.accent?.val} />}
            title={t('memoria.title')}
            tagline={t('you.journalHint')}
            onPress={() => router.push('/memoria')}
          />
          <ShortcutRow
            leading={<Heart size={22} color={theme.accent?.val} />}
            title={t('intentions.title')}
            tagline={t('you.intentionsHint')}
            onPress={() => router.push('/intentions')}
          />
          <ShortcutRow
            leading={<Flame size={22} color={theme.accent?.val} />}
            title={t('gratias.title')}
            tagline={t('you.gratiasHint')}
            onPress={() => router.push('/gratias')}
          />
          <ShortcutRow
            leading={<BookOpen size={22} color={theme.accent?.val} />}
            title={t('confessio.title')}
            tagline={t('you.confessionHint')}
            onPress={() => router.push('/confessio')}
          />
        </YStack>

        <YStack gap="$sm">
          {flags.custody && (
            <ShortcutRow
              leading={<ShieldCheck size={22} color={theme.accent?.val} />}
              title={t('you.custody')}
              tagline={t('you.custodyHint')}
              onPress={() => router.push('/custody')}
            />
          )}
          <ShortcutRow
            leading={<SettingsIcon size={22} color={theme.accent?.val} />}
            title={t('settings.title')}
            tagline={t('you.settingsHint')}
            onPress={() => router.push('/settings')}
          />
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
