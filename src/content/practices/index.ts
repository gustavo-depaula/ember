import { localizeContent } from '@/lib/i18n'
import type { FlowDefinition, PracticeManifest, Variant } from '../types'
import angelusFlow from './angelus/flow.json'
import angelusManifest from './angelus/manifest.json'
import divineMercyFlow from './divine-mercy/flow.json'
import divineMercyManifest from './divine-mercy/manifest.json'
import guardianAngelFlow from './guardian-angel/flow.json'
import guardianAngelManifest from './guardian-angel/manifest.json'
import littleOfficeCompline from './little-office-bvm/flows/compline.json'
import littleOfficeLauds from './little-office-bvm/flows/lauds.json'
import littleOfficeMatins from './little-office-bvm/flows/matins.json'
import littleOfficeNone from './little-office-bvm/flows/none.json'
import littleOfficePrime from './little-office-bvm/flows/prime.json'
import littleOfficeSext from './little-office-bvm/flows/sext.json'
import littleOfficeTerce from './little-office-bvm/flows/terce.json'
import littleOfficeVespers from './little-office-bvm/flows/vespers.json'
import littleOfficeManifest from './little-office-bvm/manifest.json'
import memorareFlow from './memorare/flow.json'
import memorareManifest from './memorare/manifest.json'
import morningOfferingFlow from './morning-offering/flow.json'
import morningOfferingManifest from './morning-offering/manifest.json'
import rosaryFlow from './rosary/flow.json'
import rosaryManifest from './rosary/manifest.json'
import rosaryScriptural from './rosary/variants/scriptural.json'
import rosaryTraditional from './rosary/variants/traditional.json'
import stationsCrossFlow from './stations-cross/flow.json'
import stationsCrossManifest from './stations-cross/manifest.json'
import stationsJpii from './stations-cross/variants/jpii.json'
import stationsScriptural from './stations-cross/variants/scriptural.json'
import stationsTraditional from './stations-cross/variants/traditional.json'

const manifests: Record<string, PracticeManifest> = {
  'morning-offering': morningOfferingManifest as PracticeManifest,
  angelus: angelusManifest as PracticeManifest,
  'guardian-angel': guardianAngelManifest as PracticeManifest,
  memorare: memorareManifest as PracticeManifest,
  rosary: rosaryManifest as PracticeManifest,
  'divine-mercy': divineMercyManifest as PracticeManifest,
  'stations-cross': stationsCrossManifest as PracticeManifest,
  'little-office-bvm': littleOfficeManifest as PracticeManifest,
}

const flows: Record<string, FlowDefinition> = {
  'morning-offering': morningOfferingFlow as FlowDefinition,
  angelus: angelusFlow as FlowDefinition,
  'guardian-angel': guardianAngelFlow as FlowDefinition,
  memorare: memorareFlow as FlowDefinition,
  rosary: rosaryFlow as FlowDefinition,
  'divine-mercy': divineMercyFlow as FlowDefinition,
  'stations-cross': stationsCrossFlow as FlowDefinition,
  'little-office-bvm/matins': littleOfficeMatins as FlowDefinition,
  'little-office-bvm/lauds': littleOfficeLauds as FlowDefinition,
  'little-office-bvm/prime': littleOfficePrime as FlowDefinition,
  'little-office-bvm/terce': littleOfficeTerce as FlowDefinition,
  'little-office-bvm/sext': littleOfficeSext as FlowDefinition,
  'little-office-bvm/none': littleOfficeNone as FlowDefinition,
  'little-office-bvm/vespers': littleOfficeVespers as FlowDefinition,
  'little-office-bvm/compline': littleOfficeCompline as FlowDefinition,
}

const variants: Record<string, Record<string, Variant>> = {
  rosary: {
    traditional: rosaryTraditional as Variant,
    scriptural: rosaryScriptural as Variant,
  },
  'stations-cross': {
    traditional: stationsTraditional as Variant,
    scriptural: stationsScriptural as Variant,
    jpii: stationsJpii as Variant,
  },
}

export function getManifest(id: string): PracticeManifest | undefined {
  return manifests[id]
}

export function getAllManifests(): PracticeManifest[] {
  return Object.values(manifests)
}

export function loadFlow(manifestId: string): FlowDefinition | undefined {
  return flows[manifestId]
}

export function loadHourFlow(manifestId: string, hourId: string): FlowDefinition | undefined {
  return flows[`${manifestId}/${hourId}`]
}

export function loadVariant(manifestId: string, variantId: string): Variant | undefined {
  return variants[manifestId]?.[variantId]
}

export function getDefaultVariant(manifestId: string): Variant | undefined {
  const manifest = manifests[manifestId]
  if (!manifest?.variants?.length) return undefined
  const firstVariantId = manifest.variants[0].id
  return variants[manifestId]?.[firstVariantId]
}

export function getManifestIconKey(manifestId: string): string {
  const map: Record<string, string> = {
    'stations-cross': 'cross',
    'divine-mercy': 'mercy',
    'guardian-angel': 'angel',
    memorare: 'mary',
    'morning-offering': 'sunrise',
    angelus: 'bell',
    rosary: 'rosary',
    'little-office-bvm': 'mary',
  }
  return map[manifestId] ?? 'prayer'
}

export function getManifestCategories(): string[] {
  const cats = new Set<string>()
  for (const m of Object.values(manifests)) {
    for (const c of m.categories) cats.add(c)
  }
  return Array.from(cats).sort()
}

export function getManifestsByCategory(category?: string): PracticeManifest[] {
  const all = Object.values(manifests)
  if (!category) return all
  return all.filter((m) => m.categories.includes(category))
}

export function searchManifests(query: string): PracticeManifest[] {
  const q = query.toLowerCase()
  return Object.values(manifests).filter((m) => {
    if (localizeContent(m.name).toLowerCase().includes(q)) return true
    if (m.tags?.some((t) => t.toLowerCase().includes(q))) return true
    if (m.description && localizeContent(m.description).toLowerCase().includes(q)) return true
    return false
  })
}
