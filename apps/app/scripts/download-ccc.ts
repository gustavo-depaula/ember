import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = join(__dirname, '..', '..', '..', 'content', 'catechism')
mkdirSync(outDir, { recursive: true })

const sourceUrl = 'https://github.com/nossbigg/catechism-ccc-json/releases/download/v0.0.2/ccc.json'

type Element = {
  type: string
  text?: string
  ref_number?: number
  attrs?: Record<string, unknown>
}

type Paragraph = {
  elements: Element[]
  attrs: Record<string, unknown>
}

type PageNode = {
  id: string
  paragraphs: Paragraph[]
}

type TocNode = {
  id: string
  indent_level: number
  text: string
}

type TocTreeNode = {
  id: string
  children: TocTreeNode[]
}

type CccJson = {
  toc_link_tree: TocTreeNode[]
  toc_nodes: Record<string, TocNode>
  page_nodes: Record<string, PageNode>
}

type FlatParagraph = {
  number: number
  text: string
  section: string
  breadcrumb: string[]
}

function extractText(elements: Element[]): string {
  return elements
    .filter((el) => el.type === 'text' && el.text)
    .map((el) => el.text as string)
    .join('')
    .trim()
}

function flattenPages(
  tree: TocTreeNode[],
  tocNodes: Record<string, TocNode>,
  pageNodes: Record<string, PageNode>,
): FlatParagraph[] {
  const result: FlatParagraph[] = []

  function walk(nodes: TocTreeNode[], ancestors: string[]) {
    for (const node of nodes) {
      const tocNode = tocNodes[node.id]
      const pageNode = pageNodes[node.id]
      const sectionName = tocNode?.text ?? node.id
      const breadcrumb = [...ancestors, sectionName]

      if (pageNode) {
        for (const para of pageNode.paragraphs) {
          // Find the CCC paragraph number from ref-ccc elements
          const refEl = para.elements.find((el) => el.type === 'ref-ccc' && el.ref_number)
          if (!refEl?.ref_number) continue

          const text = extractText(para.elements)
          if (!text) continue

          result.push({
            number: refEl.ref_number,
            text,
            section: sectionName,
            breadcrumb,
          })
        }
      }

      if (node.children.length > 0) {
        walk(node.children, breadcrumb)
      }
    }
  }

  walk(tree, [])
  return result
}

async function main() {
  console.log('Downloading Catechism of the Catholic Church...')

  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch CCC: ${res.status}`)
  const data: CccJson = await res.json()

  console.log(`  toc_nodes: ${Object.keys(data.toc_nodes).length}`)
  console.log(`  page_nodes: ${Object.keys(data.page_nodes).length}`)

  const paragraphs = flattenPages(data.toc_link_tree, data.toc_nodes, data.page_nodes)

  // Sort by paragraph number
  paragraphs.sort((a, b) => a.number - b.number)

  // Remove duplicates (same paragraph can appear in multiple sections)
  const seen = new Set<number>()
  const unique = paragraphs.filter((p) => {
    if (seen.has(p.number)) return false
    seen.add(p.number)
    return true
  })

  console.log(`  Extracted ${unique.length} numbered paragraphs`)
  console.log(`  Range: CCC ${unique[0]?.number} - ${unique[unique.length - 1]?.number}`)
  console.log(`  ~${Math.ceil(unique.length / 365)} paragraphs/day for 365-day completion`)

  writeFileSync(join(outDir, 'ccc.json'), JSON.stringify(unique))

  console.log(`\nDone! Saved to src/assets/catechism/ccc.json`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
