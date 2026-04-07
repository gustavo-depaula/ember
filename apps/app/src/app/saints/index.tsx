import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, YStack } from 'tamagui'
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
      <YStack gap="$md" flex={1} paddingTop="$lg">
        <Text fontFamily="$display" fontSize="$5" color="$accent" textAlign="center">
          {t('saints.title')}
        </Text>

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
