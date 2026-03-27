import type { Tier, TimeBlock } from '@/db/schema'

export const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const tierConfig: Record<Tier, { label: string; color: string }> = {
  essential: { label: 'Essential', color: '$colorGreen' },
  ideal: { label: 'Ideal', color: '$colorMutedBlue' },
  extra: { label: 'Extra', color: '$accent' },
}

export const timeBlockLabels: Record<TimeBlock, string> = {
  morning: 'Morning',
  daytime: 'Daytime',
  evening: 'Evening',
  flexible: 'Flexible',
}
