import type { RichTextLine } from '@ember/content-engine'
import type { Formulary } from './types'

type LocalizedLines = Record<string, RichTextLine[]>
type LocalizedText = Record<string, string>

type GospelAcclamation = { verse?: LocalizedLines }
type ResponsorialPsalm = {
  responsory?: { primary?: LocalizedLines }
  verses?: Record<string, RichTextLine[][]>
}

/**
 * Normalize formulary readings: some sources emit the reading as
 * `{ text, lines, references }` (DivOff-shaped); the engine's
 * choice-rich-text resolver consumes a `body`-shaped envelope. Slots that
 * already carry `body` are passed through untouched.
 */
export function transformFormularyReadings(formulary: Formulary): Formulary {
  const readings = formulary.readings as Record<string, Record<string, unknown>> | undefined
  if (!readings) return formulary

  const next: Record<string, Record<string, unknown>> = {}
  for (const [cycle, slots] of Object.entries(readings)) {
    next[cycle] = {
      ...slots,
      ...(slots.gospelAcclamation
        ? {
            gospelAcclamation: adaptGospelAcclamation(slots.gospelAcclamation as GospelAcclamation),
          }
        : {}),
      ...(slots.responsorialPsalm
        ? {
            responsorialPsalm: adaptResponsorialPsalm(slots.responsorialPsalm as ResponsorialPsalm),
          }
        : {}),
    }
  }
  return { ...formulary, readings: next }
}

/**
 * `verse[lang]` already carries the call/text/call shape with response
 * segments at the boundaries, so it maps directly onto `body.lines`. The
 * separate `acclamation` field is dropped — it's redundant with the verse's
 * leading response segment for languages that print the refrain inline.
 */
function adaptGospelAcclamation(slot: GospelAcclamation): unknown {
  if (!slot.verse) return slot
  return { ...slot, body: { lines: slot.verse } }
}

/**
 * Maps the refrain onto `summary` (renders as italic burgundy at the top of
 * the slot, the conventional missal antiphon-as-theme placement) and the
 * strophes onto `body.lines`, separated by blank lines so each strophe
 * reads as its own paragraph. `responsory.alternatives[]` is not yet
 * surfaced — rare and needs a separate UI affordance.
 */
function adaptResponsorialPsalm(slot: ResponsorialPsalm): unknown {
  const refrain = slot.responsory?.primary
  const strophesByLang = slot.verses
  if (!refrain || !strophesByLang) return slot

  const summary: LocalizedText = {}
  for (const [lang, lines] of Object.entries(refrain)) {
    summary[lang] = lines.map(segmentsToText).join('\n')
  }

  const lines: LocalizedLines = {}
  for (const [lang, strophes] of Object.entries(strophesByLang)) {
    lines[lang] = strophes.flatMap((s, i) => (i > 0 ? [[], ...s] : s))
  }

  return { ...slot, summary, body: { lines } }
}

function segmentsToText(line: RichTextLine): string {
  return line
    .map((seg) => seg.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
