import type { ImageSource } from 'expo-image'
import { hearthUrl } from '@/lib/hearth'

/**
 * App-side art map: a content id (book/collection id, or a feature key) → a
 * public-domain painting in the corpus's static `art/` tree. Kept app-side (not
 * in the catalog hint) so blocks render without a manifest fetch. Sourced as
 * PD-Art into `content/art/` (published by the deploy workflow) and resolved via
 * `hearthUrl` so it loads from the **local dev hearth** in dev and the remote
 * corpus in production. Ids without an entry fall back to a solid liturgical
 * block. Attribution lives in `content/art/CREDITS.md`.
 */
const artFiles: Record<string, string> = {
  // Populated by scripts/fetch-explore-art.mjs (id → filename under art/).
  'collection/marian': 'marian.jpg',
  'collection/sacred-heart': 'sacred-heart.jpg',
  'collection/eucharistic': 'eucharistic.jpg',
  'collection/holy-spirit': 'holy-spirit.jpg',
  'collection/way-of-the-cross': 'way-of-the-cross.jpg',
  'collection/for-the-dead': 'for-the-dead.jpg',
  'collection/divine-mercy': 'divine-mercy.jpg',
  'collection/carmelite': 'carmelite.jpg',
  'collection/spiritual-classics': 'spiritual-classics.jpg',
  'collection/mental-prayer': 'mental-prayer.jpg',
  'collection/alphonsus-liguori': 'alphonsus-liguori.jpg',
  'collection/montfort-spirituality': 'montfort.jpg',
  'collection/novenas': 'novenas.jpg',
  'collection/litanies': 'litanies.jpg',

  // Plan-of-life templates. Marian-consecration and sacred-heart reuse the
  // collection paintings; the rest have their own (fetched as tpl-*.jpg).
  'plan-of-life-template/beginner-minimum': 'tpl-beginner-minimum.jpg',
  'plan-of-life-template/salesian': 'tpl-salesian.jpg',
  'plan-of-life-template/opus-dei': 'tpl-opus-dei.jpg',
  'plan-of-life-template/ignatian': 'tpl-ignatian.jpg',
  'plan-of-life-template/little-way': 'tpl-little-way.jpg',
  'plan-of-life-template/marian-consecration': 'marian.jpg',
  'plan-of-life-template/sacred-heart': 'sacred-heart.jpg',
  'plan-of-life-template/divine-mercy': 'divine-mercy.jpg',
  // Second wave. Carmelite reuses St Teresa; legion-of-mary reuses the Marian
  // Immaculate Conception.
  'plan-of-life-template/carmelite': 'carmelite.jpg',
  'plan-of-life-template/dominican': 'tpl-dominican.jpg',
  'plan-of-life-template/franciscan': 'tpl-franciscan.jpg',
  'plan-of-life-template/benedictine': 'tpl-benedictine.jpg',
  'plan-of-life-template/cursillo': 'tpl-cursillo.jpg',
  'plan-of-life-template/legion-of-mary': 'marian.jpg',
  'plan-of-life-template/sulpician': 'tpl-sulpician.png',
  'plan-of-life-template/byzantine': 'tpl-byzantine.jpg',

  'collection/dies-sunday': 'dies-sunday.jpg',
  'collection/dies-monday': 'dies-monday.jpg',
  'collection/dies-tuesday': 'dies-tuesday.jpg',
  'collection/dies-wednesday': 'dies-wednesday.jpg',
  'collection/dies-thursday': 'dies-thursday.jpg',
  'collection/dies-friday': 'dies-friday.jpg',
  'collection/dies-saturday': 'dies-saturday.jpg',

  // Day-devotion practices reuse their collection's painting as the practice
  // hero — accepted as `practice/...` *or* bare id, since the detail screen
  // reads from `manifest.id` (prefixed) and tile lookups use raw refs.
  'practice/sunday-devotion': 'dies-sunday.jpg',
  'practice/monday-souls': 'dies-monday.jpg',
  'practice/tuesday-angels': 'dies-tuesday.jpg',
  'practice/wednesday-joseph': 'dies-wednesday.jpg',
  'practice/thursday-eucharist': 'dies-thursday.jpg',
  'practice/friday-passion': 'dies-friday.jpg',
  'practice/saturday-mary': 'dies-saturday.jpg',
}

// Bump when a painting is replaced at an existing filename — expo-image caches
// by URL, so the `?v` query busts the stale disk-cached image.
const artVersion = 3

export function artFor(id: string | undefined): ImageSource | undefined {
  if (!id) return undefined
  const file = artFiles[id]
  return file ? { uri: `${hearthUrl(`art/${file}`)}?v=${artVersion}` } : undefined
}
