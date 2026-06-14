// Corpus-backed DoLoader: maps engine paths ('horas/Latin/Sancti/01-25',
// 'Tabulae/Kalendaria/1960', 'missa/missa.setup') onto the do-data dataset
// indexes and fetches the per-file blobs. Dataset manifests are loaded once
// and remembered; file blobs ride the content-addressed blob cache.

import { type DoLoader, memoizedLoader, type ParsedDoFile } from '@ember/divinum-officium'
import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type { DoDataItemManifest } from '@/content/manifestTypes'
import { getJson } from '@/content/store'

const horasDatasets: Record<string, string> = {
  Tempora: 'horas-tempora',
  Sancti: 'horas-sancti',
  Commune: 'horas-commune',
  TemporaM: 'horas-tempora-m',
  SanctiM: 'horas-sancti-m',
  CommuneM: 'horas-commune-m',
  Psalterium: 'horas-psalterium',
  Appendix: 'horas-appendix',
  Regula: 'horas-regula',
  Martyrologium: 'horas-martyrologium',
  Martyrologium1570: 'horas-martyrologium-1570',
  Martyrologium1955R: 'horas-martyrologium-1955r',
  Martyrologium1960: 'horas-martyrologium-1960',
}
const missaDatasets: Record<string, string> = {
  Tempora: 'missa-tempora',
  Sancti: 'missa-sancti',
  Commune: 'missa-commune',
  Ordo: 'missa-ordo',
}
const langCodes: Record<string, string> = {
  Latin: 'la',
  English: 'en-US',
  Portugues: 'pt-BR',
}

type DoRef = { dataset: string; fileId: string; lang?: string }

// Mirrors the dataset routing in scripts/build-corpus.py build_do().
function refFor(path: string): DoRef | undefined {
  const parts = path.split('/')
  if (parts[0] === 'Tabulae') {
    return { dataset: 'tabulae', fileId: parts.slice(1).join('/') }
  }
  if (parts[0] === 'horas' && parts[1] === 'Ordinarium') {
    return { dataset: 'ordinarium', fileId: parts.slice(2).join('/') }
  }
  if (parts.length === 2 && /\.(dialog|setup)$/.test(parts[1])) {
    return { dataset: 'dialog', fileId: parts[1] }
  }
  if ((parts[0] === 'horas' || parts[0] === 'missa') && parts.length >= 4) {
    const datasets = parts[0] === 'horas' ? horasDatasets : missaDatasets
    const dataset = datasets[parts[2]]
    const lang = langCodes[parts[1]]
    if (!dataset || !lang) return undefined
    return { dataset, fileId: parts.slice(3).join('/'), lang }
  }
  return undefined
}

async function datasetIndex(dataset: string): Promise<DoDataItemManifest | undefined> {
  const entry = getEntry(`do-data/${dataset}`)
  if (!entry) return undefined
  return ensureManifestBody<DoDataItemManifest>(entry.hash)
}

export function createCorpusDoLoader(): DoLoader {
  return memoizedLoader({
    async load(path): Promise<ParsedDoFile | undefined> {
      const ref = refFor(path)
      if (!ref) return undefined
      const index = await datasetIndex(ref.dataset)
      if (!index?.files) return undefined
      const fileEntry = index.files[ref.fileId]
      if (!fileEntry) return undefined
      const blobRef = index.localized
        ? (fileEntry as Record<string, { hash: string }>)[ref.lang ?? '']
        : (fileEntry as { hash: string })
      if (!blobRef) return undefined
      return getJson<ParsedDoFile>(blobRef.hash)
    },
    async exists(path) {
      return (await this.load(path)) !== undefined
    },
  })
}
