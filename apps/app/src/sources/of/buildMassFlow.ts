import type { OfCelebration, OfResolvedDay } from '@ember/mass'
import type { MassFormulary, OrderOfMass } from '@ember/missal-schema'
import type { ContainerOption, Primitive } from '@/content/primitives'
import { banner, saintDescription } from './blocks/banner'
import { bt, colorScope, type LangPrefs } from './helpers'
import { type MassContext, renderMass } from './structures/mass'
import { renderSpecial } from './structures/special'

export interface BuildOfMassArgs {
  day: OfResolvedDay
  /** Every formulary the day references (producer pre-fetches the closure). */
  formularies: Record<string, MassFormulary>
  order: OrderOfMass
  lang: LangPrefs
}

/** Render one celebration's body (banner + description + structure dispatch). */
function renderCelebration(c: OfCelebration, args: BuildOfMassArgs): Primitive[] {
  const f = args.formularies[c.ref]
  if (!f) return []
  const out: Primitive[] = [banner(f, args.lang)]
  const desc = saintDescription(f, args.lang)
  if (desc) out.push(desc)

  if (f.structure === 'mass' || f.structure === 'vigil-mass') {
    const orations = f.inheritsOrationsFrom ? (args.formularies[f.inheritsOrationsFrom] ?? f) : f
    // Memorials with no proper readings borrow the day's temporal readings.
    const readingsFormulary = f.readings
      ? f
      : args.day.temporalRef
        ? (args.formularies[args.day.temporalRef] ?? f)
        : f
    const ctx: MassContext = {
      formulary: f,
      orations,
      readingsFormulary,
      order: args.order,
      cycle: args.day.cycle,
      weekdayCycle: args.day.weekdayCycle,
      lang: args.lang,
    }
    out.push(...renderMass(ctx))
  } else {
    out.push(...renderSpecial(f, args.lang))
  }
  return colorScope(f.color, out).children ?? out
}

/**
 * Build the OF Mass flow as final primitives — no engine, no fragments. A
 * celebration picker (when the day offers more than one) wraps each
 * celebration's colour-scoped body. The principal is the default selection.
 */
export function buildOfMassFlow(args: BuildOfMassArgs): Primitive[] {
  const { day, lang } = args
  const celebrations = day.celebrations.filter((c) => args.formularies[c.ref])
  if (celebrations.length === 0) return []

  if (celebrations.length === 1) return renderCelebration(celebrations[0], args)

  const options: ContainerOption[] = celebrations.map((c) => {
    const f = args.formularies[c.ref]
    const label = bt(f?.title ?? c.title, lang) ?? { primary: c.ref }
    return { id: c.ref, label, children: renderCelebration(c, args) }
  })
  return [
    {
      type: 'container',
      behavior: {
        kind: 'select',
        label: bt({ 'pt-BR': 'Celebração', 'en-US': 'Celebration' }, lang) ?? {
          primary: 'Celebração',
        },
        overrideKey: 'of.celebration',
        selectedId: options[0].id,
        options,
      },
    },
  ]
}
