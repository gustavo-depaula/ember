// The portal's pages as Markdown, for AI assistants and anyone who would rather read plain text:
// `/developers/api.md` beside `/developers/api/`, and `/llms.txt` indexing them. Built from the
// same content modules and OpenAPI document as the HTML pages.
import type { Locale } from '~/lib/locale'
import { type DevDoc, href } from '~/routes'
import { apiPage, exampleUrl, type Operation } from './apiPage'
import { overviewPage } from './overview'
import { constraints, fieldRows, type JsonSchema, typeParts } from './schema'
import { chooser } from './text'

/** The Markdown edition's path: the page's own path with `.md` for its trailing slash. */
export const markdownPath = (locale: Locale, doc: DevDoc) =>
  `${href.developers(locale, doc).replace(/\/$/, '')}.md`

// Links written for the page (`/developers/…`, `#schema-…`) made absolute, since a Markdown file
// is read away from the site.
function absolute(text: string, site: URL, page: string): string {
  return text
    .replace(/\]\(\//g, `](${site.origin}/`)
    .replace(/\]\(#/g, `](${new URL(page, site).href}#`)
}

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const typeText = (schema: JsonSchema, shape = true) =>
  typeParts(schema, { shape })
    .map((p) => p.text)
    .join('')
const fence = (code: string, lang: string) => `\`\`\`${lang}\n${code}\n\`\`\``

function schemaTables(schema: JsonSchema, l: (en: string, pt: string) => string): string {
  return (schema.oneOf ?? [schema])
    .map((variant) => {
      const tag = Object.entries(variant.properties ?? {}).find(([, s]) => s.const !== undefined)
      const rows = fieldRows(variant).map((row) => {
        const notes = [row.schema.description, ...constraints(row.schema)].filter(Boolean)
        return `| \`${row.depth ? `↳ ${row.name}` : row.name}\` | ${cell(typeText(row.schema, false))} | ${row.required ? l('yes', 'sim') : ''} | ${cell(notes.join('; '))} |`
      })
      return [
        tag ? `\`${tag[0]}: ${JSON.stringify(tag[1].const)}\`\n` : '',
        `| ${l('Field', 'Campo')} | ${l('Type', 'Tipo')} | ${l('Required', 'Obrigatório')} | ${l('Notes', 'Notas')} |`,
        '|---|---|---|---|',
        ...rows,
      ].join('\n')
    })
    .join('\n\n')
}

function header(title: string, lede: string, locale: Locale, doc: DevDoc, site: URL): string {
  const l = chooser(locale)
  const other: Locale = locale === 'pt-BR' ? 'en-US' : 'pt-BR'
  return [
    `# ${title}`,
    '',
    `> ${lede}`,
    '',
    l(
      `Web page: ${new URL(href.developers(locale, doc), site).href} · Em português: ${new URL(markdownPath(other, doc), site).href}`,
      `Página web: ${new URL(href.developers(locale, doc), site).href} · In English: ${new URL(markdownPath(other, doc), site).href}`,
    ),
  ].join('\n')
}

function overviewMarkdown(locale: Locale, site: URL): string {
  const page = overviewPage(locale, site)
  const path = href.developers(locale, 'overview')
  const out = [
    header(page.title, page.lede, locale, 'overview', site),
    ...page.doors.map((d) =>
      [
        `## ${d.title}`,
        d.body,
        d.base ? `Base URL: \`${d.base}\`` : '',
        `[${d.cta}](${new URL(markdownPath(locale, d.doc), site).href})`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    ),
    `## ${page.start.title}`,
    page.start.intro,
    fence(page.start.shell, 'sh'),
    ...(page.start.prayer ? [page.start.prayer.intro, fence(page.start.prayer.code, 'js')] : []),
    `## ${page.manners.title}`,
    page.manners.items.map((m) => `- ${m}`).join('\n'),
    `## ${page.licence.title}`,
    page.licence.text,
    `## ${page.sources.title}`,
    page.sources.items.map((s) => `- [${s.path}](${s.url}): ${s.what}`).join('\n'),
  ]
  return absolute(out.join('\n\n'), site, path)
}

function operationMarkdown(
  path: string,
  method: string,
  op: Operation,
  page: ReturnType<typeof apiPage>,
  l: (en: string, pt: string) => string,
): string {
  const params = op.parameters ?? []
  const body = op.requestBody && Object.values(op.requestBody.content)[0]?.schema
  const live = method === 'get' && path !== '/health'
  const example = live
    ? fence(`curl '${exampleUrl(path)}'`, 'sh')
    : page.writeExamples[path] && fence(page.writeExamples[path], 'sh')
  return [
    `### ${method.toUpperCase()} ${path}`,
    `**${op.summary}.**${op.description ? ` ${op.description}` : ''}`,
    params.length
      ? [
          `| ${l('Parameter', 'Parâmetro')} | In | ${l('Type', 'Tipo')} | ${l('Required', 'Obrigatório')} | ${l('Notes', 'Notas')} |`,
          '|---|---|---|---|---|',
          ...params.map((p) => {
            const notes = [p.description, ...constraints(p.schema)].filter(Boolean)
            return `| \`${p.name}\` | ${p.in} | ${cell(typeText(p.schema))} | ${p.required ? l('yes', 'sim') : ''} | ${cell(notes.join('; '))} |`
          }),
        ].join('\n')
      : '',
    body ? `${page.labels.requestBody}:\n\n${schemaTables(body, l)}` : '',
    `${page.labels.responses}:\n\n${Object.entries(op.responses)
      .map(([status, response]) => {
        const schema = response.content && Object.values(response.content)[0]?.schema
        return `- \`${status}\`${schema ? ` \`${typeText(schema)}\`` : ''}: ${response.description}`
      })
      .join('\n')}`,
    example ? `${page.labels.example}:\n\n${example}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

function apiMarkdown(locale: Locale, site: URL): string {
  const l = chooser(locale)
  const page = apiPage(locale)
  const path = href.developers(locale, 'api')
  const out = [
    header(page.title, page.lede, locale, 'api', site),
    `## ${page.basics.title}`,
    page.basics.facts.map((f) => `- **${f.term}:** ${f.text}`).join('\n'),
    ...(page.basics.note ? [page.basics.note] : []),
    `## ${page.schedules.title}`,
    page.schedules.intro,
    page.schedules.expander,
    fence(page.schedules.code, 'js'),
    ...page.schedules.notes,
    ...page.groups.flatMap((group) => [
      group.title ? `## ${group.title}` : `## ${l('Other', 'Outros')}`,
      ...(group.description ? [group.description] : []),
      ...group.operations.map(({ path: p, method, op }) =>
        operationMarkdown(p, method, op, page, l),
      ),
    ]),
    '## Schemas',
    ...Object.entries(page.schemas).map(
      ([name, schema]) => `### ${name}\n\n${schemaTables(schema, l)}`,
    ),
  ]
  return absolute(out.join('\n\n'), site, path)
}

const editions: Partial<Record<DevDoc, (locale: Locale, site: URL) => string>> = {
  overview: overviewMarkdown,
  api: apiMarkdown,
}

export function devMarkdown(doc: DevDoc, locale: Locale, site: URL): string {
  const edition = editions[doc]
  // A guide published without a Markdown edition would leave a hole in /llms.txt: fail the build.
  if (!edition)
    throw new Error(`Developer portal: write a Markdown edition for "${doc}" before publishing it`)
  return `${edition(locale, site).replace(/\n{3,}/g, '\n\n')}\n`
}
