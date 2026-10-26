import { openApiDocument } from '@ember/api'
import type { APIRoute } from 'astro'
import { massTimesApi } from '~/lib/massTimes/data'

// The Mass-times API for code generators and API clients (Postman, Bruno, openapi-generator).
export const GET: APIRoute = () =>
  new Response(JSON.stringify(openApiDocument(massTimesApi), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
