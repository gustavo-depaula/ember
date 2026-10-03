// Holy cards: which cards the user's acts have won, as a pure function of the
// acts, the calendar and the catalog. Nothing here reads storage or the clock.
// The rules are docs/plans/holy-cards.md.

export { drawCard, grants, historyStart, pendingCards, redeem } from './engine'
export type {
  Act,
  Calendar,
  CardId,
  Catalog,
  Copy,
  Door,
  EmberSeason,
  EngineInput,
  Grant,
  IsoDate,
  MonthDay,
  Occurrence,
  Season,
} from './types'
export { type Way, waysToReceive } from './ways'
