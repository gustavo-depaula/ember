// Ordinary Form calendar engine: date → celebrations over the corpus statics.
// The OF Mass itself is built to primitives in the app (`sources/of/`).

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
  transferredDate,
} from './of/calendar'
