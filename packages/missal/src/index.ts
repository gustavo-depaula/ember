// The Ordinary Form of the Mass: its calendar and the assembly of a day's
// Mass from the corpus in `content/missal/`.

export {
  type Celebration,
  celebrationsOn,
  everyRegion,
  type OfDay,
  type Rank,
  type ResolveOptions,
  regionTransfers,
  resolveOfDay,
  transfersFor,
} from './calendar/resolve'
export {
  addDays,
  easterSunday,
  firstSundayOfAdvent,
  type Season,
  sundayCycle,
  type TemporalDay,
  type TemporalMass,
  type Transfers,
  temporalDay,
  universalTransfers,
  weekdayCycle,
  weekdayNames,
} from './calendar/temporal'
export { buildOfYearCalendar, isNamedDay, isOfHolyDay, type OfYearOptions } from './calendar/year'
export * from './mass'
export * from './text'
export * from './types'
