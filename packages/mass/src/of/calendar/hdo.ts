/**
 * Holy Days of Obligation for the Ordinary Form — the single canonical source
 * now that the display calendar no longer reads them from the curated
 * `entries.json`. These are the eleven universal HDO the app shipped; the values
 * are liturgical law (canon 1246 §1), not data, so they live in code beside the
 * GIRM precedence table.
 *
 * (Jurisdiction-specific transfers/abrogations — e.g. the US/Brazil moving
 * Epiphany/Ascension/Corpus Christi to a Sunday — are a later refinement; this
 * mirrors the previous flat behaviour exactly.)
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
