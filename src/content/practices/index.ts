import type { FlowDefinition, PracticeManifest } from '../types'
import angelusFlow from './angelus/flow.json'
import angelusManifest from './angelus/manifest.json'
import guardianAngelFlow from './guardian-angel/flow.json'
import guardianAngelManifest from './guardian-angel/manifest.json'
import memorareFlow from './memorare/flow.json'
import memorareManifest from './memorare/manifest.json'
import morningOfferingFlow from './morning-offering/flow.json'
import morningOfferingManifest from './morning-offering/manifest.json'

const manifests: Record<string, PracticeManifest> = {
  'morning-offering': morningOfferingManifest as PracticeManifest,
  angelus: angelusManifest as PracticeManifest,
  'guardian-angel': guardianAngelManifest as PracticeManifest,
  memorare: memorareManifest as PracticeManifest,
}

const flows: Record<string, FlowDefinition> = {
  'morning-offering': morningOfferingFlow as FlowDefinition,
  angelus: angelusFlow as FlowDefinition,
  'guardian-angel': guardianAngelFlow as FlowDefinition,
  memorare: memorareFlow as FlowDefinition,
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
