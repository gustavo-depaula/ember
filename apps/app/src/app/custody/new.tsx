import { ScreenLayout } from '@/components'
import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'

export default function NewCommitmentScreen() {
  return (
    <ScreenLayout scroll={false} padded={false}>
      <CommitmentEditor mode={{ kind: 'new' }} />
    </ScreenLayout>
  )
}
