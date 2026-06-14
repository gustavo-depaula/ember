/**
 * Maps a resolved celebration `entry.id` to a saint-art id in
 * `features/saints/data/saints.ts`. Since the OF display calendar was unified
 * onto the canonical MR authority, celebration ids are formulary refs
 * (`sanctorale.10-01`), while the art set uses short ids (`therese`) — so this is
 * the bridge that lets the Saint-of-the-Day block show a holy card. Days whose
 * principal celebration isn't here fall back to a solid liturgical-color block —
 * extend this as more saint art is sourced.
 *
 * (St Gabriel of Our Lady of Sorrows and St Philomena have no place in the
 * universal OF calendar, so their cards have no day to attach to.)
 */
export const saintArtMap: Record<string, string> = {
  'sanctorale.10-01': 'therese', // St Thérèse of the Child Jesus
  'sanctorale.03-19': 'joseph', // St Joseph, Spouse of the BVM
  'sanctorale.05-01': 'joseph', // St Joseph the Worker
  'sanctorale.09-29': 'michael_archangel', // Ss Michael, Gabriel and Raphael
  'sanctorale.12-14': 'john_of_the_cross', // St John of the Cross
  'sanctorale.10-15': 'teresa', // St Teresa of Ávila
  'sanctorale.10-18': 'luke', // St Luke the Evangelist
  'sanctorale.12-27': 'john_evangelist', // St John, Apostle and Evangelist
  'sanctorale.06-29': 'peter', // Ss Peter and Paul
  'sanctorale.02-22': 'peter', // Chair of St Peter
  'sanctorale.05-13': 'fatima', // Our Lady of Fátima
  'sanctorale.12-28': 'holy_innocents', // The Holy Innocents
}
