// ── Ordinary Form — calendar engine (resolveOfDay over the corpus statics) ──
// The OF Mass is built directly to primitives in the app (`sources/of/`); this
// package owns only the date→celebrations resolution.

export {
  type CelebrationKind,
  type CelebrationMode,
  girm,
  type OfCelebration,
  type OfDay as OfResolvedDay,
  observesTransferred,
  resolveOfDay,
  type Scope,
  sanctoralFor,
  transferredDate,
} from './of/calendar'
