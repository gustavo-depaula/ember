/**
 * The universal Holy Days of Obligation for the Ordinary Form (canon 1246 §1).
 * Liturgical law, not data, so they live in code beside the GIRM precedence
 * table. Jurisdiction-specific transfers/abrogations (e.g. the US/Brazil moving
 * Epiphany/Ascension/Corpus Christi to a Sunday) are not modelled.
 */

/** Sanctoral HDO, keyed by formulary ref. */
const hdoSanctoralRefs = new Set([
  'sanctorale.03-19', // St Joseph, Spouse of the BVM
  'sanctorale.06-29', // Ss Peter and Paul, Apostles
  'sanctorale.08-15', // Assumption of the BVM
  'sanctorale.11-01', // All Saints
  'sanctorale.12-08', // Immaculate Conception of the BVM
])

/** Temporal HDO, keyed by `getOfLiturgicalPosition().specialDay`. */
const hdoSpecialDays = new Set([
  'christmas',
  'mary-mother-of-god',
  'epiphany',
  'easter-sunday',
  'ascension',
  'pentecost',
])

/** Whether the celebration (sanctoral ref or temporal specialDay) is an HDO. */
export function isOfHolyDay(ref: string, specialDay: string | undefined): boolean {
  if (hdoSanctoralRefs.has(ref)) return true
  return specialDay !== undefined && hdoSpecialDays.has(specialDay)
}
