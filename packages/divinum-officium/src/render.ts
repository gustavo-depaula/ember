// Render-time helpers shared by the Mass and Hours assembly pipelines.

// Port of horascommon.pl::spell_var — version-dependent Latin orthography.
export function spellVar(text: string, version: string): string {
  if (/196/.test(version)) {
    return text
      .replace(/[Jj]/g, (c) => (c === 'J' ? 'I' : 'i'))
      .replace(/H-Iesu/g, 'H-Jesu')
      .replace(/er eúmdem/g, 'er eúndem')
  }
  return text
    .replace(/Génetrix/g, 'Génitrix')
    .replace(/Genetrí/g, 'Genitrí')
    .replace(/\bco(t[ií]d[ií])/g, 'quo$1')
}

// Comma split that respects single-quoted arguments ('1,in-dir').
const scriptArgSplit = /,(?=(?:[^']|'[^']*')*$)/

// Parse a `&function(arg, 'arg', …)` argument string into the values the
// script-function registries receive.
export function parseScriptArgs(argString: string): (string | number)[] {
  const args: (string | number)[] = []
  for (const part of argString.split(scriptArgSplit)) {
    const am = /'(.*)'|(-?\d+)/.exec(part)
    if (am) args.push(am[1] ?? Number(am[2]))
  }
  return args
}

// Strip the engine-internal markers that never render: GABC wait codes,
// {:…:} link blocks, and backtick quotes.
export function cleanItemMarkers(item: string): string {
  return item
    .replace(/wait[0-9]+/gi, '')
    .replace(/\{:[\s\S]*?:\}/g, '')
    .replace(/`/g, '')
}

// Port of webdia.pl::getunit — group the raw assembly stream into the units
// the two-column table pairs: consecutive non-blank entries form one unit; a
// blank entry ends it. This is what keeps the Latin and vernacular columns
// aligned even when one language splits a prayer across many source lines.
export function toUnits(entries: string[]): string[] {
  const units: string[] = []
  let unit = ''
  for (const entry of entries) {
    const line = (entry ?? '').replace(/\s*$/, '')
    if (line && !/^\s+$/.test(line)) {
      unit += `${line}\n`
      continue
    }
    if (!unit) continue
    units.push(unit)
    unit = ''
  }
  if (unit) units.push(unit)
  return units
}

// Port of the resolve-loop continuation merge (horas.pl:117,196): a line
// ending with '~' is joined with the following line into one display line.
export function mergeContinuationLines(text: string): string {
  const out: string[] = []
  let merged = ''
  for (const lineIn of text.split('\n')) {
    let line = lineIn.replace(/\s+$/, '')
    // Perl resolves each line's V./R./r. marker into a glyph or initial
    // BEFORE merging — a marker at the start of a continuation line would
    // otherwise surface mid-sentence.
    if (merged) line = line.replace(/^(?:[VR]\.br\.|[VRvr]\.|Ant\.)\s*/, '')
    if (/~$/.test(line)) {
      merged += `${line.replace(/\s*~$/, '')} `
      continue
    }
    out.push(merged + line)
    merged = ''
  }
  if (merged) out.push(merged.replace(/\s+$/, ''))
  return out.join('\n')
}
