/**
 * What brings a person to pray, each with its painting: onboarding's one
 * question, asked again by an empty plan. The smallest step first: a beginner
 * meets themselves at the top, and the ones who know what they want (the Work,
 * the Office) find their line below.
 */
export const reasons = [
  { key: 'begin', art: 'plan-of-life-template/beginner-minimum' },
  { key: 'grow', art: 'collection/mental-prayer' },
  { key: 'obra', art: 'plan-of-life-template/opus-dei' },
  { key: 'office', art: 'practice/patristic-reading' },
] as const

export type ReasonKey = (typeof reasons)[number]['key']
