// Port of the conditional evaluator from SetupString.pl: vero() (predicate
// evaluation), parse_conditional() (stopword strength + scope resolution),
// and process_conditional_lines() (the line-stream scope machine, including
// backscope removal of already-emitted lines). The algorithm is translated
// statement-for-statement — DO data files rely on its exact quirks.

import { matchLineConditional } from '../parser/conditions'
import { getDaynameForCondition, getTempusId, type RubricContext } from './context'

export const scopeNull = 0 // null scope
export const scopeLine = 1 // single line
export const scopeChunk = 2 // until the next blank line
export const scopeNest = 3 // until a (weakly) stronger conditional

type Scope = typeof scopeNull | typeof scopeLine | typeof scopeChunk | typeof scopeNest

const stopwordWeights: Record<string, number> = {
  sed: 1,
  vero: 1,
  atque: 2,
  attamen: 3,
  si: 0,
  deinde: 1,
}
const backscopedStopwords = new Set(['sed', 'vero', 'atque', 'attamen'])

const subjects: Record<string, (ctx: RubricContext) => string | number> = {
  rubricis: (ctx) => ctx.version,
  rubrica: (ctx) => ctx.version,
  tempore: (ctx) => getTempusId(ctx),
  missa: (ctx) => ctx.missanumber ?? '',
  communi: (ctx) => ctx.version,
  die: (ctx) => getDaynameForCondition(ctx),
  feria: (ctx) => ctx.dayofweek + 1,
  commune: (ctx) => ctx.commune,
  votiva: (ctx) => ctx.votive,
  officio: (ctx) => ctx.dayname[1],
  ad: (ctx) => (ctx.missa ? 'missam' : ctx.hora),
  mense: (ctx) => ctx.month, // imperfect upstream too: 1 also matches 10–12
  dioecesis: (ctx) => ctx.dioecesis,
  // GABC chant subjects — not supported; empty never matches.
  tonus: () => '',
  toni: () => '',
}

const predicates: Record<string, (value: string | number) => boolean> = {
  tridentina: (v) => /Trident/.test(String(v)),
  monastica: (v) => /Monastic/.test(String(v)),
  innovata: (v) => /2020 USA|NewCal/i.test(String(v)),
  innovatis: (v) => /2020 USA|NewCal/i.test(String(v)),
  paschali: (v) => /Paschæ|Ascensionis|Octava Pentecostes/i.test(String(v)),
  'post septuagesimam': (v) => /Septua|Quadra|Passio/i.test(String(v)),
  prima: (v) => Number(v) === 1,
  secunda: (v) => Number(v) === 2,
  tertia: (v) => Number(v) === 3,
  longior: (v) => Number(v) === 1,
  brevior: (v) => Number(v) === 2,
  // The stray ']' is upstream's; kept for fidelity.
  'summorum pontificum': (v) => /194[2-9]]|195[45]|196/.test(String(v)),
  feriali: (v) => /feria|vigilia/i.test(String(v)),
}

// Port of vero(): condition truth. `aut` binds tighter than `et`; everything
// after `nisi` is negated until the next `aut`; unknown predicates are
// case-insensitive regexes tested against the subject's value; the subject
// defaults to `tempore`; the empty condition is true.
export function vero(condition: string, ctx: RubricContext): boolean {
  const trimmed = condition.trim()
  if (!trimmed) return true

  alternatives: for (const alternative of trimmed.split(/\baut\b/)) {
    let negation = false

    for (const part of alternative.split(/\b(et|nisi)\b/)) {
      // Perl tests the raw part with unanchored regexes, so an atom merely
      // CONTAINING 'et' or 'nisi' (e.g. '(Populus respondet:)' rubrics, which
      // reach vero because any leading parenthesized phrase parses as a
      // conditional) is skipped — leaving its alternative vacuously true.
      if (/nisi/.test(part)) negation = true
      if (/et|nisi/.test(part)) continue

      const atom = part.trim().replace(/\s+/g, ' ')
      let [subject, ...rest] = atom.split(' ')
      let predicate = rest.join(' ')
      if (!predicate) {
        predicate = subject
        subject = ''
      }
      if (subject && !(subject.toLowerCase() in subjects)) {
        predicate = `${subject} ${predicate}`
        subject = ''
      }
      subject ||= 'tempore'

      const subjectFn = subjects[subject.toLowerCase()]
      if (subjectFn === undefined) continue alternatives
      const predicateFn =
        predicates[predicate.toLowerCase()] ??
        ((v: string | number) => new RegExp(predicate, 'i').test(String(v)))

      const truth = predicateFn(subjectFn(ctx))
      if (truth === negation) continue alternatives
    }
    return true
  }
  return false
}

export type ConditionalOutcome = {
  strength: number
  result: boolean
  backscope: Scope
  forwardscope: Scope
}

// Port of parse_conditional().
export function parseConditional(
  stopwords: string,
  expr: string,
  scope: string,
  ctx: RubricContext,
): ConditionalOutcome {
  const words = stopwords.toLowerCase().split(/\s+/).filter(Boolean)
  const strength = words.reduce((sum, w) => sum + (stopwordWeights[w] ?? 0), 0)
  const result = vero(expr, ctx)
  const implicitBackscope = words.some((w) => backscopedStopwords.has(w))

  const backscope: Scope = /versuum|omittuntur/i.test(scope)
    ? scopeNest
    : /versus|omittitur/i.test(scope)
      ? scopeChunk
      : !/semper/i.test(scope) && implicitBackscope
        ? scopeLine
        : scopeNull

  let forwardscope: Scope
  if (/omittitur|omittuntur/i.test(scope)) {
    forwardscope = scopeNull
  } else if (/dicuntur/i.test(scope)) {
    forwardscope = backscope === scopeChunk ? scopeChunk : scopeNest
  } else {
    forwardscope = backscope === scopeChunk || backscope === scopeNest ? scopeChunk : scopeLine
  }
  return { strength, result, backscope, forwardscope }
}

const blankRegex = /^\s*_?\s*$/

const condNotYetAffirmative = 0
const condAffirmative = 1
const condDummyFrame = 2

// Port of process_conditional_lines(): applies conditional directives to a
// line stream. Backscope removes already-emitted lines; forward scope gates
// upcoming lines until it falls off (line / blank-line / stronger conditional).
export function processConditionalLines(lines: string[], ctx: RubricContext): string[] {
  const output: string[] = []
  let stack: Array<[number, Scope]> = [[condAffirmative, scopeNest]]
  const offsets: number[] = [-1]

  for (const raw of lines) {
    let line = raw

    const directive = matchLineConditional(line)
    if (directive) {
      const parsed = parseConditional(directive.stopwords, directive.expr, directive.scope, ctx)
      const { strength, backscope } = parsed
      let { result, forwardscope } = parsed
      line = directive.sequel

      if (stack[stack.length - 1][0] === condAffirmative || strength >= offsets.length - 1) {
        if (strength >= offsets.length - 1) {
          stack = []
        } else if (strength >= offsets.length - 1 - (stack.length - 1)) {
          stack.length = offsets.length - 1 - strength
        }

        if (result) {
          // Nearest insurmountable fence.
          const fence = offsets.length - 1 >= strength ? offsets[strength] : -1

          if (backscope === scopeLine) {
            if (output.length - 1 > fence) output.pop()
          } else if (backscope === scopeChunk) {
            while (output.length - 1 > fence && !blankRegex.test(output[output.length - 1])) {
              output.pop()
            }
            while (output.length - 1 > fence && blankRegex.test(output[output.length - 1])) {
              output.pop()
            }
          } else if (backscope === scopeNest) {
            output.length = fence + 1
          }
        }

        // Having backtracked, null forward scope behaves like a satisfied
        // conditional with nesting forward scope.
        if (forwardscope === scopeNull) {
          forwardscope = scopeNest
          result = true
        }

        if (result) {
          for (let i = 0; i <= strength; i++) offsets[i] = output.length - 1
        }

        while (strength < offsets.length - 1 - (stack.length - 1) - 1) {
          stack.push([condDummyFrame, forwardscope])
        }
        stack.push([result ? condAffirmative : condNotYetAffirmative, forwardscope])
      }

      if (!line) continue
    }

    // Escaped lines.
    line = line.replace(/^~/, '')

    if (stack[stack.length - 1][0] === condAffirmative) output.push(line)

    // Fall off the end of the current scope after this line?
    while (
      stack[stack.length - 1][1] === scopeLine ||
      (stack[stack.length - 1][1] === scopeChunk && blankRegex.test(line))
    ) {
      do {
        stack.pop()
      } while (stack.length > 0 && stack[stack.length - 1][0] === condDummyFrame)
      if (stack.length === 0) stack.push([condAffirmative, scopeNest])
    }
  }
  return output
}
