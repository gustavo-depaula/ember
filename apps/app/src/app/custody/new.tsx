import { CommitmentEditor } from '@/features/custody/components/CommitmentEditor'

// Renders the editor at full bleed — no ScreenLayout wrapper, which would
// add a notch-clearing paddingTop and horizontal insets. The editor manages
// its own safe area so the radial wash can bleed behind the status bar
// (Apple Podcasts-style).
export default function NewCommitmentScreen() {
  return <CommitmentEditor mode={{ kind: 'new' }} />
}
