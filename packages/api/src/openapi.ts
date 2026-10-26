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
  Error: object({ error: { type: 'string' } }),
  // @hono/zod-validator's own answer: `message` is the zod issue list, serialized.
  ValidationError: object({
    success: { const: false },
    error: object({ name: { const: 'ZodError' }, message: { type: 'string' } }),
  }),
})

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
  description: 'The church id, a slug of its name and city',
  schema: { type: 'string' },
}
const invalid = json(ref('ValidationError'), 'A parameter or the body failed validation')
const rateLimited = json(ref('Error'), 'Too many writes from this client: `rate_limited`')
const clientId = {
  name: 'X-Client-Id',
  in: 'header',
  required: false,
  description: 'A stable id for your installation, folded with the IP into the rate-limit key',
  schema: { type: 'string' },
}

export function openApiDocument(serverUrl: string) {
  const schemas = componentSchemas()
  return {
    openapi: '3.1.0',
    info: {
      title: 'Ember Mass times',
      version: '1',
      description:
        'Churches with their Mass, confession and adoration times. Reads are public and cacheable; writes queue a suggestion for a moderator and never change the directory directly.',
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: 'Churches', description: 'Public reads' },
      { name: 'Suggestions', description: 'Rate-limited writes, reviewed before they apply' },
    ],
    paths: {
      '/churches/near': {
        get: {
          tags: ['Churches'],
          summary: 'Churches near a point',
          description:
            'Churches within `radiusKm` of a point, nearest first. A `kind` or `rite` filter trims each church’s services and drops churches left with none.',
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
          summary: 'Search by name, or read a map viewport',
          description:
            'Give `q` to search by name, or `bbox` for the churches in a map viewport. A viewport too wide to list answers with `clusters`, counted by geohash cell.',
          parameters: parameters('query', churchesQuerySchema),
          responses: {
            200: json(
              object({ churches: arrayOf(ref('Church')), clusters: arrayOf(ref('Cluster')) }, [
                'churches',
              ]),
              '`{ churches }` for a search, `{ churches, clusters }` for a viewport',
            ),
            400: invalid,
          },
        },
      },
      '/churches/index': {
        get: {
          tags: ['Churches'],
          summary: 'The whole directory, a page at a time',
          description:
            'Every church in id order, with the few fields a sitemap needs. Pass the `next` of one page as the `after` of the next; a page without `next` is the last.',
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
          summary: 'A map tile',
          description:
            'A five-character cell answers with its churches (without texts and links); a shorter one, or `root`, with the counts of the cells inside it. Cached for an hour.',
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
              '`{ churches }` for a full-length cell, `{ cells }` above it',
            ),
            400: invalid,
          },
        },
      },
      '/churches/{id}': {
        get: {
          tags: ['Churches'],
          summary: 'One church',
          description:
            'A church with its schedule, texts and links, the parish it belongs to and the chapels it serves.',
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
            404: json(ref('Error'), 'No church has this id: `not_found`'),
          },
        },
      },
      '/churches/{id}/verifications': {
        get: {
          tags: ['Churches'],
          summary: 'Confirmations of a church’s times',
          description: 'When people confirmed the times on record, newest first.',
          parameters: [churchId, ...parameters('query', verificationsQuerySchema)],
          responses: {
            200: json(object({ verifications: arrayOf(ref('Verification')) })),
            400: invalid,
          },
        },
      },
      '/churches/{id}/verify': {
        post: {
          tags: ['Suggestions'],
          summary: 'Confirm the times on record',
          description:
            'Counts once per client and church in 30 days; a repeat answers `deduped: true` and records nothing.',
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
          summary: 'Suggest a correction',
          description:
            'Queues a change to a service or to the church, a new service, a closure, or a note, for a moderator. `kind` decides the shape of the rest.',
          parameters: [churchId, clientId],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: jsonSchema(correctionBodySchema) } },
          },
          responses: {
            201: json(object({ id: { type: 'string' } }), 'Queued'),
            400: invalid,
            429: rateLimited,
          },
        },
      },
      '/churches/{id}/corrections/attachments': {
        post: {
          tags: ['Suggestions'],
          summary: 'Attach a photo to a correction',
          description:
            'The raw bytes of one file of at most 1 MB, such as a photo of the bulletin. Send the returned `key` in the correction’s `attachmentKeys`.',
          parameters: [churchId, clientId],
          requestBody: {
            required: true,
            content: { '*/*': { schema: { type: 'string', format: 'binary' } } },
          },
          responses: {
            201: json(object({ key: { type: 'string' } }), 'Stored'),
            400: json(ref('Error'), 'An empty body: `empty_body`'),
            413: json(ref('Error'), 'Larger than 1 MB: `too_large`'),
            429: rateLimited,
          },
        },
      },
      '/health': {
        get: {
          summary: 'Liveness',
          responses: { 200: json(object({ ok: { type: 'boolean' } })) },
        },
      },
    },
    components: { schemas },
  }
}

export type OpenApiDocument = ReturnType<typeof openApiDocument>
