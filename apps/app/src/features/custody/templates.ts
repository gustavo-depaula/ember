import type { CommitmentInput } from './types'

// Curated starter commitments. One tap adds them prefilled — the user can
// tweak before saving. Each carries an emoji + tagline so the list reads
// like a Catholic version of Opal's "Laser Focus" / "Rise & Shine" templates.

export type CommitmentTemplate = {
  id: string
  emoji: string
  name: string
  tagline: string
  // The accent color shown behind the template card. Keeps the list visually
  // distinct without requiring per-template art.
  tint: string
  build: () => CommitmentInput
}

export const COMMITMENT_TEMPLATES: CommitmentTemplate[] = [
  {
    id: 'custody-of-the-eyes',
    emoji: '👁️',
    name: 'Custody of the Eyes',
    tagline: 'Block pornographic sites — always on.',
    tint: '#7C3AED',
    build: () => ({
      name: 'Custody of the Eyes',
      kind: 'abstain',
      targets: [{ kind: 'domain-list', listKey: 'porn' }],
      schedule: { type: 'daily' },
      friction: 'prayer',
      frictionConfig: { kind: 'prayer' },
    }),
  },
  {
    id: 'compline',
    emoji: '🌙',
    name: 'Compline',
    tagline: 'Phone off after 21:00 until morning.',
    tint: '#1E3A8A',
    build: () => ({
      name: 'Compline',
      kind: 'time-fence',
      targets: [{ kind: 'domain-list', listKey: 'social' }],
      schedule: { type: 'daily' },
      friction: 'wait',
      frictionConfig: { kind: 'wait', waitSeconds: 300 },
      fenceStart: '21:00',
      fenceEnd: '07:00',
    }),
  },
  {
    id: 'morning-office',
    emoji: '☀️',
    name: 'Morning Office',
    tagline: 'Nothing distracts during morning prayer (6–7 AM).',
    tint: '#D97706',
    build: () => ({
      name: 'Morning Office',
      kind: 'time-fence',
      targets: [{ kind: 'domain-list', listKey: 'social' }],
      schedule: { type: 'daily' },
      friction: 'none',
      fenceStart: '06:00',
      fenceEnd: '07:00',
    }),
  },
  {
    id: 'lenten-news-fast',
    emoji: '✝️',
    name: 'Lenten News Fast',
    tagline: 'News sites off during Lent.',
    tint: '#7F1D1D',
    build: () => ({
      name: 'Lenten News Fast',
      kind: 'abstain',
      targets: [{ kind: 'domain-list', listKey: 'news' }],
      schedule: { type: 'daily', seasons: ['lent'] },
      friction: 'prayer',
      frictionConfig: { kind: 'prayer' },
    }),
  },
]
