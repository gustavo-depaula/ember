// iBreviary's Latin hour (the Liturgia Horarum, as `parseHourPage` gives it)
// cut into the slots the Brazilian corpus names its parts by, so each part can
// be read beside its Latin. The cut goes by the red titles the Latin edition
// prints ("Ant. 1", "Psalmus 92 (93)", "LECTIO BREVIS"), never by the words.

import type { Primitive } from '../../../apps/app/src/content/primitives'
import type { LatinSection } from '../../../apps/app/src/sources/loth/pair'

const firstLine = (text: string) => text.split('\n')[0].trim()
const restLines = (text: string) => text.split('\n').slice(1).join(' ').trim()

const roman = /^(I|II|III|IV|V|VI)$/
const psalmTitle = /^(Psalmus|Canticum)\b/
const citation = /^(\(|(?:cf\.\s*)?\d)/i
// A psalm's text, as against the sentence from the New Testament set over it:
// the asterisk of its pointing.
const isStrophe = (p: Primitive) => p.type === 'text' && p.text.primary.includes('*')
const opensTheHour = /^\+?\s*Deus,? in adiutórium/i

/** The sections of a Latin hour, in the order prayed. */
export function latinSections(primitives: Primitive[]): LatinSection[] {
  const out: LatinSection[] = []
  let current: LatinSection | undefined
  // The number of the psalm the psalmody is at, and its title, which a
  // division ("II") of the same psalm carries on.
  let psalm = 0
  let psalmName: { title: string; subtitle?: string } | undefined
  let readings = 0
  // Where an "Ant." without a number belongs: after a psalm, its antiphon
  // again; in the Gospel canticle, before or after it.
  let inCanticle = false
  let inInvitatory = false

  const open = (slot: string, extra: Partial<LatinSection> = {}) => {
    current = { slot, body: [], ...extra }
    out.push(current)
  }
  // A psalm opened by the text after its antiphon, before any title: a
  // rubric in black ("Sequens canticum dicitur cum Allelúia…") may come
  // first, and the title then names this psalm, not the next.
  const untitled = new WeakSet<LatinSection>()

  for (const p of primitives) {
    if (p.type === 'rubric') {
      const text = p.text.primary.trim()
      const head = firstLine(text)
      const upper = head.toUpperCase()
      if (upper === 'AD INVITATORIUM') {
        inInvitatory = true
        open('invitatory')
        continue
      }
      if (/^Omnia supra dicta omittuntur|^Omnia supra dicta omituntur/i.test(head)) {
        inInvitatory = false
        current = undefined
        continue
      }
      if (inInvitatory) {
        current?.body.push(p)
        continue
      }
      if (upper === 'HYMNUS') {
        const name = restLines(text)
        open(/^TE DEUM$/i.test(name) ? 'te-deum' : 'hymn')
        continue
      }
      // A hymn the book offers in place of the first: a second candidate.
      if (current?.slot === 'hymn' && (/^Vel:?$/i.test(head) || /^I{1,2}\. Quando/.test(head))) {
        if (current.body.length > 0) open('hymn')
        continue
      }
      if (upper === 'PSALMODIA' || upper === 'LECTIONES') {
        // An antiphon before the title is the whole psalmody's (a little
        // hour in a season): it stays open for the psalm that follows.
        if (!current?.slot.startsWith('ant-') || current.slot.endsWith('-end')) current = undefined
        continue
      }
      // A Common's alternative ("[Pastores]") stands in place of the one before.
      // After a responsory it brings in the other Common's short reading, and
      // its responsory after.
      if (/^(Vel:\s*)?\[[^\]]+\]$/.test(head) && current) {
        open(current.slot === 'responsory' ? 'reading' : current.slot)
        continue
      }
      // "Ant. 1", "Ant.", and on a memorial "Ant. [Doctores]".
      const ant = /^Ant\.\s*(\d)?\s*(?:\[[^\]]*\])?\s*$/.exec(head)
      if (ant) {
        if (ant[1]) {
          psalm = Number(ant[1])
          open(`ant-${psalm}`)
        } else if (inCanticle) {
          open(current?.slot === 'canticle' ? 'canticle-ant-end' : 'canticle-ant')
        } else if (current?.slot.startsWith('psalm-')) {
          open(`ant-${psalm}-end`)
        } else {
          // Night Prayer's one psalm, whose antiphon has no number.
          psalm += 1
          open(`ant-${psalm}`)
        }
        continue
      }
      if (psalmTitle.test(head) && !/^CANTICUM EVANGELICUM/i.test(head)) {
        psalmName = { title: head, subtitle: restLines(text) || undefined }
        if (current && untitled.has(current) && !current.body.some(isStrophe)) {
          Object.assign(current, psalmName, { body: [] })
          untitled.delete(current)
          continue
        }
        if (!current?.slot.startsWith('ant-') || current.slot.endsWith('-end')) psalm += 1
        open(`psalm-${psalm}`, psalmName)
        continue
      }
      // A division of the psalm before: under its own antiphon, or in a run.
      if (roman.test(head) && psalmName) {
        // Straight under the psalm's title: the number of its first division.
        if (current?.slot.startsWith('psalm-') && !current.body.some(isStrophe)) {
          current.title = `${psalmName.title} ${head}`
          continue
        }
        // Divisions said in a run, with no antiphon between, are one psalm.
        if (current?.slot.startsWith('psalm-')) {
          current.body.push(p)
          continue
        }
        if (!current?.slot.startsWith('ant-') || current.slot.endsWith('-end')) psalm += 1
        open(`psalm-${psalm}`, {
          title: `${psalmName.title} ${head}`,
          subtitle: psalmName.subtitle,
        })
        continue
      }
      if (/^LECTIO BREVIS/i.test(head)) {
        open('reading', { title: restLines(text) || undefined })
        continue
      }
      if (/^LECTIO\b/i.test(head)) {
        readings += 1
        open(`reading-${readings}`)
        continue
      }
      if (/^RESPONSORIUM BREVE/i.test(head)) {
        open('responsory')
        continue
      }
      if (/^RESPONSORIUM\b/i.test(head)) {
        open(`responsory-${readings}`, { title: restLines(text) || undefined })
        continue
      }
      if (/^CANTICUM EVANGELICUM/i.test(head)) {
        inCanticle = true
        open('canticle-title')
        continue
      }
      if (/^(BENEDICTUS|MAGNIFICAT|NUNC DIMITTIS)\b/.test(head)) {
        open('canticle', {
          title: text.split('\n')[1]?.trim(),
          subtitle: text.split('\n')[2]?.trim(),
        })
        continue
      }
      if (/^PRECES/i.test(head)) {
        inCanticle = false
        open('intercessions')
        continue
      }
      if (/^PATER NOSTER/i.test(head)) {
        open('pater')
        continue
      }
      if (/^ORATIO$/i.test(head)) {
        inCanticle = false
        open('prayer')
        continue
      }
      if (/^Antiphonæ finales/i.test(head)) {
        open('marian')
        continue
      }
      // The citation under a reading's title: the reading's own.
      if (current?.slot.startsWith('reading') && !current.title && citation.test(head)) {
        current.title = text.replace(/\s*\n\s*/g, ' ')
        continue
      }
      current?.body.push(p)
      continue
    }

    const said =
      p.type === 'text' ? p.text.primary : p.type === 'verses' ? p.items[0]?.text.primary : ''
    if (p.type === 'verses' && opensTheHour.test(said ?? '')) {
      // Where the Invitatory has opened the hour, this is said in its place.
      inInvitatory = false
      open('intro')
      current?.body.push(p)
      continue
    }
    if (inInvitatory) {
      current?.body.push(p)
      continue
    }
    if (
      p.type === 'text' &&
      /^(Dóminus nos benedícat|Noctem quiétam|Benedicámus Dómino)/.test(said)
    ) {
      open('conclusion')
      current?.body.push(p)
      continue
    }
    if (p.type === 'text' && /^Dóminus vobíscum/.test(said)) {
      open('dismissal')
      continue
    }
    // An antiphon is one text: what follows it is the psalm or the canticle,
    // when the edition sets no title between.
    if (current?.slot.startsWith('ant-') && current.body.length > 0 && p.type === 'text') {
      if (current.slot.endsWith('-end')) current = undefined
      else {
        open(`psalm-${psalm}`, psalmName)
        if (current) untitled.add(current)
      }
    } else if (current?.slot === 'canticle-ant' && current.body.length > 0) {
      open('canticle')
    } else if (current?.slot === 'canticle-ant-end' && current.body.length > 0) {
      current = undefined
    }
    // The verse between the psalmody and the readings.
    if (p.type === 'verses' && current?.slot.endsWith('-end') && current.body.length > 0) {
      open('verse')
    }
    current?.body.push(p)
  }
  return out.filter((section) => section.body.length > 0 || section.slot === 'canticle-title')
}
