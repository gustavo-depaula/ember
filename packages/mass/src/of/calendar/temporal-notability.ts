/**
 * Which temporal celebrations the display surfaces as "the celebration of the
 * day". The temporal cycle has a Mass every day, but the display only names the
 * solemnities and feasts of the Lord — ordinary Sundays and ferias are conveyed
 * by the season header, not a celebration card.
 *
 * This is purely a *notability* decision (refs + specialDays); the display
 * *names* come from the Mass formulary (the single source of truth for titles),
 * resolved by the UI, not baked here.
 */

/** Temporal formulary refs that are always notable (no `specialDay` of their own). */
const notableRefs = new Set([
  'tempore.solemnity.most-holy-trinity',
  'tempore.solemnity.corpus-christi',
  'tempore.solemnity.sacred-heart-of-jesus',
  'tempore.solemnity.christ-the-king',
  'tempore.christmas.holy-family',
  'tempore.easter.week-2.sunday', // Divine Mercy / Second Sunday of Easter
])

/** `getOfLiturgicalPosition().specialDay` values that are notable (excludes ash-wednesday). */
const notableSpecialDays = new Set([
  'christmas',
  'mary-mother-of-god',
  'epiphany',
  'baptism-of-the-lord',
  'palm-sunday',
  'holy-thursday',
  'good-friday',
  'holy-saturday',
  'easter-sunday',
  'pentecost',
  'ascension',
])

/** Whether a temporal day should be surfaced as a celebration on the display calendar. */
export function isNotableTemporal(ref: string, specialDay: string | undefined): boolean {
  return notableRefs.has(ref) || (specialDay !== undefined && notableSpecialDays.has(specialDay))
}
