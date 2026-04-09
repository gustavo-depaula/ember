/**
 * Parses Divinum Officium Mass proper files into JSON.
 *
 * Input:  .divinum-officium/web/www/missa/{English,Latin,Portugues}/{Tempora,Sancti}/*.txt
 * Output: src/assets/propers/{tempora,sancti}/*.json
 *
 * Usage: npx tsx scripts/parse-do-propers.ts
 *
 * The DO repo is cloned automatically on first run.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const root = resolve(new URL('.', import.meta.url).pathname, '..')
const doRepo = join(root, '.divinum-officium')

if (!existsSync(doRepo)) {
  console.log('Cloning Divinum Officium repository...')
  execSync(
    'git clone --depth 1 https://github.com/DivinumOfficium/divinum-officium .divinum-officium',
    { cwd: root, stdio: 'inherit' },
  )
}

const doRoot = join(doRepo, 'web', 'www')
const missaRoot = join(doRoot, 'missa')
const horasRoot = join(doRoot, 'horas')
const outputRoot = join(root, '..', '..', 'content', 'propers')

const langs = { English: 'en-US', Latin: 'la', Portugues: 'pt-BR' } as const
type LangKey = keyof typeof langs

// Sections we care about for the 10 proper slots
const massSection = new Set([
  'Introitus',
  'Oratio',
  'Lectio',
  'Graduale',
  'GradualeP',
  'Tractus',
  'Sequentia',
  'Evangelium',
  'Offertorium',
  'Secreta',
  'Communio',
  'Postcommunio',
  'Super populum',
])

// ── Section parser ──

type ParsedSections = Map<string, string[]>

function parseSections(text: string): { sections: ParsedSections; baseRef?: string } {
  const sections: ParsedSections = new Map()
  let currentSection: string | undefined
  let lines: string[] = []
  let baseRef: string | undefined

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '')

    // Whole-file reference at the top (before any section) — e.g. @Tempora/Pent03-0r
    if (currentSection === undefined && line.startsWith('@') && !line.includes('[')) {
      baseRef = line.trim()
      continue
    }

    const sectionMatch = line.match(/^\[(.+?)\]\s*(.*)$/)
    if (sectionMatch) {
      if (currentSection !== undefined) {
        sections.set(currentSection, lines)
      }
      const sectionName = sectionMatch[1]
      const sectionCondition = sectionMatch[2].trim()

      // Skip sections excluded under 1960 rubrics
      if (sectionCondition) {
        // (nisi rubrica 196) = "unless 1960" → skip under 1960
        if (/nisi rubrica\s*196/.test(sectionCondition)) {
          currentSection = undefined
          lines = []
          continue
        }
        // (rubrica 196 aut rubrica 1930) or similar → only include if 1960 is mentioned
        if (
          /rubrica/.test(sectionCondition) &&
          !/rubrica\s*196|rubrica\s*1960|rubrica\s*1955/.test(sectionCondition)
        ) {
          currentSection = undefined
          lines = []
          continue
        }
      }

      currentSection = sectionName
      lines = []
    } else if (currentSection !== undefined) {
      lines.push(line)
    }
  }
  if (currentSection !== undefined) {
    sections.set(currentSection, lines)
  }
  return { sections, baseRef }
}

// ── File loading with caching ──

const fileCache = new Map<string, string>()

function readDoFile(path: string): string | undefined {
  if (fileCache.has(path)) return fileCache.get(path)
  if (!existsSync(path)) return undefined
  const content = readFileSync(path, 'utf-8')
  fileCache.set(path, content)
  return content
}

const sectionsCache = new Map<string, { sections: ParsedSections; baseRef?: string }>()

function loadSections(path: string): ParsedSections | undefined {
  if (sectionsCache.has(path)) return sectionsCache.get(path)!.sections
  const content = readDoFile(path)
  if (!content) return undefined
  const result = parseSections(content)
  sectionsCache.set(path, result)
  return result.sections
}

function loadSectionsWithBase(
  path: string,
): { sections: ParsedSections; baseRef?: string } | undefined {
  if (sectionsCache.has(path)) return sectionsCache.get(path)
  const content = readDoFile(path)
  if (!content) return undefined
  const result = parseSections(content)
  sectionsCache.set(path, result)
  return result
}

// ── Macro/prayer expansion ──

const prayerCache = new Map<string, ParsedSections>()

function loadPrayers(lang: LangKey): ParsedSections {
  if (prayerCache.has(lang)) return prayerCache.get(lang)!
  const path = join(missaRoot, lang, 'Ordo', 'Prayers.txt')
  const result = loadSections(path) ?? new Map()
  prayerCache.set(lang, result)
  return result
}

function expandMacro(macro: string, lang: LangKey): string {
  // $Per Dominum → look up [Per Dominum] in Prayers.txt
  const key = macro
    .replace(/^\$\s*/, '')
    .replace(/\.\s*$/, '')
    .trim()
  const prayers = loadPrayers(lang)
  const lines = prayers.get(key)
  if (!lines) return ''
  return lines.filter((l) => l.trim()).join('\n')
}

function expandAmpersand(ref: string, lang: LangKey): string {
  // &Gloria → look up [Gloria] in Prayers.txt
  const key = ref.replace(/^&/, '').replace(/_/g, ' ').trim()
  if (!key) return ''
  const prayers = loadPrayers(lang)
  const lines = prayers.get(key)
  if (!lines) return ''
  return lines.filter((l) => l.trim()).join('\n')
}

// ── Cross-reference resolution ──

function resolveReference(
  ref: string,
  lang: LangKey,
  visited: Set<string> = new Set(),
  selfSections?: ParsedSections,
  currentSectionName?: string,
): string[] | undefined {
  // Self-reference: @:SectionName → look up in the same file's sections
  if (ref.startsWith('@:') && selfSections) {
    const sectionName = ref.slice(2)
    return selfSections.get(sectionName)
  }
  if (ref.startsWith('@:')) return undefined
  if (visited.size > 20) return undefined
  if (visited.has(ref)) return undefined
  visited.add(ref)

  const match = ref.match(/^@(.+?)(?::(.+))?$/)
  if (!match) return undefined

  const filePart = match[1]
  // If no section specified, use the current section name (contextual reference)
  const sectionName = match[2] ?? currentSectionName

  let filePath: string
  if (filePart.startsWith('Commune/')) {
    // Commune files live in horas/, not missa/
    filePath = join(horasRoot, lang, filePart + '.txt')
    if (!existsSync(filePath)) {
      // Fallback: try missa commune
      filePath = join(missaRoot, lang, filePart + '.txt')
    }
  } else {
    filePath = join(missaRoot, lang, filePart + '.txt')
  }

  const sections = loadSections(filePath)
  if (!sections) return undefined

  if (sectionName) {
    const lines = sections.get(sectionName)
    if (!lines) return undefined
    // Recursively resolve if the section itself is a reference
    if (lines.length === 1 && lines[0].startsWith('@')) {
      return resolveReference(lines[0], lang, visited)
    }
    return lines
  }

  // No section specified — return undefined (we'd need to know which section to extract)
  return undefined
}

// ── Section text processing ──

type ProcessedSection = {
  text: string
  citation?: string
}

// Rubric 1960 = the 1962 Missal (Extraordinary Form).
// Conditionals in DO files select text for different rubrical systems.
// We target rubrica 1960 (also abbreviated as "196").
const rubric1960Re = /rubrica\s*196\b|rubrica\s*1960\b|rubrica\s*1955/

function classifyRubric(line: string): 'include' | 'exclude' | 'skip-line' | undefined {
  if (!/^\(/.test(line)) return undefined

  // "then always said" / "then said" → include what follows
  if (/^\(deinde dic/.test(line)) return 'include'

  // "under 1960, say this" → include
  if (rubric1960Re.test(line) && /dicitur|dicuntur\)/.test(line)) return 'include'

  // "under 1960, omit" or "unless 1960" → exclude what follows
  if (rubric1960Re.test(line) && /omittuntur/.test(line)) return 'exclude'
  if (/nisi rubrica\s*196|nisi rubrica\s*1960|nisi rubrica\s*1955/.test(line)) return 'exclude'

  // "(sed feria..." with rubric conditions → exclude
  if (/^\(sed feria/.test(line)) return 'exclude'

  // "under 1960" alone (variant marker) → include
  if (/^\(sed rubrica\s*196\b/.test(line) && !/omittuntur/.test(line)) return 'include'

  // Other rubric conditionals (not our rubric) → exclude
  if (/^\(.*rubrica|^\(sed |^\(si rubrica/.test(line)) return 'exclude'

  return undefined
}

function processLines(
  rawLines: string[],
  lang: LangKey,
  visited: Set<string> = new Set(),
  selfSections?: ParsedSections,
  currentSectionName?: string,
): ProcessedSection | undefined {
  const textParts: string[] = []
  const citations: string[] = []
  let including = true

  for (const line of rawLines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) continue

    // Handle rubric conditionals as state machine
    const rubricAction = classifyRubric(trimmed)
    if (rubricAction === 'include') {
      including = true
      continue
    }
    if (rubricAction === 'exclude') {
      including = false
      continue
    }

    // If currently excluding, skip content lines
    if (!including) continue

    // Skip rule/rank lines
    if (/^(no Gloria|Credo|Suffr|Prefatio)/.test(trimmed)) continue

    // Cross-reference line
    if (trimmed.startsWith('@')) {
      const resolved = resolveReference(trimmed, lang, visited, selfSections, currentSectionName)
      if (resolved) {
        const sub = processLines(resolved, lang, visited, selfSections, currentSectionName)
        if (sub) {
          textParts.push(sub.text)
          if (sub.citation) citations.push(sub.citation)
        }
      }
      continue
    }

    // $ macro expansion
    if (trimmed.startsWith('$')) {
      const expanded = expandMacro(trimmed, lang)
      if (expanded) textParts.push(expanded)
      continue
    }

    // & reference expansion
    if (trimmed.startsWith('&') && trimmed.length > 1) {
      const expanded = expandAmpersand(trimmed, lang)
      if (expanded) textParts.push(expanded)
      continue
    }

    // Citation line (scripture reference)
    if (trimmed.startsWith('!')) {
      const citation = trimmed.slice(1).trim()
      // Some ! lines are rubric notes like "!Commemoration of..."
      // Only treat as citation if it looks like a scripture reference
      if (/^(Ps|[1-3]?\s?[A-Z][a-z])/.test(citation) || /^\d/.test(citation)) {
        citations.push(citation)
      }
      // Skip the ! line from body text
      continue
    }

    // Paragraph separator
    if (trimmed === '_') {
      textParts.push('')
      continue
    }

    // # alternative title — skip
    if (trimmed.startsWith('#')) continue

    // Regular text line — handle ~ continuation
    const cleaned = trimmed.replace(/~\s*$/, ' ')
    textParts.push(cleaned)
  }

  const text = textParts
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!text) return undefined

  return {
    text,
    citation: citations.length > 0 ? citations[0] : undefined,
  }
}

// ── Prefationes ──

const prefatioCache = new Map<string, ParsedSections>()

function loadPrefationes(lang: LangKey): ParsedSections {
  if (prefatioCache.has(lang)) return prefatioCache.get(lang)!
  const path = join(missaRoot, lang, 'Ordo', 'Prefationes.txt')
  const sections = loadSections(path) ?? new Map()
  prefatioCache.set(lang, sections)
  return sections
}

function getPrefatio(ruleLines: string[], lang: LangKey): ProcessedSection | undefined {
  for (const line of ruleLines) {
    const match = line.match(/^Prefatio=(\w+)/)
    if (match) {
      const key = match[1]
      const prefationes = loadPrefationes(lang)
      const lines = prefationes.get(key)
      if (lines) return processLines(lines, lang)
    }
  }
  return undefined
}

// ── Main file processor ──

type ProperSection = {
  'en-US'?: string
  la?: string
  'pt-BR'?: string
  citation?: string
}

type ProperFile = Record<string, ProperSection>

// For 1962 Missal (rubrica 1960), prefer the `r` variant when it exists.
// e.g., Quad6-4r.txt has the full Holy Thursday Mass; Quad6-4.txt is a stub.
function resolveFilePath(fileId: string, lang: LangKey, category: 'Tempora' | 'Sancti'): string {
  const rPath = join(missaRoot, lang, category, fileId + 'r.txt')
  if (existsSync(rPath)) return rPath
  return join(missaRoot, lang, category, fileId + '.txt')
}

function collectSections(
  fileId: string,
  category: 'Tempora' | 'Sancti',
  lang: LangKey,
  visited: Set<string> = new Set(),
): ParsedSections {
  const key = `${lang}/${category}/${fileId}`
  if (visited.has(key)) return new Map()
  visited.add(key)

  const filePath = resolveFilePath(fileId, lang, category)
  const result = loadSectionsWithBase(filePath)
  if (!result) return new Map()

  // If there's a base reference, load those sections first, then overlay
  let merged: ParsedSections = new Map()
  if (result.baseRef) {
    const baseMatch = result.baseRef.match(/^@(.+)$/)
    if (baseMatch) {
      const baseParts = baseMatch[1].split('/')
      const baseCategory = baseParts[0] as 'Tempora' | 'Sancti'
      const baseId = baseParts.slice(1).join('/')
      merged = collectSections(baseId, baseCategory, lang, visited)
    }
  }

  // Overlay this file's sections on top of base
  for (const [name, lines] of result.sections) {
    merged.set(name, lines)
  }

  return merged
}

function processFile(fileId: string, category: 'Tempora' | 'Sancti'): ProperFile | undefined {
  const result: ProperFile = {}

  for (const [langDir, langCode] of Object.entries(langs)) {
    const sections = collectSections(fileId, category, langDir as LangKey)
    if (sections.size === 0) continue

    for (const sectionName of massSection) {
      let lines = sections.get(sectionName)
      // Fallback: look for named variant (e.g., "Oratio Petri" when "Oratio" is missing)
      if (!lines) {
        for (const [key, val] of sections) {
          if (key.startsWith(sectionName + ' ') && !/Commemoratio/.test(key)) {
            lines = val
            break
          }
        }
      }
      if (!lines) continue

      const processed = processLines(lines, langDir as LangKey, new Set(), sections, sectionName)
      if (!processed) continue

      if (!result[sectionName]) result[sectionName] = {}
      ;(result[sectionName] as Record<string, string>)[langCode] = processed.text
      if (processed.citation && (!result[sectionName].citation || langCode === 'en-US')) {
        result[sectionName].citation = processed.citation
      }
    }

    // Handle Prefatio from [Rule] section
    const ruleLines = sections.get('Rule')
    if (ruleLines) {
      const prefatio = getPrefatio(ruleLines, langDir as LangKey)
      if (prefatio) {
        if (!result.Prefatio) result.Prefatio = {}
        ;(result.Prefatio as Record<string, string>)[langCode] = prefatio.text
      }
    }
  }

  const sectionCount = Object.keys(result).length
  if (sectionCount === 0) return undefined

  return result
}

// ── Output ──

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function getFileIds(category: 'Tempora' | 'Sancti'): string[] {
  // Collect all unique file IDs across all languages
  const ids = new Set<string>()
  for (const langDir of Object.keys(langs)) {
    const dir = join(missaRoot, langDir, category)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.txt')) {
        ids.add(basename(file, '.txt'))
      }
    }
  }

  // Drop `r` variants from the list — they'll be picked up by resolveFileId()
  // when processing the base ID (e.g., Quad6-4r is used when processing Quad6-4)
  const filtered = [...ids].filter((id) => {
    if (!id.endsWith('r')) return true
    const baseId = id.slice(0, -1)
    return !ids.has(baseId) // keep orphan r-files that have no base
  })

  return filtered.sort()
}

// ── Main ──

function main() {
  if (!existsSync(missaRoot)) {
    console.error(
      'Divinum Officium not found. Clone it first:\n' +
        '  git clone --depth 1 https://github.com/DivinumOfficium/divinum-officium .divinum-officium',
    )
    process.exit(1)
  }

  const temporaDir = join(outputRoot, 'tempora')
  const sanctiDir = join(outputRoot, 'sancti')
  ensureDir(temporaDir)
  ensureDir(sanctiDir)

  let temporaCount = 0
  let sanctiCount = 0
  let skipped = 0

  // Process Tempora
  const temporaIds = getFileIds('Tempora')
  console.log(`Processing ${temporaIds.length} Tempora files...`)
  for (const id of temporaIds) {
    const proper = processFile(id, 'Tempora')
    if (proper) {
      writeFileSync(join(temporaDir, id + '.json'), JSON.stringify(proper) + '\n')
      temporaCount++
    } else {
      skipped++
    }
  }

  // Process Sancti
  const sanctiIds = getFileIds('Sancti')
  console.log(`Processing ${sanctiIds.length} Sancti files...`)
  for (const id of sanctiIds) {
    const proper = processFile(id, 'Sancti')
    if (proper) {
      writeFileSync(join(sanctiDir, id + '.json'), JSON.stringify(proper) + '\n')
      sanctiCount++
    } else {
      skipped++
    }
  }

  console.log(`\nDone! Generated:`)
  console.log(`  ${temporaCount} Tempora files → ${temporaDir}`)
  console.log(`  ${sanctiCount} Sancti files → ${sanctiDir}`)
  console.log(`  ${skipped} files skipped (no relevant sections)`)
}

main()
