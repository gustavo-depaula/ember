import type { FlowDefinition, PracticeManifest, Variant } from '../types'
import angelusFlow from './angelus/flow.json'
import angelusManifest from './angelus/manifest.json'
import divineMercyFlow from './divine-mercy/flow.json'
import divineMercyManifest from './divine-mercy/manifest.json'
import guardianAngelFlow from './guardian-angel/flow.json'
import guardianAngelManifest from './guardian-angel/manifest.json'
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
}

const flows: Record<string, FlowDefinition> = {
  'morning-offering': morningOfferingFlow as FlowDefinition,
  angelus: angelusFlow as FlowDefinition,
  'guardian-angel': guardianAngelFlow as FlowDefinition,
  memorare: memorareFlow as FlowDefinition,
  rosary: rosaryFlow as FlowDefinition,
  'divine-mercy': divineMercyFlow as FlowDefinition,
  'stations-cross': stationsCrossFlow as FlowDefinition,
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

export function loadVariant(manifestId: string, variantId: string): Variant | undefined {
  return variants[manifestId]?.[variantId]
}

export function getDefaultVariant(manifestId: string): Variant | undefined {
  const manifest = manifests[manifestId]
  if (!manifest?.variants?.length) return undefined
  const firstVariantId = manifest.variants[0].id
  return variants[manifestId]?.[firstVariantId]
}
