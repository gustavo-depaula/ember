// ── Ordinary Form — calendar engine (resolveOfDay over the corpus statics) ──
// The OF Mass is built directly to primitives in the app (`sources/of/`); this
// package owns only the date→celebrations resolution.

export {
  buildOfYearCalendar,
  type CelebrationKind,
  type CelebrationMode,
  girm,
  isOfHolyDay,
  type OfCelebration,
  type OfDay as OfResolvedDay,
  type OfYearOptions,
  observesTransferred,
  resolveOfDay,
  type Scope,
  sanctoralFor,
  temporalDisplayTitle,
  transferredDate,
} from './of/calendar'
