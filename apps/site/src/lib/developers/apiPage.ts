// The Mass-times API page's prose and examples, read by its page and by its Markdown edition.
// The endpoints themselves come from the OpenAPI document (`openApiDocument`).
import { openApiDocument } from '@ember/api'
import type { Locale } from '~/lib/locale'
import { massTimesApi } from '~/lib/massTimes/data'
import { href } from '~/routes'
import { sourceUrl } from './flowReference'
import type { JsonSchema } from './schema'
import { schemaAnchor } from './schema'
import { chooser } from './text'

export type Parameter = {
  name: string
  in: 'query' | 'path' | 'header'
  required: boolean
  description?: string
  schema: JsonSchema
}
export type Operation = {
  tags?: string[]
  summary: string
  description?: string
  parameters?: Parameter[]
  requestBody?: { content: Record<string, { schema: JsonSchema }> }
  responses: Record<
    string,
    { description: string; content?: Record<string, { schema: JsonSchema }> }
  >
}

const churchId = 'ns-do-carmo-se-sao-paulo-sp'

// What the consoles start filled with: a real church in São Paulo and the streets around it.
const examples: Record<string, Record<string, string>> = {
  '/churches/near': { lat: '-23.5505', lng: '-46.6333', radiusKm: '2', limit: '5' },
  '/churches': { q: 'Carmo', near: '-23.5505,-46.6333', limit: '5' },
  '/churches/index': { limit: '5' },
  '/churches/tiles/{cell}': { cell: '6gyf' },
  '/churches/{id}': { id: churchId },
  '/churches/{id}/verifications': { id: churchId, limit: '5' },
  '/changes': { limit: '5' },
}

/** An endpoint's URL filled with the example values. */
export function exampleUrl(path: string): string {
  const values = examples[path] ?? {}
  const filled = path.replace(/\{(\w+)\}/g, (_, name) => encodeURIComponent(values[name] ?? name))
  const query = Object.entries(values)
    .filter(([name]) => !path.includes(`{${name}}`))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return `${massTimesApi}${filled}${query ? `?${query}` : ''}`
}

export const exampleValue = (path: string, name: string) => examples[path]?.[name]

export const operationSlug = (method: string, path: string) =>
  `${method}${path.replace(/[{}]/g, '').replace(/\//g, '-')}`

export function apiPage(locale: Locale) {
  const l = chooser(locale)
  const spec = openApiDocument(massTimesApi, locale === 'pt-BR' ? 'pt' : 'en')

  // Writes reach the real moderation queue, so they get a command to adapt rather than a console.
  const note = l(
    'From October the Sunday Mass is at 9:30.',
    'A partir de outubro, a Missa de domingo é às 9h30.',
  )
  const writeExamples: Record<string, string> = {
    '/churches/{id}/verify': `curl -X POST '${massTimesApi}/churches/${churchId}/verify' \\
  -H 'Content-Type: application/json' -H 'X-Client-Id: device-7f3a2c' \\
  -d '{}'`,
    '/churches/{id}/corrections': `curl -X POST '${massTimesApi}/churches/${churchId}/corrections' \\
  -H 'Content-Type: application/json' -H 'X-Client-Id: device-7f3a2c' \\
  -d '{"kind": "note", "comment": "${note}"}'`,
    '/churches/{id}/corrections/attachments': `curl -X POST '${massTimesApi}/churches/${churchId}/corrections/attachments' \\
  -H 'Content-Type: image/jpeg' -H 'X-Client-Id: device-7f3a2c' \\
  --data-binary @bulletin.jpg`,
  }

  // Endpoints the site also shows as a page of its own.
  const pageNotes: Record<string, string> = {
    '/changes': l(
      `[Recent changes](${href.massTimesChanges(locale)}) shows the same log as a page.`,
      `[Mudanças recentes](${href.massTimesChanges(locale)}) mostra o mesmo registro numa página.`,
    ),
  }

  const tagOrder = [...spec.tags.map((t) => t.name), undefined]
  const operations = Object.entries(spec.paths as Record<string, Record<string, Operation>>)
    .flatMap(([path, ops]) => Object.entries(ops).map(([method, op]) => ({ path, method, op })))
    .sort((a, b) => tagOrder.indexOf(a.op.tags?.[0]) - tagOrder.indexOf(b.op.tags?.[0]))
  const groups = tagOrder.map((tag) => {
    const meta = spec.tags.find((t) => t.name === tag)
    return {
      tag,
      title: meta?.['x-displayName'],
      description: meta?.description,
      operations: operations.filter((o) => o.op.tags?.[0] === tag),
    }
  })

  const facts = [
    { term: l('Base URL', 'URL base'), text: `\`${massTimesApi}\``, copy: massTimesApi },
    {
      term: 'OpenAPI',
      text: l(
        '[openapi.json](/developers/openapi.json), for Postman, Bruno or a client generator',
        '[openapi.json](/developers/openapi.json), para Postman, Bruno ou um gerador de clientes (em inglês)',
      ),
    },
    {
      term: l('Auth', 'Autenticação'),
      text: l(
        'None. Every route allows any origin, so a web page can call it directly.',
        'Nenhuma. Toda rota aceita qualquer origem, então uma página web pode chamá-la diretamente.',
      ),
    },
    {
      term: 'Cache',
      text: l(
        'Reads are `public, max-age=300`; map tiles an hour, then a day stale while revalidating.',
        'As leituras são `public, max-age=300`; os blocos do mapa, uma hora, e mais um dia servidos enquanto se revalidam.',
      ),
    },
    {
      term: l('Errors', 'Erros'),
      text: l(
        `A missing church is \`404 { "error": "not_found" }\`. A bad parameter is \`400\` with the [validation issues](#${schemaAnchor('ValidationError')}). Too many writes is \`429 { "error": "rate_limited" }\`.`,
        `Uma igreja inexistente é \`404 { "error": "not_found" }\`. Um parâmetro inválido é \`400\` com os [problemas de validação](#${schemaAnchor('ValidationError')}). Escritas demais são \`429 { "error": "rate_limited" }\`.`,
      ),
    },
  ]

  const expandSnippet = `import { expandService } from './expand' // packages/api/src/expand.ts

const church = await (await fetch('${massTimesApi}/churches/${churchId}')).json()
for (const service of church.services.filter((s) => s.kind === 'mass')) {
  for (const { date, startTime } of expandService(service, { count: 3 })) {
    console.log(date.toISOString().slice(0, 10), startTime, service.language)
  }
}`

  return {
    spec,
    groups,
    schemas: spec.components.schemas as Record<string, JsonSchema>,
    writeExamples,
    pageNotes,
    title: l('Mass-times API', 'API de horários de Missa'),
    kicker: l('Developers · Reference', 'Desenvolvedores · Referência'),
    lede: l(
      'A worldwide directory of churches and the times of their Masses, confessions and adoration. Reads are open to anyone; a correction is a suggestion that a person reviews.',
      'Um diretório mundial de igrejas e dos horários de suas Missas, confissões e adoração. As leituras são abertas a todos; uma correção é uma sugestão que uma pessoa revisa.',
    ),
    basics: {
      title: l('Basics', 'O básico'),
      facts,
      note:
        locale === 'pt-BR'
          ? 'As descrições curtas de parâmetros e campos vêm dos schemas no código e estão em inglês.'
          : undefined,
    },
    schedules: {
      title: l('Reading a schedule', 'Lendo os horários'),
      intro: l(
        'A church’s `services` are its recurring times, one pattern at one time each: “Sundays at 9:00” is one service and “Sundays at 11:30” another. `rrule` is an iCalendar rule that picks the days, and `startTime` gives the wall-clock time in the church’s own `timezone`. `exdate` lists cancelled days and `rdate` added ones. The API sends the rules unexpanded, so you compute the next Mass on your side.',
        'Os `services` de uma igreja são seus horários recorrentes, cada um com um padrão e uma hora: “domingos às 9h” é um horário e “domingos às 11h30” é outro. `rrule` é uma regra do iCalendar que escolhe os dias, e `startTime` dá a hora local no `timezone` da própria igreja. `exdate` lista os dias cancelados e `rdate` os acrescentados. A API manda as regras sem expandir, então é você quem calcula a próxima Missa.',
      ),
      expander: l(
        `[expand.ts](${sourceUrl('packages/api/src/expand.ts')}) does this in sixty lines on the [rrule](https://github.com/jkbrzt/rrule) package, and like the rest of Ember’s code it is in the public domain to copy:`,
        `O [expand.ts](${sourceUrl('packages/api/src/expand.ts')}) faz isso em sessenta linhas com o pacote [rrule](https://github.com/jkbrzt/rrule) e, como todo o código do Ember, está em domínio público para copiar:`,
      ),
      code: expandSnippet,
      notes: [
        l(
          "A bundler takes it as it is. Plain Node finds no named exports in rrule: write `import rrule from 'rrule'` and `const { RRule, RRuleSet } = rrule`.",
          "Um bundler o aceita como está. No Node puro, o rrule não tem exports nomeados: escreva `import rrule from 'rrule'` e `const { RRule, RRuleSet } = rrule`.",
        ),
        l(
          'Where no structured schedule is on record (`hasStructuredSchedule` is false), the parish’s own wording is in `texts`, as it was published.',
          'Quando não há horário estruturado registrado (`hasStructuredSchedule` é falso), o texto da própria paróquia está em `texts`, como foi publicado.',
        ),
      ],
    },
    labels: {
      parameters: l('Parameters', 'Parâmetros'),
      requestBody: l('Request body', 'Corpo da requisição'),
      responses: l('Responses', 'Respostas'),
      required: l('required', 'obrigatório'),
      tryIt: l('Try it', 'Experimente'),
      send: l('Send', 'Enviar'),
      copy: l('Copy', 'Copiar'),
      shell: l('Shell', 'Terminal'),
      example: l('Example', 'Exemplo'),
    },
  }
}
