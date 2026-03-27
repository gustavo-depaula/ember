import type { Tier } from '@/db/schema'

export const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export const tierConfig: Record<Tier, { color: string }> = {
  essential: { color: '$colorGreen' },
  ideal: { color: '$colorMutedBlue' },
  extra: { color: '$accent' },
}
