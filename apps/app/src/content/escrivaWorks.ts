/**
 * Curated catalog of St. Josemaría Escrivá's works, sourced live from the
 * official escriva.org API. The texts are © Fundación Studium / Opus Dei and are
 * never persisted into Hearth — this descriptor is baked into the app (the
 * bibliography is fixed) and drives both the runtime catalog entries and the
 * St. Josemaría Escrivá collection. See content/escrivaCatalog.ts.
 *
 * Each work maps an Ember book id to its per-language escriva.org book id +
 * `book_group` (which selects the API endpoint family — see lib/escriva.ts).
 */

import type { EscrivaBookGroup } from '@/lib/escriva'
import type { CollectionItemManifest } from './manifestTypes'
import type { LocalizedText } from './types'

export const escrivaProducerId = 'producer/escriva'
export const escrivaHomepage = 'https://escriva.org'

/** Hash prefixes for synthetic catalog entries (never hit Hearth/store). */
export const escrivaBookHashPrefix = 'escriva:book:'
export const escrivaCollectionHash = 'escriva:collection:josemaria-escriva'

export const escrivaCollectionId = 'collection/josemaria-escriva'

export const escrivaAuthor: LocalizedText = {
  'en-US': 'St. Josemaría Escrivá',
  'pt-BR': 'São Josemaria Escrivá',
}

/** A single escriva.org book in one language. */
type EscrivaLangSource = {
  /** escriva.org site id: 1 = English, 6 = Portuguese (Brazil). */
  siteId: number
  /** escriva.org book id within that site. */
  bookId: number
  group: EscrivaBookGroup
}

export type EscrivaWork = {
  /** Bare Ember id; the catalog ref is `book/${slug}`. */
  slug: string
  name: LocalizedText
  description?: LocalizedText
  /** Per app-language source on escriva.org. Determines which languages exist. */
  sources: Partial<Record<'en-US' | 'pt-BR', EscrivaLangSource>>
}

const en = (bookId: number, group: EscrivaBookGroup): EscrivaLangSource => ({
  siteId: 1,
  bookId,
  group,
})
const pt = (bookId: number, group: EscrivaBookGroup): EscrivaLangSource => ({
  siteId: 6,
  bookId,
  group,
})

export const escrivaWorks: EscrivaWork[] = [
  {
    slug: 'escriva-the-way',
    name: { 'en-US': 'The Way', 'pt-BR': 'Caminho' },
    description: {
      'en-US':
        '999 points on the interior life — the most widely read of Escrivá’s works, a school of prayer, work, and divine filiation.',
      'pt-BR':
        '999 pontos sobre a vida interior — a mais lida das obras de Escrivá, uma escola de oração, trabalho e filiação divina.',
    },
    sources: { 'en-US': en(12, 'base'), 'pt-BR': pt(15, 'base') },
  },
  {
    slug: 'escriva-furrow',
    name: { 'en-US': 'Furrow', 'pt-BR': 'Sulco' },
    description: {
      'en-US': 'A sequel to The Way — 1,000 points furrowing the soul for an apostolic harvest.',
      'pt-BR':
        'Continuação de Caminho — 1.000 pontos que sulcam a alma para uma colheita apostólica.',
    },
    sources: { 'en-US': en(35, 'base'), 'pt-BR': pt(38, 'base') },
  },
  {
    slug: 'escriva-the-forge',
    name: { 'en-US': 'The Forge', 'pt-BR': 'Forja' },
    description: {
      'en-US': 'The third book of points — the soul forged in the fire of the love of God.',
      'pt-BR': 'O terceiro livro de pontos — a alma forjada no fogo do amor de Deus.',
    },
    sources: { 'en-US': en(56, 'base'), 'pt-BR': pt(61, 'base') },
  },
  {
    slug: 'escriva-christ-is-passing-by',
    name: { 'en-US': 'Christ Is Passing By', 'pt-BR': 'É Cristo que Passa' },
    description: {
      'en-US': 'Eighteen homilies on the liturgical year and the Christian’s calling in the world.',
      'pt-BR': 'Dezoito homilias sobre o ano litúrgico e a vocação do cristão no mundo.',
    },
    sources: { 'en-US': en(96, 'base'), 'pt-BR': pt(103, 'base') },
  },
  {
    slug: 'escriva-friends-of-god',
    name: { 'en-US': 'Friends of God', 'pt-BR': 'Amigos de Deus' },
    description: {
      'en-US': 'Eighteen homilies on the human virtues, work, and friendship with God.',
      'pt-BR': 'Dezoito homilias sobre as virtudes humanas, o trabalho e a amizade com Deus.',
    },
    sources: { 'en-US': en(85, 'base'), 'pt-BR': pt(92, 'base') },
  },
  {
    slug: 'escriva-in-love-with-the-church',
    name: { 'en-US': 'In Love with the Church', 'pt-BR': 'Amar a Igreja' },
    description: {
      'en-US': 'Homilies on loyalty to and love for the Church and her supernatural mission.',
      'pt-BR': 'Homilias sobre a fidelidade e o amor à Igreja e à sua missão sobrenatural.',
    },
    sources: { 'en-US': en(115, 'base') },
  },
  {
    slug: 'escriva-conversations',
    name: {
      'en-US': 'Conversations',
      'pt-BR': 'Entrevistas com Mons. Josemaria Escrivá',
    },
    description: {
      'en-US':
        'Interviews and the homily “Passionately Loving the World” — Escrivá on Opus Dei and lay holiness.',
      'pt-BR':
        'Entrevistas e a homilia “Amar o mundo apaixonadamente” — Escrivá sobre o Opus Dei e a santidade dos leigos.',
    },
    sources: { 'en-US': en(135, 'base'), 'pt-BR': pt(128, 'base') },
  },
  {
    slug: 'escriva-in-dialogue-with-the-lord',
    name: { 'pt-BR': 'Em Diálogo com o Senhor' },
    description: {
      'pt-BR': 'Textos de oração de Escrivá, em diálogo confiante com o Senhor.',
    },
    sources: { 'pt-BR': pt(505, 'base') },
  },
  {
    slug: 'escriva-holy-rosary',
    name: { 'en-US': 'Holy Rosary', 'pt-BR': 'Santo Rosário' },
    description: {
      'en-US': 'Escrivá’s contemplative guide through the mysteries — “to become little.”',
      'pt-BR': 'O guia contemplativo de Escrivá pelos mistérios — “fazer-se pequenino”.',
    },
    sources: { 'en-US': en(119, 'one-level'), 'pt-BR': pt(118, 'one-level') },
  },
  {
    slug: 'escriva-the-way-of-the-cross',
    name: { 'en-US': 'The Way of the Cross', 'pt-BR': 'Via Sacra' },
    description: {
      'en-US': 'Fourteen stations with points for meditation, walking the road to Calvary.',
      'pt-BR': 'Catorze estações com pontos de meditação, percorrendo o caminho do Calvário.',
    },
    sources: { 'en-US': en(126, 'one-level'), 'pt-BR': pt(122, 'one-level') },
  },
  {
    slug: 'escriva-letters-1',
    name: { 'pt-BR': 'Cartas (I)' },
    description: { 'pt-BR': 'Cartas pastorais de São Josemaria — primeiro volume.' },
    sources: { 'pt-BR': pt(461, 'cartas') },
  },
  {
    slug: 'escriva-letters-2',
    name: { 'pt-BR': 'Cartas (II)' },
    description: { 'pt-BR': 'Cartas pastorais de São Josemaria — segundo volume.' },
    sources: { 'pt-BR': pt(462, 'cartas') },
  },
  {
    slug: 'escriva-letter-29',
    name: { 'pt-BR': 'Carta 29' },
    description: { 'pt-BR': 'Carta pastoral de São Josemaria.' },
    sources: { 'pt-BR': pt(510, 'cartas') },
  },
]

export function escrivaWorkBySlug(slug: string): EscrivaWork | undefined {
  return escrivaWorks.find((w) => w.slug === slug)
}

export function escrivaWorkLanguages(work: EscrivaWork): string[] {
  return Object.keys(work.sources)
}

const t = (enText: string, ptText: string): LocalizedText => ({ 'en-US': enText, 'pt-BR': ptText })

const collectionSection = (
  id: string,
  title: LocalizedText,
  description: LocalizedText,
  slugs: string[],
) => ({
  id,
  title,
  description: { body: description },
  blocks: slugs.map((slug) => ({ kind: 'item' as const, ref: `book/${slug}` })),
})

/**
 * The St. Josemaría Escrivá collection — a curated reading index over the works
 * above. Registered at runtime alongside the books (never built into Hearth), so
 * its refs always resolve against the same runtime catalog layer.
 */
export const escrivaCollection: CollectionItemManifest = {
  id: escrivaCollectionId,
  version: '1',
  name: t('St. Josemaría Escrivá', 'São Josemaria Escrivá'),
  description: t(
    'The founder of Opus Dei on sanctifying ordinary life — points, homilies, and conversations on prayer, work, and divine filiation.',
    'O fundador do Opus Dei sobre a santificação da vida ordinária — pontos, homilias e entrevistas sobre oração, trabalho e filiação divina.',
  ),
  icon: 'reading',
  languages: ['en-US', 'pt-BR'],
  tags: ['opus-dei', 'spirituality', 'homilies'],
  defaults: { autoSeed: false },
  prologue: {
    body: t(
      'Josemaría Escrivá (1902–1975) taught that the workshop, the office, and the home are paths to holiness — that there is something holy, something divine, hidden in the most ordinary situations. These are his works, read live from escriva.org. Read a point a day; let them work on you slowly.',
      'Josemaria Escrivá (1902–1975) ensinou que a oficina, o escritório e o lar são caminhos de santidade — que há algo de santo, algo de divino, escondido nas situações mais comuns. Estas são as suas obras, lidas ao vivo de escriva.org. Leia um ponto por dia; deixe que trabalhem em você devagar.',
    ),
  },
  sections: [
    collectionSection(
      'points',
      t('The Points', 'Os Pontos'),
      t(
        'Short, pointed maxims for meditation — the trilogy that opens the interior life.',
        'Máximas breves e incisivas para a meditação — a trilogia que abre a vida interior.',
      ),
      ['escriva-the-way', 'escriva-furrow', 'escriva-the-forge'],
    ),
    collectionSection(
      'homilies',
      t('The Homilies', 'As Homilias'),
      t(
        'Sustained meditations on the liturgical year, the virtues, and love for the Church.',
        'Meditações sobre o ano litúrgico, as virtudes e o amor à Igreja.',
      ),
      ['escriva-christ-is-passing-by', 'escriva-friends-of-god', 'escriva-in-love-with-the-church'],
    ),
    collectionSection(
      'conversations',
      t('Conversations & Prayer', 'Entrevistas e Oração'),
      t(
        'Escrivá in his own voice — interviews on Opus Dei, and texts of prayer.',
        'Escrivá em sua própria voz — entrevistas sobre o Opus Dei e textos de oração.',
      ),
      ['escriva-conversations', 'escriva-in-dialogue-with-the-lord'],
    ),
    collectionSection(
      'devotions',
      t('Devotions', 'Devoções'),
      t(
        'Praying the Rosary and the Way of the Cross with the founder.',
        'Rezando o Rosário e a Via Sacra com o fundador.',
      ),
      ['escriva-holy-rosary', 'escriva-the-way-of-the-cross'],
    ),
    collectionSection(
      'letters',
      t('Letters', 'Cartas'),
      t(
        'Pastoral letters on the spirit of the Work.',
        'Cartas pastorais sobre o espírito da Obra.',
      ),
      ['escriva-letters-1', 'escriva-letters-2', 'escriva-letter-29'],
    ),
  ],
}
