import { getTableColumns } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { z } from 'zod'
import {
  church,
  churchLinkSchema,
  churchTextSchema,
  serviceSchema,
  verificationEvent,
} from './schema'
import {
  changesQuerySchema,
  churchesQuerySchema,
  churchIndexQuerySchema,
  correctionBodySchema,
  nearQuerySchema,
  tileParamSchema,
  tileQuerySchema,
  verificationsQuerySchema,
  verifyBodySchema,
} from './validators'

// The Mass-times API as an OpenAPI 3.1 document, built from the zod schemas the backend validates
// with and the tables it reads, so the published reference cannot describe a parameter or a field
// the Worker doesn't have. apps/backend's tests hold the path list to the Worker's routes.

type JsonSchema = Record<string, unknown>

// Query params arrive as strings and are coerced, so the schema a caller writes to is the input one.
function jsonSchema(schema: z.ZodType): JsonSchema {
  const { $schema: _, ...rest } = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' })
  return rest
}

function parameters(where: 'query' | 'path', schema: z.ZodType) {
  const { properties = {}, required = [] } = jsonSchema(schema) as {
    properties?: Record<string, JsonSchema>
    required?: string[]
  }
  return Object.entries(properties).map(([name, { description, ...property }]) => ({
    name,
    in: where,
    required: where === 'path' || required.includes(name),
    ...(description ? { description } : {}),
    schema: property,
  }))
}

const columnTypes: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
}

// A row as the API serves it: every column under its TypeScript name, null where it may be empty.
// JSON columns name their item schema in `json`.
function rowSchema(table: SQLiteTable, json: Record<string, JsonSchema> = {}): JsonSchema {
  const columns = Object.entries(getTableColumns(table))
  return {
    type: 'object',
    properties: Object.fromEntries(
      columns.map(([name, column]) => {
        const type = json[name] ?? { type: columnTypes[column.dataType] ?? 'string' }
        return [name, column.notNull ? type : { anyOf: [type, { type: 'null' }] }]
      }),
    ),
    required: columns.map(([name]) => name),
  }
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` })
const arrayOf = (items: JsonSchema) => ({ type: 'array', items })
const object = (properties: Record<string, JsonSchema>, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  required,
})

const componentSchemas = () => ({
  Church: rowSchema(church, {
    services: arrayOf(ref('Service')),
    texts: arrayOf(ref('ChurchText')),
    links: arrayOf(ref('ChurchLink')),
  }),
  Service: jsonSchema(serviceSchema),
  ChurchText: jsonSchema(churchTextSchema),
  ChurchLink: jsonSchema(churchLinkSchema),
  ChurchKin: object({ id: { type: 'string' }, name: { type: 'string' } }),
  Cluster: object(
    {
      id: { type: 'string', description: 'The geohash cell' },
      lat: { type: 'number' },
      lng: { type: 'number' },
      count: { type: 'integer' },
      church: { ...ref('ChurchKin'), description: 'Named when the cell holds one church' },
    },
    ['id', 'lat', 'lng', 'count'],
  ),
  Verification: rowSchema(verificationEvent),
  // A change line: `before` is missing for something new, `after` for something removed.
  ChangeLine: object(
    { label: { type: 'string' }, before: { type: 'string' }, after: { type: 'string' } },
    ['label'],
  ),
  ChangedChurch: object(
    {
      id: { type: 'string' },
      name: { type: 'string' },
      isNew: { type: 'boolean', description: 'Created by this change' },
      parish: { ...ref('ChurchKin'), description: 'The parish this church is a chapel of' },
      place: { type: 'string' },
      lat: { type: 'number' },
      lng: { type: 'number' },
      changes: arrayOf(ref('ChangeLine')),
      schedule: arrayOf(
        object({
          kind: { type: 'string' },
          label: { type: 'string' },
          times: arrayOf({ type: 'string' }),
        }),
      ),
    },
    ['id', 'name', 'isNew', 'place', 'lat', 'lng', 'changes', 'schedule'],
  ),
  Error: object({ error: { type: 'string' } }),
  // @hono/zod-validator's own answer: `message` is the zod issue list, serialized.
  ValidationError: object({
    success: { const: false },
    error: object({ name: { const: 'ZodError' }, message: { type: 'string' } }),
  }),
})

/**
 * The document in English (`openapi.json`), or with its prose in Portuguese for the portal's
 * Portuguese pages. Field and parameter glosses come from the zod schemas and stay in English.
 */
export function openApiDocument(serverUrl: string, lang: 'en' | 'pt' = 'en') {
  const l = (en: string, pt: string) => (lang === 'pt' ? pt : en)
  const schemas = componentSchemas()
  const json = (schema: JsonSchema, description = 'OK') => ({
    description,
    content: { 'application/json': { schema } },
  })
  const churchList = (extra: Record<string, JsonSchema> = {}) =>
    json(object({ churches: arrayOf({ allOf: [ref('Church'), object(extra)] }) }))
  const churchId = {
    name: 'id',
    in: 'path',
    required: true,
    description: l(
      'The church id, a slug of its name and city',
      'O id da igreja, feito do nome e da cidade',
    ),
    schema: { type: 'string' },
  }
  const invalid = json(
    ref('ValidationError'),
    l(
      'A parameter or the body failed validation',
      'Um parâmetro ou o corpo não passou na validação',
    ),
  )
  const rateLimited = json(
    ref('Error'),
    l(
      'Too many writes from this client: `rate_limited`',
      'Escritas demais deste cliente: `rate_limited`',
    ),
  )
  const clientId = {
    name: 'X-Client-Id',
    in: 'header',
    required: false,
    description: l(
      'A stable id per device or person; with the IP, it identifies the client for the rate limit and for confirmations',
      'Um id fixo por aparelho ou pessoa; junto com o IP, identifica o cliente para o limite de escritas e para as confirmações',
    ),
    schema: { type: 'string' },
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Ember Mass times',
      version: '1',
      description: l(
        'Churches with their Mass, confession and adoration times. Reads are public and cacheable; writes queue a suggestion for a moderator and never change the directory directly.',
        'Igrejas com seus horários de Missa, confissão e adoração. As leituras são públicas e podem ir para o cache; uma escrita entra na fila de um moderador e nunca altera o diretório diretamente.',
      ),
    },
    servers: [{ url: serverUrl }],
    // `x-displayName` names a tag for readers (Redoc's convention); `name` is its key.
    tags: [
      {
        name: 'Churches',
        'x-displayName': l('Churches', 'Igrejas'),
        description: l('Public reads', 'Leituras públicas'),
      },
      {
        name: 'Changes',
        'x-displayName': l('Changes', 'Mudanças'),
        description: l(
          'What the moderators changed, for directories that keep in step',
          'O que os moderadores mudaram, para diretórios que acompanham',
        ),
      },
      {
        name: 'Suggestions',
        'x-displayName': l('Suggestions', 'Sugestões'),
        description: l(
          'Rate-limited writes, reviewed before they apply',
          'Escritas com limite de frequência, revisadas antes de valer',
        ),
      },
    ],
    paths: {
      '/churches/near': {
        get: {
          tags: ['Churches'],
          summary: l('Churches near a point', 'Igrejas perto de um ponto'),
          description: l(
            'Churches within `radiusKm` of a point, nearest first. A `kind` or `rite` filter trims each church’s services and drops churches left with none.',
            'Igrejas a até `radiusKm` de um ponto, da mais próxima à mais distante. Um filtro de `kind` ou `rite` restringe os horários de cada igreja e tira as que ficam sem nenhum.',
          ),
          parameters: parameters('query', nearQuerySchema),
          responses: {
            200: churchList({ distanceKm: { type: 'number' } }),
            400: invalid,
          },
        },
      },
      '/churches': {
        get: {
          tags: ['Churches'],
          summary: l(
            'Search by name, or read a map viewport',
            'Buscar pelo nome, ou ler a área de um mapa',
          ),
          description: l(
            'Give `q` to search by name, or `bbox` for the churches in a map viewport. A viewport too wide to list answers with `clusters`, counted by geohash cell.',
            'Passe `q` para buscar pelo nome, ou `bbox` para as igrejas na área visível de um mapa. Uma área grande demais para listar responde com `clusters`, contados por célula de geohash.',
          ),
          parameters: parameters('query', churchesQuerySchema),
          responses: {
            200: json(
              object({ churches: arrayOf(ref('Church')), clusters: arrayOf(ref('Cluster')) }, [
                'churches',
              ]),
              l(
                '`{ churches }` for a search, `{ churches, clusters }` for a viewport',
                '`{ churches }` para uma busca, `{ churches, clusters }` para uma área do mapa',
              ),
            ),
            400: invalid,
          },
        },
      },
      '/churches/index': {
        get: {
          tags: ['Churches'],
          summary: l(
            'The whole directory, a page at a time',
            'O diretório inteiro, uma página por vez',
          ),
          description: l(
            'Every church in id order, with the few fields a sitemap needs. Pass the `next` of one page as the `after` of the next; a page without `next` is the last.',
            'Todas as igrejas na ordem do id, com os poucos campos de que um sitemap precisa. Passe o `next` de uma página como o `after` da seguinte; uma página sem `next` é a última.',
          ),
          parameters: parameters('query', churchIndexQuerySchema),
          responses: {
            200: json(
              object(
                {
                  churches: arrayOf(
                    object(
                      Object.fromEntries(
                        [
                          'id',
                          'name',
                          'longName',
                          'city',
                          'region',
                          'countryCode',
                          'hasStructuredSchedule',
                          'updatedAt',
                        ].map((k) => [
                          k,
                          (schemas.Church.properties as Record<string, JsonSchema>)[k],
                        ]),
                      ),
                    ),
                  ),
                  next: { type: 'string' },
                },
                ['churches'],
              ),
            ),
            400: invalid,
          },
        },
      },
      '/churches/tiles/{cell}': {
        get: {
          tags: ['Churches'],
          summary: l('A map tile', 'Um bloco do mapa'),
          description: l(
            'A five-character cell answers with its churches (without texts and links); a shorter one, or `root`, with the counts of the cells inside it. Cached for an hour.',
            'Uma célula de cinco caracteres responde com suas igrejas (sem textos e links); uma mais curta, ou `root`, com a contagem das células dentro dela. Fica uma hora em cache.',
          ),
          parameters: [
            ...parameters('path', tileParamSchema),
            ...parameters('query', tileQuerySchema),
          ],
          responses: {
            200: json(
              {
                oneOf: [
                  object({ churches: arrayOf(ref('Church')) }),
                  object({ cells: arrayOf(ref('Cluster')) }),
                ],
              },
              l(
                '`{ churches }` for a full-length cell, `{ cells }` above it',
                '`{ churches }` para uma célula completa, `{ cells }` acima dela',
              ),
            ),
            400: invalid,
          },
        },
      },
      '/churches/{id}': {
        get: {
          tags: ['Churches'],
          summary: l('One church', 'Uma igreja'),
          description: l(
            'A church with its schedule, texts and links, the parish it belongs to and the chapels it serves.',
            'Uma igreja com seus horários, textos e links, a paróquia a que pertence e as capelas que atende.',
          ),
          parameters: [churchId],
          responses: {
            200: json({
              allOf: [
                ref('Church'),
                object({ parish: ref('ChurchKin'), chapels: arrayOf(ref('ChurchKin')) }, [
                  'chapels',
                ]),
              ],
            }),
            404: json(
              ref('Error'),
              l('No church has this id: `not_found`', 'Nenhuma igreja tem este id: `not_found`'),
            ),
          },
        },
      },
      '/churches/{id}/verifications': {
        get: {
          tags: ['Churches'],
          summary: l(
            'Confirmations of a church’s times',
            'Confirmações dos horários de uma igreja',
          ),
          description: l(
            'When people confirmed the times on record, newest first.',
            'Quando as pessoas confirmaram os horários registrados, da mais recente à mais antiga.',
          ),
          parameters: [churchId, ...parameters('query', verificationsQuerySchema)],
          responses: {
            200: json(object({ verifications: arrayOf(ref('Verification')) })),
            400: invalid,
          },
        },
      },
      '/changes': {
        get: {
          tags: ['Changes'],
          summary: l('The change log', 'O registro de mudanças'),
          description: l(
            'Every change a moderator applied to the directory and that still stands, newest first. Each church it touched comes with what changed and its schedule as it now stands, and `message` says the same as plain text, ready to pass on. Pass the `next` of one page as the `before` of the next; to keep in step, ask with `since` set to the newest `appliedAt` you hold.',
            'Cada mudança que um moderador aplicou ao diretório e que continua valendo, da mais recente à mais antiga. Cada igreja atingida vem com o que mudou e seus horários como estão agora, e `message` diz o mesmo em texto simples, pronta para repassar. Passe o `next` de uma página como o `before` da seguinte; para acompanhar, peça com `since` igual ao `appliedAt` mais recente que você tem.',
          ),
          parameters: parameters('query', changesQuerySchema),
          responses: {
            200: json(
              object(
                {
                  changes: arrayOf(
                    object({
                      id: { type: 'string' },
                      appliedAt: { type: 'string', format: 'date-time' },
                      churches: arrayOf(ref('ChangedChurch')),
                      message: {
                        type: 'string',
                        description: 'The change as plain text, ready to email',
                      },
                    }),
                  ),
                  next: { type: 'string' },
                },
                ['changes'],
              ),
            ),
            400: invalid,
          },
        },
      },
      '/churches/{id}/verify': {
        post: {
          tags: ['Suggestions'],
          summary: l('Confirm the times on record', 'Confirmar os horários registrados'),
          description: l(
            'Counts once per client and church in 30 days; a repeat answers `deduped: true` and records nothing.',
            'Conta uma vez por cliente e igreja a cada 30 dias; uma repetição responde `deduped: true` e não registra nada.',
          ),
          parameters: [churchId, clientId],
          requestBody: {
            content: { 'application/json': { schema: jsonSchema(verifyBodySchema) } },
          },
          responses: {
            200: json(object({ deduped: { type: 'boolean' } })),
            400: invalid,
            429: rateLimited,
          },
        },
      },
      '/churches/{id}/corrections': {
        post: {
          tags: ['Suggestions'],
          summary: l('Suggest a correction', 'Sugerir uma correção'),
          description: l(
            'Queues a change to a service or to the church, a new service, a closure, or a note, for a moderator. `kind` decides the shape of the rest.',
            'Põe na fila de um moderador uma mudança num horário ou na igreja, um novo horário, um fechamento ou uma observação. `kind` define a forma do restante.',
          ),
          parameters: [churchId, clientId],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: jsonSchema(correctionBodySchema) } },
          },
          responses: {
            201: json(object({ id: { type: 'string' } }), l('Queued', 'Na fila')),
            400: invalid,
            429: rateLimited,
          },
        },
      },
      '/churches/{id}/corrections/attachments': {
        post: {
          tags: ['Suggestions'],
          summary: l('Attach a photo to a correction', 'Anexar uma foto a uma correção'),
          description: l(
            'The raw bytes of one file of at most 1 MB, such as a photo of the bulletin. Send the returned `key` in the correction’s `attachmentKeys`.',
            'Os bytes de um arquivo de até 1 MB, como a foto do boletim. Envie a `key` devolvida nos `attachmentKeys` da correção.',
          ),
          parameters: [churchId, clientId],
          requestBody: {
            required: true,
            content: { '*/*': { schema: { type: 'string', format: 'binary' } } },
          },
          responses: {
            201: json(object({ key: { type: 'string' } }), l('Stored', 'Guardado')),
            400: json(ref('Error'), l('An empty body: `empty_body`', 'Corpo vazio: `empty_body`')),
            413: json(
              ref('Error'),
              l('Larger than 1 MB: `too_large`', 'Maior que 1 MB: `too_large`'),
            ),
            429: rateLimited,
          },
        },
      },
      '/health': {
        get: {
          summary: l('Liveness', 'Verificação de funcionamento'),
          responses: { 200: json(object({ ok: { type: 'boolean' } })) },
        },
      },
    },
    components: { schemas },
  }
}

export type OpenApiDocument = ReturnType<typeof openApiDocument>
