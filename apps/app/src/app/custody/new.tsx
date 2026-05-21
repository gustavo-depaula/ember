import { useTranslation } from 'react-i18next'

import { PageHeader, ScreenLayout } from '@/components'
import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'

export default function NewCommitmentScreen() {
  const { t } = useTranslation()
  return (
    <ScreenLayout>
      <PageHeader title={t('custody.commitments.create')} />
      <CommitmentEditor mode={{ kind: 'new' }} />
    </ScreenLayout>
  )
}
