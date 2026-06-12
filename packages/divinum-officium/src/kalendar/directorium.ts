// Port of DivinumOfficium::Directorium — the Tabulae tables: version chains
// (data.txt), kalendaria (diff-based on a base version), precomputed annual
// transfers keyed by Sunday letter + Easter date, permanent tempora
// assignments, and the transfered() lookup. Dioecesis support is out of scope
// for v1 (Calendarium Generale only).

import type { DoLoader } from '../loader'
import { geteaster, getSday, leapyear, nextday } from './date'

type VersionData = {
  kalendar: string
  transfer: string
  stransfer: string
  base?: string
  tbase?: string
}

export type Directorium = {
  getFromDirectorium(
    subject: 'kalendar' | 'tempora' | 'transfer' | 'stransfer',
    version: string,
    key: string,
    year: number,
  ): Promise<string>
  transfered(str: string, year: number, version: string): Promise<string>
  dirge(version: string, hora: string, day: number, month: number, year: number): Promise<boolean>
  hymnshift(version: string, day: number, month: number, year: number): Promise<boolean>
  hymnshiftmerge(version: string, day: number, month: number, year: number): Promise<boolean>
}

async function readLines(loader: DoLoader, path: string): Promise<string[]> {
  const file = await loader.load(path)
  if (!file || !('lines' in file)) return []
  return file.lines
}

export async function createDirectorium(loader: DoLoader): Promise<Directorium> {
  const data = new Map<string, VersionData>()
  {
    const lines = await readLines(loader, 'Tabulae/data')
    if (lines.length === 0) throw new Error('cannot load Tabulae/data')
    for (const line of lines.slice(1)) {
      const [ver, kal, tra, str, base, tbase] = line.split(',')
      if (!ver || ver.startsWith('#')) continue
      data.set(ver, {
        kalendar: kal,
        transfer: tra,
        stransfer: str,
        ...(base ? { base } : {}),
        ...(tbase ? { tbase } : {}),
      })
    }
  }

  const cache = new Map<string, Record<string, string>>()

  function versionData(version: string): VersionData {
    const d = data.get(version)
    if (!d) throw new Error(`unknown Divinum Officium version: ${version}`)
    return d
  }

  // Port of load_transfer_file's filters: 1 = Feb 24–Dec, 2 = Jan + Feb 23.
  const janFebRegex = /^(?:Hy|seant)?(?:01|02-[01]|02-2[01239]|dirge1)/
  const janFebRegex2 = /^(?:Hy|seant)?(?:01|02-[01]|02-2[01239]|.*=(01|02-[01]|02-2[0123])|dirge1)/

  async function loadTransferFile(name: string, filter: number, type: string): Promise<string[]> {
    const lines = await readLines(loader, `Tabulae/${type}/${name}`)
    if (filter === 1) return lines.filter((l) => !janFebRegex2.test(l))
    if (filter === 2) return lines.filter((l) => janFebRegex.test(l))
    return lines
  }

  function applyVersionFilter(
    lines: string[],
    versionTableId: string,
    target: Record<string, string>,
  ): void {
    const versionRegex = new RegExp(versionTableId)
    for (const raw of lines) {
      const [line, ver] = raw.split(/\s*;;\s*/)
      if (!line) continue
      if (!ver || versionRegex.test(ver)) {
        const eq = line.indexOf('=')
        if (eq >= 0) target[line.slice(0, eq)] = line.slice(eq + 1)
      }
    }
  }

  async function loadKalendar(version: string): Promise<Record<string, string>> {
    const key = `kalendar:${version}`
    let table = cache.get(key)
    if (table) return table
    table = {}
    const lines = await readLines(loader, `Tabulae/Kalendaria/${versionData(version).kalendar}`)
    if (lines.length === 0) throw new Error(`cannot load kalendar for ${version}`)
    for (const line of lines) {
      if (!line.includes('=')) continue
      // Perl: my ($day, $file) = split(/=/) — only the first field after the
      // key (the file ref); title and rank fields are display-only here.
      const [day, file] = line.split('=')
      table[day] = file ?? ''
    }
    cache.set(key, table)
    return table
  }

  async function loadTempora(version: string): Promise<Record<string, string>> {
    const key = `tempora:${version}`
    let table = cache.get(key)
    if (table) return table
    table = {}
    applyVersionFilter(
      await loadTransferFile('Generale', 0, 'Tempora'),
      versionData(version).transfer,
      table,
    )
    cache.set(key, table)
    return table
  }

  async function loadTransfers(
    version: string,
    year: number,
    type: 'Transfer' | 'Stransfer',
  ): Promise<Record<string, string>> {
    const key = `${type.toLowerCase()}:${version}:${year}`
    let table = cache.get(key)
    if (table) return table
    table = {}

    const isLeap = leapyear(year) ? 1 : 0
    const e = geteaster(year)
    let easter = e.month * 100 + e.day
    const letter = (((easter - 319 + (e.month === 4 ? 1 : 0)) % 7) + 7) % 7
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

    const lines = [
      ...(await loadTransferFile(letters[letter], isLeap, type)),
      ...(await loadTransferFile(String(easter), isLeap, type)),
    ]
    if (isLeap) {
      // Transfers across the leap day, then Jan & Feb from the next year's
      // tables (Perl letters[$letter - 6] wraps via negative indexing).
      lines.push(...(await loadTransferFile(`${easter}bis`, 0, type)))
      easter++
      if (easter === 332) easter = 401
      lines.push(...(await loadTransferFile(letters[(letter + 1) % 7], 2, type)))
      lines.push(...(await loadTransferFile(String(easter), 2, type)))
    }

    const tableId =
      type === 'Transfer' ? versionData(version).transfer : versionData(version).stransfer
    applyVersionFilter(lines, tableId, table)
    cache.set(key, table)
    return table
  }

  async function getFromDirectorium(
    subject: 'kalendar' | 'tempora' | 'transfer' | 'stransfer',
    version: string,
    key: string,
    year: number,
  ): Promise<string> {
    const table =
      subject === 'kalendar'
        ? await loadKalendar(version)
        : subject === 'tempora'
          ? await loadTempora(version)
          : await loadTransfers(version, year, subject === 'transfer' ? 'Transfer' : 'Stransfer')

    if (table[key]) return table[key]
    const base = subject === 'kalendar' ? versionData(version).base : versionData(version).tbase
    if (base) return getFromDirectorium(subject, base, key, year)
    return ''
  }

  // Port of transfered(): destination key when the given office is transferred
  // away from its day this year, else ''.
  async function transfered(input: string, year: number, version: string): Promise<string> {
    const str = input.replace(/Sancti(M|Cist|OP)?\//, '')
    if (!str) return ''
    const folderMatch = /^(.*?\/)/.exec(str)
    const strFolder = folderMatch?.[1] ?? ''

    const strRegex = new RegExp(str, 'i')
    const transfer = await loadTransfers(version, year, 'Transfer')
    for (const [key, val] of Object.entries(transfer)) {
      if (!val) continue
      if (/(dirge|Hy)/i.test(key)) continue
      if (/Tempora/i.test(val) && !/Epi1-0/i.test(val)) continue
      // Perl interpolates these strings into regexes unescaped; keep that.
      if (
        !new RegExp(`^${key}`).test(val) &&
        ((new RegExp(val, 'i').test(str) && val.startsWith(strFolder)) || strRegex.test(val)) &&
        !/v\s*$/i.test(transfer[key])
      ) {
        return key
      }
    }

    const tempora = await loadTempora(version)
    for (const [key, val] of Object.entries(tempora)) {
      if (/dirge/.test(key)) continue
      if (strRegex.test(val) && transfer[key] && !/v\s*$/i.test(transfer[key])) {
        return key
      }
    }

    const tbase = versionData(version).tbase
    return tbase ? transfered(str, year, tbase) : ''
  }

  async function dirge(
    version: string,
    hora: string,
    day: number,
    month: number,
    year: number,
  ): Promise<boolean> {
    if (!/Vespera|Laudes/i.test(hora)) return false
    const sday = /Laudes/i.test(hora) ? getSday(month, day, year) : nextday(month, day, year)
    const dirgeline = [
      await getFromDirectorium('transfer', version, 'dirge1', year),
      await getFromDirectorium('transfer', version, 'dirge2', year),
      await getFromDirectorium('transfer', version, 'dirge3', year),
    ].join(' ')
    return dirgeline.includes(sday)
  }

  // Ports of hymnmerge / hymnshift / hymnshiftmerge (Rule XX.3): the HyMM-DD
  // transfer entry carries 1 (merge), 2 (shift), or 3 (shift+merge).
  async function hymnFlag(version: string, day: number, month: number, year: number) {
    return getFromDirectorium('transfer', version, `Hy${getSday(month, day, year)}`, year)
  }
  async function hymnshift(version: string, day: number, month: number, year: number) {
    return /2/.test(await hymnFlag(version, day, month, year))
  }
  async function hymnshiftmerge(version: string, day: number, month: number, year: number) {
    return /3/.test(await hymnFlag(version, day, month, year))
  }

  return { getFromDirectorium, transfered, dirge, hymnshift, hymnshiftmerge }
}
