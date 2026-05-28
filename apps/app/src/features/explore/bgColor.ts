import type { LiturgicalCategory, LiturgicalSeason } from '@ember/liturgical'

/**
 * Deep, saturated block tones for art-less feature blocks and cover cards. Each
 * is a diagonal gradient (top-left → bottom-right) dark enough that overlaid
 * cream text stays legible without a scrim. These are raw hexes, not theme
 * tokens: the illuminated blocks read the same in parchment and Tenebrae — a
 * jewel-toned panel under cream ink, like a stained-glass quarry.
 */
export type BlockTone = { from: string; to: string }

/** Cream ink that sits on every block, art or color. */
export const blockInk = '#F5EFE2'
/** Gold-cream for the small tracked label above a block headline. */
export const blockLabelInk = '#E8C97A'

const violet: BlockTone = { from: '#4A2860', to: '#1F1030' }
const deepViolet: BlockTone = { from: '#3D1F52', to: '#180A22' }
const gold: BlockTone = { from: '#8B6914', to: '#352608' }
const green: BlockTone = { from: '#1E4A32', to: '#0C2418' }
const marian: BlockTone = { from: '#1E3A5C', to: '#0A1626' }
const red: BlockTone = { from: '#6B1620', to: '#2A080C' }
const rose: BlockTone = { from: '#5C2740', to: '#260E1A' }
const burgundy: BlockTone = { from: '#5A1722', to: '#24090E' }
const ink: BlockTone = { from: '#2E3A4A', to: '#11161E' }

const seasonTones: Record<LiturgicalSeason, BlockTone> = {
  advent: violet,
  christmas: gold,
  epiphany: green,
  septuagesima: violet,
  lent: deepViolet,
  easter: gold,
  ordinary: green,
  'post-pentecost': green,
}

const categoryTones: Partial<Record<LiturgicalCategory, BlockTone>> = {
  solemnity_temporal: gold,
  feast_of_the_lord: gold,
  blessed_virgin_mary: marian,
  apostle: red,
  martyr: red,
  pastor: burgundy,
  doctor_of_the_church: gold,
  virgin: rose,
  religious: green,
  holy_man: burgundy,
  holy_woman: rose,
  angels: marian,
  dedication: ink,
}

export function toneForSeason(season: LiturgicalSeason): BlockTone {
  return seasonTones[season]
}

/** Saint/feast block tone: category first, season as the fallback. */
export function toneForCelebration(
  category: LiturgicalCategory | undefined,
  season: LiturgicalSeason,
): BlockTone {
  return (category && categoryTones[category]) || seasonTones[season]
}

/** A rotating jewel palette for cover-card rows so an art-less row stays varied. */
export const paletteTones: BlockTone[] = [burgundy, marian, green, gold, violet, rose, ink, red]

export function toneByIndex(i: number): BlockTone {
  return paletteTones[i % paletteTones.length]
}
