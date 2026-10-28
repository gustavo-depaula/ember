// The flow DSL's reference, read at build from its types (packages/content-engine/src/types.ts)
// and illustrated from the practices and chapters in content/, so the page says what the engine
// accepts today and every example is one the corpus really holds.
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { repoRoot } from '~/platform/paths'

export type Field = { name: string; optional: boolean; type: string; doc?: string }
export type Variant = { fields: Field[]; doc?: string; example?: Example }
export type SectionType = { type: string; variants: Variant[] }
export type Example = { json: string; item: string; source: string }

const typesPath = 'packages/content-engine/src/types.ts'
export const sourceUrl = (path: string) =>
  `https://github.com/gustavo-depaula/ember/blob/main/${path}`

// `//` and `/** */` comments in a span of source, as prose.
function commentsIn(text: string): string | undefined {
  const lines = [...text.matchAll(/\/\/ ?(.*)|\/\*\*?([\s\S]*?)\*\//g)].flatMap(
    ([, line, block]) =>
      line !== undefined ? [line] : block.split('\n').map((l) => l.replace(/^\s*\* ?/, '')),
  )
  const prose = lines.join(' ').replace(/\s+/g, ' ').trim()
  return prose || undefined
}

function fieldsOf(node: ts.TypeLiteralNode, source: string): Field[] {
  return node.members.filter(ts.isPropertySignature).map((member) => ({
    name: member.name.getText(),
    optional: !!member.questionToken,
    type: (member.type?.getText() ?? 'unknown').replace(/\s+/g, ' '),
    doc: commentsIn(source.slice(member.getFullStart(), member.getStart())),
  }))
}

function parseTypes() {
  const source = readFileSync(join(repoRoot, typesPath), 'utf8')
  const file = ts.createSourceFile(typesPath, source, ts.ScriptTarget.Latest, true)
  const aliases = new Map(
    file.statements.filter(ts.isTypeAliasDeclaration).map((d) => [d.name.text, d] as const),
  )
  const alias = (name: string) => {
    const found = aliases.get(name)
    if (!found) throw new Error(`${typesPath} no longer declares ${name}`)
    return found
  }

  // FlowSection = { lang?: string } & ( …one object type per section… )
  const flowSection = alias('FlowSection').type
  const union =
    ts.isIntersectionTypeNode(flowSection) &&
    flowSection.types
      .map((t) => (ts.isParenthesizedTypeNode(t) ? t.type : t))
      .find(ts.isUnionTypeNode)
  if (!union) throw new Error(`${typesPath}: FlowSection is no longer { lang? } & (union)`)

  const sections = new Map<string, Variant[]>()
  union.types.forEach((member, i) => {
    if (!ts.isTypeLiteralNode(member)) return
    const fields = fieldsOf(member, source)
    const typeField = fields.find((f) => f.name === 'type')
    const type = typeField?.type.replace(/^'|'$/g, '')
    if (!type) return
    // A section's comment stands above its `|`, or inside its braces above `type`.
    const before = source.slice(
      i ? union.types[i - 1].end : union.getFullStart(),
      member.getStart(),
    )
    const doc = [commentsIn(before), typeField?.doc].filter(Boolean).join(' ') || undefined
    const variants = sections.get(type) ?? []
    variants.push({ fields: fields.filter((f) => f !== typeField), doc })
    sections.set(type, variants)
  })

  const definition = alias('FlowDefinition').type
  if (!ts.isTypeLiteralNode(definition)) throw new Error(`${typesPath}: FlowDefinition moved`)
  const literal = (name: string) => alias(name).type.getText().replace(/\s+/g, ' ')

  return {
    sections: [...sections].map(([type, variants]) => ({ type, variants })),
    definition: fieldsOf(definition, source),
    localized: {
      LocalizedText: literal('LocalizedText'),
      LocalizedContent: literal('LocalizedContent'),
      PickerStyle: literal('PickerStyle'),
    },
  }
}

type Found = { item: string; file: string; node: Record<string, unknown> }

// The kinds whose items are written in the DSL, by their folder under content/.
const flowKinds = { practice: 'content/practices', chapter: 'content/chapters' }

// Every object with a `type` in the flow files, with the item (`practice/rosary`) it came from.
function flowNodes(): Found[] {
  const out: Found[] = []
  const walk = (value: unknown, item: string, file: string) => {
    if (Array.isArray(value)) for (const v of value) walk(v, item, file)
    else if (value && typeof value === 'object') {
      const node = value as Record<string, unknown>
      if (typeof node.type === 'string') out.push({ item, file, node })
      for (const v of Object.values(node)) walk(v, item, file)
    }
  }
  for (const [kind, folder] of Object.entries(flowKinds)) {
    const root = join(repoRoot, folder)
    for (const slug of readdirSync(root)) {
      for (const entry of readdirSync(join(root, slug), { recursive: true, encoding: 'utf8' })) {
        if (!entry.endsWith('.json') || entry.endsWith('manifest.json')) continue
        const file = join(root, slug, entry)
        walk(JSON.parse(readFileSync(file, 'utf8')), `${kind}/${slug}`, relative(repoRoot, file))
      }
    }
  }
  return out
}

// The variant a node is written in: it has every required field and nothing the variant lacks.
function fits(variant: Variant, node: Record<string, unknown>): boolean {
  const names = new Set(['type', 'lang', ...variant.fields.map((f) => f.name)])
  return (
    Object.keys(node).every((k) => names.has(k)) &&
    variant.fields.every((f) => f.optional || f.name in node)
  )
}

// An example short enough to read: long text cut, long lists cut to their first two.
function trim(value: unknown): unknown {
  if (typeof value === 'string') return value.length > 140 ? `${value.slice(0, 140)}…` : value
  if (Array.isArray(value)) return value.slice(0, 2).map(trim)
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trim(v)]))
  return value
}

// Both languages make a better example than one; among those, the shortest reads quickest.
const exampleScore = (node: Record<string, unknown>) => {
  const json = JSON.stringify(node)
  const bilingual = json.includes('"en-US"') && json.includes('"pt-BR"')
  return (bilingual ? 0 : 1e6) + json.length
}

let cached: ReturnType<typeof build> | undefined

function build() {
  const { sections, definition, localized } = parseTypes()
  const nodes = flowNodes()
  const usage = new Map<string, Set<string>>()
  for (const section of sections) {
    const best: ({ score: number; found: Found } | undefined)[] = []
    for (const found of nodes) {
      if (found.node.type !== section.type) continue
      const variant = section.variants.findIndex((v) => fits(v, found.node))
      if (variant === -1) continue
      usage.set(section.type, (usage.get(section.type) ?? new Set()).add(found.item))
      const score = exampleScore(found.node)
      if (score < (best[variant]?.score ?? Number.POSITIVE_INFINITY))
        best[variant] = { score, found }
    }
    section.variants.forEach((variant, i) => {
      const found = best[i]?.found
      if (!found) return
      variant.example = {
        json: JSON.stringify(trim(found.node), null, 2),
        item: found.item,
        source: found.file,
      }
    })
  }
  return {
    sections: sections.map((s) => ({ ...s, usedBy: usage.get(s.type)?.size ?? 0 })),
    definition,
    localized,
    itemCount: new Set(nodes.map((n) => n.item)).size,
    typesUrl: sourceUrl(typesPath),
  }
}

export function flowReference() {
  cached ??= build()
  return cached
}
