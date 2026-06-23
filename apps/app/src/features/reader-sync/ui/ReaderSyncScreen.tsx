import { useTranslation } from 'react-i18next'
import { Button, Text, YStack } from 'tamagui'
import { Card, PageHeader, ScreenLayout, SectionDivider } from '@/components'
import { Typography } from '@/components/typography'
import { useReaderSync } from '../server/useReaderSync'

// Walks the user through pairing the Xteink X4 (CrossPoint firmware): start the
// local OPDS server, then add the shown URL as an OPDS server on the reader and
// browse "Today". The server only runs while this screen/app is foregrounded.
export function ReaderSyncScreen() {
  const { t } = useTranslation()
  const { status, url, error, start, stop } = useReaderSync()
  const running = status === 'running'

  return (
    <ScreenLayout>
      <YStack gap="$lg" paddingVertical="$lg">
        <PageHeader title={t('readerSync.title', 'Reader Sync')} />

        <Typography variant="annotation">
          {t(
            'readerSync.intro',
            "Pray today's Office, Mass, and Gospel on your Xteink X4. Start the server below, then add its address as an OPDS server on the reader.",
          )}
        </Typography>

        {running && url ? (
          <Card gap="$sm">
            <Typography variant="label">
              {t('readerSync.serverAddress', 'OPDS server address')}
            </Typography>
            <Text selectable userSelect="text" fontSize="$4" fontWeight="700">
              {url}
            </Text>
            <Typography variant="annotation">
              {t(
                'readerSync.addHint',
                'On the reader: Settings → OPDS Servers → Add, and paste this URL. Then browse Today.',
              )}
            </Typography>
          </Card>
        ) : undefined}

        {status === 'error' ? (
          <Card>
            <Typography variant="rubric">
              {error ?? t('readerSync.error', 'Could not start the server.')}
            </Typography>
          </Card>
        ) : undefined}

        <Button disabled={status === 'starting'} onPress={() => (running ? stop() : start())}>
          {running
            ? t('readerSync.stop', 'Stop syncing')
            : status === 'starting'
              ? t('readerSync.starting', 'Starting…')
              : t('readerSync.start', 'Start syncing')}
        </Button>

        {running ? (
          <Typography variant="annotation" textAlign="center">
            {t('readerSync.keepOpen', 'Keep Ember open while the reader downloads.')}
          </Typography>
        ) : undefined}

        <SectionDivider />

        <YStack gap="$xs">
          <Typography variant="label">{t('readerSync.aboutTitle', 'How it works')}</Typography>
          <Typography variant="annotation">
            {t(
              'readerSync.about',
              'Ember builds each prayer as an EPUB and serves it over your Wi-Fi. Your phone and the reader must be on the same network.',
            )}
          </Typography>
        </YStack>
      </YStack>
    </ScreenLayout>
  )
}
