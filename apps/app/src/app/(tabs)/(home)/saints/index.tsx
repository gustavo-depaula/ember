import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { YStack } from 'tamagui'
import { PageHeader } from '@/components'
import { ScreenLayout } from '@/components/ScreenLayout'
import { SaintCardGrid, SaintCardViewer } from '@/features/saints/components'

export default function SaintsScreen() {
  const { t } = useTranslation()
  const [viewerIndex, setViewerIndex] = useState(-1)

  const handleSelectSaint = useCallback((index: number) => {
    setViewerIndex(index)
  }, [])

  const handleClose = useCallback(() => {
    setViewerIndex(-1)
  }, [])

  return (
    <ScreenLayout scroll={false}>
      <YStack gap="$lg" flex={1} paddingVertical="$lg">
        <PageHeader title={t('saints.title')} />

        <SaintCardGrid onSelectSaint={handleSelectSaint} />
      </YStack>

      <SaintCardViewer
        visible={viewerIndex >= 0}
        initialIndex={Math.max(viewerIndex, 0)}
        onClose={handleClose}
      />
    </ScreenLayout>
  )
}
