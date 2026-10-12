// Experiment: can a psalm be set to its tone from what the corpus already holds?
//
// A psalm in the Office is sung to the tone of its antiphon: the antiphon's
// mode names the tone, and the notes over its closing `E u o u a e` (the vowels
// of "sæculórum. Amen") name which of the tone's endings. The pointing itself —
// which syllable takes which note — is done by jgabc's psalmtone.js
// (github.com/bbloomf/jgabc, released into the public domain; vendored beside
// this file), the same code breviariumgregorianum.com uses.
//
//   node research/gregobase/psalmody/psalmody.cjs            # how many antiphons name a tone and ending
//   node research/gregobase/psalmody/psalmody.cjs <antiphon file stem> "<verse> * <verse>" …
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../../..')
const propers = path.join(root, 'content/chant-propers')

// psalmtone.js is a browser script of its time: it wants jQuery and timers to
// exist and uses neither for what is asked of it here.
const sandbox = {
  setTimeout: () => 0,
  clearTimeout: () => 0,
  setInterval: () => 0,
  require: () => Object.assign(() => ({}), { ajax() {}, each() {}, extend: Object.assign }),
  exports: {},
  console,
}
vm.createContext(sandbox)
vm.runInContext(fs.readFileSync(path.join(__dirname, 'vendor-psalmtone.js'), 'utf8'), sandbox)
const tones = sandbox.g_tones
const { applyPsalmTone } = sandbox.exports

/** The notes of a score's note groups, letters only: what two transcribers of one ending agree on. */
const groups = (gabc) => [...gabc.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].toLowerCase().replace(/[^a-m]/g, '')).filter(Boolean)

/** A tone's formula without its intonation, which only a psalm's first verse sings. */
function withoutIntonation(formula) {
  const tokens = formula.split(' ')
  return tokens.slice(tokens.findIndex((t) => t.endsWith('r'))).join(' ')
}

/** A tone's endings by name. A tone with one ending (the second, the sixth) has it unnamed. */
const endingsOf = (tone) => tone.terminations ?? { '': tone.termination }

/** The tone and ending an antiphon gives its psalm: { tone, ending } or a reason there is none. */
function toneOf(antiphon) {
  const mode = /^mode: (\w+);/m.exec(antiphon)?.[1]
  // The fourth and sixth tones have a second form each, transposed, with endings of its own.
  const forms = [tones[`${mode}.`], tones[`${mode} alt`]].filter(Boolean)
  if (!forms.length) return { why: `mode ${mode ?? 'unstated'}` }
  // `<eu>E(j) u(j) o(j) u(h) a(j) e.</eu>(g.)`, with or without the tags around it.
  const euouae = /E\([^)]*\)\s*u\([^)]*\)\s*o\([^)]*\)\s*u\([^)]*\)\s*a\([^)]*\)\s*e\.?(?:<\/eu>)?\([^)]*\)/i.exec(antiphon)?.[0]
  if (!euouae) return { why: 'no euouae' }
  const sung = groups(euouae).join(' ')
  for (const tone of forms) {
    for (const [ending, formula] of Object.entries(endingsOf(tone))) {
      const pointed = applyPsalmTone({ text: 'sæculórum. Amen.', gabc: formula, useOpenNotes: false, suffix: true, favor: 'termination' })
      // The six syllables of "sæculórum. Amen" take the ending's last six groups.
      if (groups(pointed).slice(-6).join(' ') === sung) return { mode, ending, tone }
    }
  }
  return { why: `tone ${mode}: ending ${sung} not among its own` }
}

/** Verses (`first half * second half`) as GABC in the antiphon's tone. */
function point(antiphon, verses) {
  const found = toneOf(antiphon)
  if (!found.tone) throw new Error(`no tone: ${found.why}`)
  const { tone, ending } = found
  const lines = verses.map((verse, i) => {
    const [first, second] = verse.split('*').map((half) => half.trim())
    const mediant = i === 0 ? tone.mediant : withoutIntonation(tone.mediant)
    return (
      applyPsalmTone({ text: first, gabc: mediant, useOpenNotes: false, prefix: true, favor: i === 0 ? 'intonation' : '' }) +
      ' *(:) ' +
      applyPsalmTone({ text: second, gabc: endingsOf(tone)[ending], useOpenNotes: false, suffix: true, favor: 'termination' }) +
      ' (::)'
    )
  })
  return `(${tone.clef}) ${lines.join('\n')}\n`
}

if (process.argv.length > 3) {
  const antiphon = fs.readFileSync(path.join(propers, `${process.argv[2]}.gabc`), 'utf8')
  const { mode, ending, why } = toneOf(antiphon)
  console.error(why ? `no tone: ${why}` : `tone ${mode}, ending ${ending}`)
  process.stdout.write(point(antiphon, process.argv.slice(3)))
} else {
  const tally = {}
  let named = 0
  const files = fs.readdirSync(propers).filter((f) => f.startsWith('an-'))
  for (const file of files) {
    const found = toneOf(fs.readFileSync(path.join(propers, file), 'utf8'))
    if (found.tone) named++
    const key = found.tone ? `tone ${found.mode} ${found.ending}` : found.why.replace(/ending .* not/, 'ending not')
    tally[key] = (tally[key] ?? 0) + 1
  }
  console.log(`${files.length} antiphons, ${named} name their psalm's tone and ending`)
  for (const [key, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(5), key)
}
