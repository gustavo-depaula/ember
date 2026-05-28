/**
 * Maps a liturgical-calendar `entry.id` to a saint-art id in
 * `features/saints/data/saints.ts`. The two id schemes diverge (the calendar
 * uses `st-therese-of-lisieux`, the art set uses `therese`), so this is the
 * bridge that lets the Saint-of-the-Day block show a holy card. Days whose
 * principal celebration isn't here fall back to a solid liturgical-color block —
 * extend this as more saint art is sourced.
 */
export const saintArtMap: Record<string, string> = {
  'st-therese-of-lisieux': 'therese',
  'st-joseph-spouse-of-bvm': 'joseph',
  'st-joseph-the-worker': 'joseph',
  'sts-michael-gabriel-raphael': 'michael_archangel',
  'st-gabriel-of-our-lady-of-sorrows': 'gabriel_archangel',
  'st-john-of-the-cross': 'john_of_the_cross',
  'st-teresa-of-avila': 'teresa',
  'st-philomena': 'philomena',
  'st-luke-the-evangelist': 'luke',
  'st-john-apostle-evangelist': 'john_evangelist',
  'sts-peter-and-paul': 'peter',
  'chair-of-st-peter-at-rome': 'peter',
  'our-lady-of-fatima': 'fatima',
  'holy-innocents': 'holy_innocents',
}
