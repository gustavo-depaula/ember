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
