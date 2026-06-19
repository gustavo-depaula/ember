/**
 * Canonical structure of the Catechism of the Catholic Church as a book.
 *
 * The CCC is one document with one logical structure (4 parts → sections →
 * chapters → paragraphs 1–2865); only Vatican's HTML pagination differs by
 * language. We adopt the Portuguese chapter pagination as the canonical TOC —
 * each PT page is one clean chapter whose URL encodes its paragraph range — and
 * resolve the same paragraph ranges to English pages via the static index
 * (see ./enPages). Titles are bilingual; ranges are fully contiguous over
 * §1–2865, so every paragraph maps to exactly one chapter (used for anchors).
 */

import type { TocNode } from '@/content/manifestTypes'
import type { LocalizedText } from '@/content/types'

export const cccPtBase = 'https://www.vatican.va/archive/cathechism_po/index_new/'
export const cccHomepage = 'https://www.vatican.va/archive/ccc/index.htm'

export type CccLeaf = {
  id: string
  title: LocalizedText
  from: number
  to: number
  /** Portuguese page filename (already URL-encoded), resolved against cccPtBase. */
  ptFile: string
}

type RawLeaf = { id: string; en: string; pt: string; from: number; to: number; ptFile: string }
type RawNode = { id: string; en: string; pt: string; children: RawTree[] }
type RawTree = RawLeaf | RawNode

const isLeaf = (n: RawTree): n is RawLeaf => 'from' in n

const leaf = (
  id: string,
  en: string,
  pt: string,
  from: number,
  to: number,
  ptFile: string,
): RawLeaf => ({ id, en, pt, from, to, ptFile })

// Source of truth: the full bilingual tree. Leaves carry paragraph ranges + the
// PT page; parents (parts/sections) are navigational only.
const tree: RawTree[] = [
  leaf('prologue', 'Prologue', 'Prólogo', 1, 25, 'prologo%201-25_po.html'),
  {
    id: 'part-1',
    en: 'Part One: The Profession of Faith',
    pt: 'Primeira Parte: A Profissão da Fé',
    children: [
      {
        id: 'p1-s1',
        en: 'Section One: "I Believe" — "We Believe"',
        pt: 'Primeira Secção: «Eu Creio» — «Nós Cremos»',
        children: [
          leaf(
            'p1s1c1',
            "Man's Capacity for God",
            'O Homem é «Capaz» de Deus',
            26,
            49,
            'p1s1c1_26-49_po.html',
          ),
          leaf(
            'p1s1c2',
            'God Comes to Meet Man',
            'Deus ao Encontro do Homem',
            50,
            141,
            'p1s1c2_50-141_po.html',
          ),
          leaf(
            'p1s1c3',
            "Man's Response to God",
            'A Resposta do Homem a Deus',
            142,
            184,
            'p1s1c3_142-184_po.html',
          ),
        ],
      },
      {
        id: 'p1-s2',
        en: 'Section Two: The Profession of the Christian Faith',
        pt: 'Segunda Secção: A Profissão da Fé Cristã',
        children: [
          leaf('p1s2', 'The Creeds', 'Os Símbolos da Fé', 185, 197, 'p1s2_185-197_po.html'),
          leaf(
            'p1s2c1',
            'I Believe in God the Father',
            'Creio em Deus Pai',
            198,
            421,
            'p1s2c1_198-421_po.html',
          ),
          leaf(
            'p1s2c2',
            'I Believe in Jesus Christ, the Only Son of God',
            'Creio em Jesus Cristo, Filho Único de Deus',
            422,
            682,
            'p1s2cap2_422-682_po.html',
          ),
          leaf(
            'p1s2c3',
            'I Believe in the Holy Spirit',
            'Creio no Espírito Santo',
            683,
            1065,
            'p1s2cap3_683-1065_po.html',
          ),
        ],
      },
    ],
  },
  {
    id: 'part-2',
    en: 'Part Two: The Celebration of the Christian Mystery',
    pt: 'Segunda Parte: A Celebração do Mistério Cristão',
    children: [
      {
        id: 'p2-s1',
        en: 'Section One: The Sacramental Economy',
        pt: 'Primeira Secção: A Economia Sacramental',
        children: [
          leaf(
            'p2s1-intro',
            'Why the Liturgy?',
            'Por que a Liturgia?',
            1066,
            1075,
            'p2s1cap1_1066-1075_po.html',
          ),
          leaf(
            'p2s1c1',
            'The Paschal Mystery in the Age of the Church',
            'O Mistério Pascal no Tempo da Igreja',
            1076,
            1134,
            'p2s1cap1_1076-1134_po.html',
          ),
          leaf(
            'p2s1c2',
            'The Sacramental Celebration of the Paschal Mystery',
            'A Celebração Sacramental do Mistério Pascal',
            1135,
            1209,
            'p2s1cap2_1135-1209_po.html',
          ),
        ],
      },
      {
        id: 'p2-s2',
        en: 'Section Two: The Seven Sacraments of the Church',
        pt: 'Segunda Secção: Os Sete Sacramentos da Igreja',
        children: [
          leaf(
            'p2s2c1',
            'The Sacraments of Christian Initiation',
            'Os Sacramentos da Iniciação Cristã',
            1210,
            1419,
            'p2s2cap1_1210-1419_po.html',
          ),
          leaf(
            'p2s2c2',
            'The Sacraments of Healing',
            'Os Sacramentos de Cura',
            1420,
            1532,
            'p2s2cap1_1420-1532_po.html',
          ),
          leaf(
            'p2s2c3',
            'The Sacraments at the Service of Communion',
            'Os Sacramentos ao Serviço da Comunhão',
            1533,
            1666,
            'p2s2cap3_1533-1666_po.html',
          ),
          leaf(
            'p2s2c4',
            'Other Liturgical Celebrations',
            'Outras Celebrações Litúrgicas',
            1667,
            1690,
            'p2s2cap4_1667-1690_po.html',
          ),
        ],
      },
    ],
  },
  {
    id: 'part-3',
    en: 'Part Three: Life in Christ',
    pt: 'Terceira Parte: A Vida em Cristo',
    children: [
      leaf(
        'p3-intro',
        'Life in Christ: Introduction',
        'A Vida em Cristo: Introdução',
        1691,
        1698,
        'p3-intr_1691-1698_po.html',
      ),
      {
        id: 'p3-s1',
        en: "Section One: Man's Vocation — Life in the Spirit",
        pt: 'Primeira Secção: A Vocação do Homem — a Vida no Espírito',
        children: [
          leaf(
            'p3s1c1',
            'The Dignity of the Human Person',
            'A Dignidade da Pessoa Humana',
            1699,
            1876,
            'p3s1cap1_1699-1876_po.html',
          ),
          leaf(
            'p3s1c2',
            'The Human Community',
            'A Comunidade Humana',
            1877,
            1948,
            'p3s1cap2_1877-1948_po.html',
          ),
          leaf(
            'p3s1c3',
            "God's Salvation: Law and Grace",
            'A Salvação de Deus: a Lei e a Graça',
            1949,
            2051,
            'p3s1cap3_1949-2051_po.html',
          ),
        ],
      },
      {
        id: 'p3-s2',
        en: 'Section Two: The Ten Commandments',
        pt: 'Segunda Secção: Os Dez Mandamentos',
        children: [
          leaf(
            'p3s2-intro',
            'The Ten Commandments: Introduction',
            'Os Dez Mandamentos: Introdução',
            2052,
            2082,
            'p3s2-intr_2052-2082_po.html',
          ),
          leaf(
            'p3s2c1',
            'You Shall Love the Lord Your God',
            'Amarás o Senhor teu Deus',
            2083,
            2195,
            'p3s2cap1_2083-2195_po.html',
          ),
          leaf(
            'p3s2c2',
            'You Shall Love Your Neighbor as Yourself',
            'Amarás o teu Próximo como a ti Mesmo',
            2196,
            2557,
            'p3s2cap2_2196-2557_po.html',
          ),
        ],
      },
    ],
  },
  {
    id: 'part-4',
    en: 'Part Four: Christian Prayer',
    pt: 'Quarta Parte: A Oração Cristã',
    children: [
      {
        id: 'p4-s1',
        en: 'Section One: Prayer in the Christian Life',
        pt: 'Primeira Secção: A Oração na Vida Cristã',
        children: [
          leaf(
            'p4-intro',
            'Prayer in the Christian Life: Introduction',
            'A Oração na Vida Cristã: Introdução',
            2558,
            2565,
            'p4-intr_2558-2565_po.html',
          ),
          leaf(
            'p4s1c1',
            'The Revelation of Prayer',
            'A Revelação da Oração',
            2566,
            2649,
            'p4s1cap1_2566-2649_po.html',
          ),
          leaf(
            'p4s1c2',
            'The Tradition of Prayer',
            'A Tradição da Oração',
            2650,
            2696,
            'p4s1cap2_2650-2696_po.html',
          ),
          leaf(
            'p4s1c3',
            'The Life of Prayer',
            'A Vida de Oração',
            2697,
            2758,
            'p4s1cap3_2697-2758_po.html',
          ),
        ],
      },
      leaf(
        'p4s2',
        "Section Two: The Lord's Prayer — Our Father",
        'Segunda Secção: A Oração do Senhor — Pai-Nosso',
        2759,
        2865,
        'p4s2_2759-2865_po.html',
      ),
    ],
  },
]

function localized(en: string, pt: string): LocalizedText {
  return { 'en-US': en, 'pt-BR': pt }
}

function toTocNode(n: RawTree): TocNode {
  if (isLeaf(n)) {
    return { id: n.id, title: localized(n.en, n.pt), pointRange: { from: n.from, to: n.to } }
  }
  return { id: n.id, title: localized(n.en, n.pt), children: n.children.map(toTocNode) }
}

function collectLeaves(nodes: RawTree[], out: CccLeaf[]): void {
  for (const n of nodes) {
    if (isLeaf(n))
      out.push({ id: n.id, title: localized(n.en, n.pt), from: n.from, to: n.to, ptFile: n.ptFile })
    else collectLeaves(n.children, out)
  }
}

/** The book's TOC (parts/sections/chapters), titles localized. */
export const cccToc: TocNode[] = tree.map(toTocNode)

/** Flat, reading-order list of fetchable chapter leaves. */
export const cccLeaves: CccLeaf[] = (() => {
  const out: CccLeaf[] = []
  collectLeaves(tree, out)
  return out
})()

const leafById = new Map(cccLeaves.map((l) => [l.id, l]))

export function cccLeaf(id: string): CccLeaf | undefined {
  return leafById.get(id)
}

/** Anchor index for the BookEntry: every paragraph + every leaf id → its chapter. */
export function buildCccAnchors(): Record<string, { chapter: string }> {
  const out: Record<string, { chapter: string }> = {}
  for (const l of cccLeaves) {
    out[l.id] = { chapter: l.id }
    for (let n = l.from; n <= l.to; n++) out[String(n)] = { chapter: l.id }
  }
  return out
}

/** Portuguese page URL for a chapter leaf. */
export function ptUrlForChapter(id: string): string | undefined {
  const l = leafById.get(id)
  return l ? `${cccPtBase}${l.ptFile}` : undefined
}
