// One Mass as renderer primitives: the Order of Mass read straight through,
// with the day's proper parts set where the Order marks them. Wherever the
// Missal offers more than one text for a part, the part is a selector.

import type { BilingualText } from '@ember/content-engine'
import {
  blocksIn,
  type Celebration,
  type Doc,
  type Item,
  type Lang,
  type Localized,
  localize,
  type MassPlan,
  type MassRef,
  type Part,
  type PartOption,
} from '@ember/missal'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { type LangPrefs, labelOf, type RenderContext, renderItems } from './render'

export interface MassDocs {
  order: Doc
  eucharisticPrayers: Doc[]
}

type Words = Record<'la' | 'en-US' | 'pt-BR', string>

const words = {
  proper: { la: 'Proprium', 'en-US': 'Proper', 'pt-BR': 'Próprio' },
  ofTheDay: { la: 'De die', 'en-US': 'Of the day', 'pt-BR': 'Do dia' },
  or: { la: 'Vel', 'en-US': 'Or', 'pt-BR': 'Ou' },
  short: { la: 'Forma brevior', 'en-US': 'Short form', 'pt-BR': 'Forma breve' },
  long: { la: 'Forma longior', 'en-US': 'Long form', 'pt-BR': 'Forma longa' },
  preface: { la: 'Præfatio', 'en-US': 'Preface', 'pt-BR': 'Prefácio' },
  eucharisticPrayer: {
    la: 'Prex eucharistica',
    'en-US': 'Eucharistic Prayer',
    'pt-BR': 'Oração Eucarística',
  },
  penitentialAct: {
    la: 'Actus pænitentialis',
    'en-US': 'Penitential Act',
    'pt-BR': 'Ato penitencial',
  },
  creed: { la: 'Symbolum', 'en-US': 'Creed', 'pt-BR': 'Profissão de fé' },
  nicene: { la: 'Nicænum', 'en-US': 'Nicene', 'pt-BR': 'Niceno-constantinopolitano' },
  apostles: { la: 'Apostolorum', 'en-US': "Apostles'", 'pt-BR': 'Apostólico' },
  sprinkling: {
    la: 'Aspersio aquæ benedictæ',
    'en-US': 'Blessing and sprinkling of water',
    'pt-BR': 'Bênção e aspersão da água',
  },
  bishop: {
    la: 'Benedictio pontificalis',
    'en-US': "Bishop's blessing",
    'pt-BR': 'Bênção do Bispo',
  },
  form: { la: 'Formula', 'en-US': 'Form', 'pt-BR': 'Fórmula' },
  sequenceOptional: {
    la: 'Sequentia (ad libitum)',
    'en-US': 'Sequence (optional)',
    'pt-BR': 'Sequência (facultativa)',
  },
} satisfies Record<string, Words>

const partWords: Record<Part, Words> = {
  title: { la: 'Missa', 'en-US': 'Mass', 'pt-BR': 'Missa' },
  entranceAntiphon: {
    la: 'Antiphona ad introitum',
    'en-US': 'Entrance Antiphon',
    'pt-BR': 'Antífona da entrada',
  },
  gloria: { la: 'Gloria', 'en-US': 'Gloria', 'pt-BR': 'Glória' },
  collect: { la: 'Collecta', 'en-US': 'Collect', 'pt-BR': 'Coleta' },
  firstReading: { la: 'Lectio I', 'en-US': 'First Reading', 'pt-BR': 'Primeira Leitura' },
  psalm: {
    la: 'Psalmus responsorius',
    'en-US': 'Responsorial Psalm',
    'pt-BR': 'Salmo responsorial',
  },
  secondReading: { la: 'Lectio II', 'en-US': 'Second Reading', 'pt-BR': 'Segunda Leitura' },
  sequence: { la: 'Sequentia', 'en-US': 'Sequence', 'pt-BR': 'Sequência' },
  acclamation: {
    la: 'Versus ante Evangelium',
    'en-US': 'Gospel Acclamation',
    'pt-BR': 'Aclamação ao Evangelho',
  },
  gospel: { la: 'Evangelium', 'en-US': 'Gospel', 'pt-BR': 'Evangelho' },
  creed: { la: 'Symbolum', 'en-US': 'Creed', 'pt-BR': 'Profissão de fé' },
  beforeUniversalPrayer: {
    la: 'Oratio universalis',
    'en-US': 'Universal Prayer',
    'pt-BR': 'Oração universal',
  },
  prayerOverOfferings: {
    la: 'Super oblata',
    'en-US': 'Prayer over the Offerings',
    'pt-BR': 'Sobre as oferendas',
  },
  preface: { la: 'Præfatio', 'en-US': 'Preface', 'pt-BR': 'Prefácio' },
  eucharisticPrayer: {
    la: 'Prex eucharistica',
    'en-US': 'Eucharistic Prayer',
    'pt-BR': 'Oração Eucarística',
  },
  communionAntiphon: {
    la: 'Antiphona ad communionem',
    'en-US': 'Communion Antiphon',
    'pt-BR': 'Antífona da comunhão',
  },
  postcommunion: {
    la: 'Post communionem',
    'en-US': 'Prayer after Communion',
    'pt-BR': 'Depois da comunhão',
  },
  prayerOverPeople: {
    la: 'Oratio super populum',
    'en-US': 'Prayer over the People',
    'pt-BR': 'Oração sobre o povo',
  },
}

const massWords: Record<string, Words> = {
  vigil: { la: 'in Vigilia', 'en-US': 'Vigil', 'pt-BR': 'Vigília' },
  night: { la: 'in nocte', 'en-US': 'At night', 'pt-BR': 'Noite' },
  dawn: { la: 'in aurora', 'en-US': 'At dawn', 'pt-BR': 'Aurora' },
  day: { la: 'in die', 'en-US': 'During the day', 'pt-BR': 'Dia' },
  chrism: { la: 'Missa chrismatis', 'en-US': 'Chrism Mass', 'pt-BR': 'Missa do Crisma' },
  evening: {
    la: 'in Cena Domini',
    'en-US': "Evening Mass of the Lord's Supper",
    'pt-BR': 'Ceia do Senhor',
  },
}

function word(w: Words, lang: Lang): string {
  return lang === 'la' || lang === 'pt-BR' ? w[lang] : w['en-US']
}

const say = (w: Words, lang: LangPrefs): BilingualText => ({ primary: word(w, lang.primary) })

const titleText = (
  title: Localized | undefined,
  lang: LangPrefs,
  fallback: string,
): BilingualText => ({
  primary: tidyTitle(localize(title, lang.primary) ?? fallback),
})

const smallWords = new Set(
  'a o e de da do das dos em no na nos nas para com ou of the and in on for at to or et in ad pro cum'.split(
    ' ',
  ),
)

// Upstream sets solemnities and prefaces in capitals; a chip reads better in
// sentence case. Roman numerals keep theirs.
function tidyTitle(text: string): string {
  return text
    .split(' — ')
    .map((part) => {
      const letters = part.replace(/[^\p{L}]/gu, '')
      if (letters.length < 4 || letters !== letters.toUpperCase()) return part
      return part
        .toLowerCase()
        .replace(/(^|[\s(])(\p{L}+)/gu, (_, lead, w) =>
          lead && smallWords.has(w) ? lead + w : lead + w[0].toUpperCase() + w.slice(1),
        )
        .replace(/\b[ivx]+\b/giu, (numeral) => numeral.toUpperCase())
    })
    .join(' — ')
}

function select(
  label: BilingualText,
  overrideKey: string,
  options: ContainerOption[],
  pickerStyle?: 'chips' | 'cards',
): Primitive[] {
  if (options.length === 0) return []
  if (options.length === 1) return options[0].children
  return [
    {
      type: 'container',
      behavior: {
        kind: 'select',
        label,
        overrideKey,
        selectedId: options[0].id,
        ...(pickerStyle ? { pickerStyle } : {}),
        options,
      },
    },
  ]
}

const collapsible = (title: BilingualText, children: Primitive[]): Primitive => ({
  type: 'container',
  behavior: { kind: 'collapsible', title, defaultOpen: false },
  children,
})

// The alternatives inside one source's text for a part: upstream shows one of
// several ("or", short and long forms) at a time.
function alternatives(
  items: Item[],
): { option: number; label: 'or' | 'short' | 'long'; items: Item[] }[] {
  const group = items.find((i) => i.alt)?.alt?.group
  if (group === undefined) return []
  const options = [
    ...new Set(items.filter((i) => i.alt?.group === group).map((i) => i.alt?.option as number)),
  ]
  const labels = options.map(
    (option) => items.find((i) => i.alt?.option === option)?.alt?.label ?? 'or',
  )
  // "Long" only means something beside "short"; any other pairing is a plain choice.
  const forms = labels.includes('short') && labels.includes('long')
  return options.map((option, n) => ({
    option,
    label: forms ? labels[n] : 'or',
    items: items.filter((i) => i.alt?.group !== group || i.alt?.option === option),
  }))
}

function sourceLabel(option: PartOption, lang: LangPrefs, ownDay: boolean): BilingualText {
  if (option.source === 'common') {
    // A saint may draw on several Masses of one common; the subtitle tells them apart.
    const title = titleText(option.title, lang, option.from).primary
    const which = localize(option.subtitle, lang.primary)
    return { primary: which ? `${title} · ${which}` : title }
  }
  if (option.source === 'tempore' && !ownDay) return say(words.ofTheDay, lang)
  return say(words.proper, lang)
}

function partOptions(
  options: PartOption[],
  ctx: RenderContext,
  ownDay: boolean,
): ContainerOption[] {
  return options.flatMap((option) => {
    const source = sourceLabel(option, ctx.lang, ownDay)
    const alts = alternatives(option.items)
    if (alts.length === 0) {
      return [{ id: option.from, label: source, children: renderItems(option.items, ctx) }]
    }
    return alts.map((alt, i) => {
      const name =
        alt.label === 'or'
          ? `${word(words.or, ctx.lang.primary)} ${i + 1}`
          : word(words[alt.label], ctx.lang.primary)
      const label = options.length > 1 ? `${source.primary} · ${name}` : name
      return {
        id: `${option.from}#${alt.option}`,
        label: { primary: label },
        children: renderItems(alt.items, ctx),
      }
    })
  })
}

function partBlock(part: Part, plan: MassPlan, ctx: RenderContext): Primitive[] {
  const options = plan.parts[part]
  if (!options) return []
  const ownDay = plan.celebration.kind === 'tempore'
  const label =
    part === 'sequence' && plan.sequence && !plan.sequence.required
      ? say(words.sequenceOptional, ctx.lang)
      : (labelOf(options[0].items, ctx) ?? say(partWords[part], ctx.lang))
  const built = partOptions(options, ctx, ownDay)
  // A lone optional sequence has no selector to carry its label.
  const lead: Primitive[] =
    part === 'sequence' && built.length === 1 && !plan.sequence?.required
      ? [{ type: 'rubric', text: label }]
      : []
  return [...lead, ...select(label, `missal.${part}`, built)]
}

// The line under a saint's title that points to the commons it draws on.
function isLinkList(items: Item[]): boolean {
  return items.some((item) =>
    Object.values(item.text ?? {}).some((blocks) =>
      blocks.some((b) =>
        b.lines.some((line) => line.some((seg) => typeof seg !== 'string' && seg.m === 'link')),
      ),
    ),
  )
}

// A Eucharistic Prayer with a preface of its own carries the dialogue, that
// preface and the Sanctus before its body; the Order of Mass already has the
// dialogue and the Sanctus.
function splitEucharisticPrayer(doc: Doc): { preface: Item[]; body: Item[] } {
  const lastOfPreface = doc.items.findLastIndex((item) => item.tags?.includes('preface'))
  if (lastOfPreface < 0) return { preface: [], body: doc.items }
  const firstOfPreface = doc.items.findIndex((item) => item.tags?.includes('preface'))
  return {
    preface: doc.items.slice(firstOfPreface, lastOfPreface + 1),
    // The heading and opening rubric, then everything after the Sanctus.
    body: [...doc.items.slice(0, firstOfPreface - 1), ...doc.items.slice(lastOfPreface + 2)],
  }
}

function prefaceBlock(plan: MassPlan, docs: MassDocs, ctx: RenderContext): Primitive[] {
  const options: ContainerOption[] = []
  const printed = plan.parts.preface?.[0]
  if (printed) {
    options.push({
      id: printed.from,
      label: say(words.proper, ctx.lang),
      children: renderItems(printed.items, ctx),
    })
  }
  // A preface upstream has in another language only (Spain's extra Marian
  // prefaces) is no choice for this reader.
  for (const preface of plan.prefaces) {
    const title = preface.title ?? {}
    if (!(title[ctx.lang.primary] ?? title['*'] ?? title.la)) continue
    options.push({
      id: preface.id,
      label: titleText(preface.title, ctx.lang, preface.id),
      // Its title is on the card.
      children: renderItems(preface.items, ctx).filter((p) => p.type !== 'heading'),
    })
  }
  for (const prayer of docs.eucharisticPrayers) {
    const { preface } = splitEucharisticPrayer(prayer)
    if (preface.length === 0) continue
    options.push({
      id: `${prayer.id}#preface`,
      label: {
        primary: `${word(words.preface, ctx.lang.primary)} · ${titleText(prayer.title, ctx.lang, prayer.id).primary}`,
      },
      children: renderItems(preface, ctx),
    })
  }
  return select(
    say(words.preface, ctx.lang),
    'missal.preface',
    options,
    options.length > 3 ? 'cards' : 'chips',
  )
}

function eucharisticPrayerBlock(plan: MassPlan, docs: MassDocs, ctx: RenderContext): Primitive[] {
  // Sundays and feasts default to the third prayer, weekdays to the second.
  const preferred =
    plan.celebration.precedence <= 8 ? 'eucharistic-prayer.3' : 'eucharistic-prayer.2'
  const ordered = [...docs.eucharisticPrayers].sort(
    (a, b) => Number(b.id === preferred) - Number(a.id === preferred),
  )
  const options = ordered.map((prayer) => ({
    id: prayer.id,
    label: titleText(prayer.title, ctx.lang, prayer.id),
    children: renderItems(splitEucharisticPrayer(prayer).body, ctx),
  }))
  return select(
    say(words.eucharisticPrayer, ctx.lang),
    'missal.eucharistic-prayer',
    options,
    'cards',
  )
}

// A weekday of Ordinary Time prays the Sunday's formulary; its name is the
// day's own, which the calendar takes from the lectionary.
function massTitle(plan: MassPlan, celebration: Celebration, mass: MassRef): Localized | undefined {
  const borrowed = celebration.kind === 'tempore' && mass.formulary !== mass.lectionary
  return borrowed
    ? (celebration.title ?? plan.formulary?.title)
    : (plan.formulary?.title ?? celebration.title)
}

/** The chip for one Mass of the day: the celebration, and which of its Masses when it has several. */
export function massLabel(
  plan: MassPlan,
  celebration: Celebration,
  mass: MassRef,
  many: boolean,
  lang: LangPrefs,
): BilingualText {
  const title = titleText(massTitle(plan, celebration, mass), lang, celebration.id).primary
  const which = many && massWords[mass.key] ? ` · ${word(massWords[mass.key], lang.primary)}` : ''
  return { primary: `${title}${which}` }
}

function banner(plan: MassPlan, lang: LangPrefs): Primitive[] {
  const title = titleText(massTitle(plan, plan.celebration, plan.mass), lang, plan.celebration.id)
  const rank = localize(plan.formulary?.subtitle, lang.primary)
  const out: Primitive[] = [
    {
      type: 'callout',
      variant: 'celebration-banner',
      title,
      color: plan.celebration.color,
      ...(rank ? { rank: { primary: rank } } : {}),
      cycle: { primary: `${plan.day.cycle} · ${plan.day.weekdayCycle}` },
    },
  ]
  return out
}

// What a saint's formulary prints under its title: the biographical note.
function description(plan: MassPlan, ctx: RenderContext): Primitive[] {
  const items = (plan.formulary?.items ?? []).filter((item) => item.part === 'title')
  const notes: Item[] = items.map((item) => ({
    ...item,
    text: Object.fromEntries(
      Object.entries(item.text ?? {}).map(([lang, blocks]) => [
        lang,
        blocks.filter((b) => b.k === 'p' && !isLinkList([{ text: { '*': [b] } }])),
      ]),
    ),
  }))
  return renderItems(notes, ctx).map((p) =>
    p.type === 'text' ? { ...p, style: 'italic' as const } : p,
  )
}

const penitentialForms = ['penitential-act.1', 'penitential-act.2', 'penitential-act.3']
const creedForms = ['creed.nicene', 'creed.apostles']
// The rites a formulary places after the homily are filed before one of these.
const afterHomily = new Set<Part | undefined>([
  'creed',
  'beforeUniversalPrayer',
  'prayerOverOfferings',
])

// Whether an item belongs to one of these named stretches of the rite.
const within = (item: Item, tags: string[]) => tags.some((tag) => item.tags?.includes(tag))

function takeWhile(items: Item[], from: number, test: (item: Item) => boolean): Item[] {
  const taken: Item[] = []
  for (let i = from; i < items.length && test(items[i]); i++) taken.push(items[i])
  return taken
}

// The Order of Mass sets its section titles as fourth-level headings.
function orderItems(items: Item[], ctx: RenderContext): Primitive[] {
  return renderItems(items, ctx).map((p) => {
    if (p.type === 'rubric' && items.length === 1 && isSectionTitle(items[0], ctx.lang.primary)) {
      return { type: 'callout', variant: 'section-marker', title: p.text }
    }
    return p
  })
}

function isSectionTitle(item: Item, lang: Lang): boolean {
  const blocks = blocksIn(item, lang) ?? []
  return blocks.length === 1 && blocks[0].k === 'h4'
}

/** A rite large enough to stand in for the part of the Order it interrupts. */
const replacesOrder = (items: Item[]) => items.length >= 8

export function buildMass(plan: MassPlan, docs: MassDocs, lang: LangPrefs): Primitive[] {
  const ctx: RenderContext = { lang, conditions: new Set(plan.conditions) }
  const out: Primitive[] = [...banner(plan, lang), ...description(plan, ctx)]

  const hasPrayers = (['collect', 'prayerOverOfferings', 'postcommunion'] as Part[]).some(
    (p) => plan.parts[p],
  )
  if (!hasPrayers) {
    // Good Friday: not a Mass. The day's rite is read straight through, with
    // the readings where the Missal puts them.
    out.push(...straightThrough(plan, ctx))
    return [
      {
        type: 'container',
        behavior: { kind: 'color-scope', color: plan.celebration.color },
        children: out,
      },
    ]
  }

  const rites = [...plan.rites]
  const takeRites = (test: (before: Part | undefined) => boolean): Item[] => {
    const taken: Item[] = []
    for (let i = rites.length - 1; i >= 0; i--) {
      if (test(rites[i].before)) taken.unshift(...rites.splice(i, 1)[0].items)
    }
    return taken
  }

  // A procession or blessing before the Collect takes the place of the
  // Order's introductory rites; a rite after the Prayer after Communion takes
  // the place of the blessing and dismissal.
  const opening = takeRites((before) => before === 'entranceAntiphon' || before === 'collect')
  const closing = takeRites((before) => before === undefined)
  const skipIntroduction = replacesOrder(opening)
  const skipConclusion = replacesOrder(closing)
  // The Easter Vigil's formulary begins at the Liturgy of the Eucharist: all
  // that comes before is its own rite.
  const startsAtOfferings = !plan.parts.collect

  const items = docs.order.items
  let reached: Part | undefined
  let i = 0
  if (startsAtOfferings) {
    out.push(...straightThrough(plan, ctx))
    // Its rites have all been read; none is left to place in the Order.
    takeRites(() => true)
    i = items.findIndex((item) => item.tags?.includes('liturgy-of-the-eucharist'))
  }

  while (i < items.length) {
    const item = items[i]

    if (item.mark) {
      const part = item.mark as Part
      reached = part
      i++
      if (part === 'entranceAntiphon') out.push(...renderItems(opening, ctx))
      if (part === 'creed')
        out.push(
          ...renderItems(
            takeRites((before) => afterHomily.has(before)),
            ctx,
          ),
        )
      if (part === 'acclamation') out.push(...partBlock('sequence', plan, ctx))
      if (part === 'preface') out.push(...prefaceBlock(plan, docs, ctx))
      else if (part === 'eucharisticPrayer') out.push(...eucharisticPrayerBlock(plan, docs, ctx))
      else out.push(...partBlock(part, plan, ctx))
      // The Order's own text for a part is its fallback (and, for the preface
      // and the Eucharistic Prayer, upstream's index of them).
      const own = takeWhile(items, i, (next) => next.part === part)
      const reading = part === 'firstReading' || part === 'secondReading' || part === 'gospel'
      const replaced =
        plan.parts[part] || reading || part === 'preface' || part === 'eucharisticPrayer'
      if (!replaced) out.push(...orderItems(own, ctx))
      i += own.length
      // The lectionary carries each reading's closing response; the Order's
      // "All reply" and its response would say it twice, or after a reading
      // the day does not have.
      if (reading && items[i]?.role === 'rubric' && items[i + 1]?.role === 'people') i += 2
      continue
    }

    const skip =
      within(item, ['universal-prayer.index']) ||
      (skipIntroduction && reached === 'entranceAntiphon') ||
      (skipConclusion && reached === 'prayerOverPeople') ||
      (within(item, ['gloria']) && !plan.gloria) ||
      // Without a Creed, its rubrics go too: all that stands between the
      // homily and the Universal Prayer.
      (!plan.creed && reached === 'creed') ||
      (within(item, ['sprinkling.outside-easter']) && plan.day.season === 'easter') ||
      (within(item, ['sprinkling.easter']) && plan.day.season !== 'easter')
    if (skip) {
      i++
      continue
    }

    if (within(item, ['sprinkling'])) {
      const group = takeWhile(items, i, (next) => within(next, ['sprinkling']))
      const shown = group.filter(
        (g) =>
          !within(g, [
            plan.day.season === 'easter' ? 'sprinkling.outside-easter' : 'sprinkling.easter',
          ]),
      )
      out.push(collapsible(say(words.sprinkling, lang), renderItems(shown, ctx)))
      i += group.length
      continue
    }

    if (within(item, penitentialForms)) {
      const group = takeWhile(items, i, (next) => within(next, penitentialForms))
      const options = penitentialForms.map((id, n) => ({
        id,
        label: { primary: `${word(words.form, lang.primary)} ${n + 1}` },
        // Each form opens with its own number, which the chip already shows.
        children: renderItems(group.filter((g) => g.tags?.includes(id)).slice(1), ctx),
      }))
      out.push(...select(say(words.penitentialAct, lang), 'missal.penitential-act', options))
      i += group.length
      continue
    }

    if (within(item, creedForms)) {
      // The two creeds, with the rubric that introduces the second between them.
      const last = items.findLastIndex((next) => within(next, creedForms))
      const group = items.slice(i, last + 1)
      const nicene = group.filter((g) => within(g, ['creed.nicene']))
      const apostles = group.filter((g) => !within(g, ['creed.nicene']))
      out.push(
        ...select(say(words.creed, lang), 'missal.creed', [
          { id: 'nicene', label: say(words.nicene, lang), children: renderItems(nicene, ctx) },
          {
            id: 'apostles',
            label: say(words.apostles, lang),
            children: renderItems(apostles, ctx),
          },
        ]),
      )
      i = last + 1
      continue
    }

    if (within(item, ['bishop-blessing'])) {
      const group = takeWhile(items, i, (next) => within(next, ['bishop-blessing']))
      out.push(collapsible(say(words.bishop, lang), renderItems(group, ctx)))
      i += group.length
      continue
    }

    // The Order's own title: the celebration banner already heads the page.
    if (i > 0 || !blocksIn(item, lang.primary)?.some((b) => b.k === 'h1')) {
      out.push(...orderItems([item], ctx))
    }
    i++
  }

  out.push(...renderItems(closing, ctx))
  return [
    {
      type: 'container',
      behavior: { kind: 'color-scope', color: plan.celebration.color },
      children: out,
    },
  ]
}

const readingOrder: Part[] = [
  'firstReading',
  'psalm',
  'secondReading',
  'sequence',
  'acclamation',
  'gospel',
]

function readingsInOrder(plan: MassPlan, ctx: RenderContext): Primitive[] {
  return readingOrder.flatMap((part) => partBlock(part, plan, ctx))
}

/** Items in order, with each run of alternatives ("or", short and long forms) behind one selector. */
function withAlternatives(items: Item[], ctx: RenderContext): Primitive[] {
  const out: Primitive[] = []
  let i = 0
  while (i < items.length) {
    const group = items[i].alt?.group
    if (group === undefined) {
      out.push(...renderItems([items[i]], ctx))
      i++
      continue
    }
    const run = takeWhile(items, i, (next) => next.alt?.group === group)
    const options = alternatives(run).map((alt, n) => ({
      id: String(alt.option),
      label: {
        primary:
          alt.label === 'or'
            ? `${word(words.or, ctx.lang.primary)} ${n + 1}`
            : word(words[alt.label], ctx.lang.primary),
      },
      children: renderItems(alt.items, ctx),
    }))
    out.push(
      ...select({ primary: word(words.form, ctx.lang.primary) }, `missal.alt.${group}`, options),
    )
    i += run.length
  }
  return out
}

/**
 * A day's own rite read in the Missal's order, up to its first standard part:
 * all of Good Friday, and the Easter Vigil as far as the Liturgy of the
 * Eucharist. The readings stand where the rite marks them.
 */
function straightThrough(plan: MassPlan, ctx: RenderContext): Primitive[] {
  const cycles = new Set<string>([plan.day.cycle, plan.day.weekdayCycle])
  const today = (item: Item) => !item.cycle || cycles.has(item.cycle)
  const out: Primitive[] = []
  let pending: Item[] = []
  let readingsPlaced = false
  const flush = () => {
    out.push(...withAlternatives(pending, ctx))
    pending = []
  }
  for (const item of plan.formulary?.items ?? []) {
    if (item.part === 'title' || !today(item)) continue
    if (item.part) break
    if (item.mark !== 'readings') {
      if (item.text) pending.push(item)
      continue
    }
    flush()
    // The Vigil marks each of its readings; elsewhere one mark stands for all.
    const here = (plan.lectionary?.items ?? []).filter(
      (reading) => item.at && reading.tags?.includes(item.at) && today(reading),
    )
    if (here.length > 0) out.push(...withAlternatives(here, ctx))
    else if (!readingsPlaced) out.push(...readingsInOrder(plan, ctx))
    readingsPlaced = true
  }
  flush()
  if (!readingsPlaced) out.unshift(...readingsInOrder(plan, ctx))
  return out
}
